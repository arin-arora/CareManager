import dotenv from 'dotenv';

dotenv.config();

export interface PreVisitAIResult {
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  chiefComplaint: string;
  suggestedQuestions: string[];
}

export interface PostVisitAIResult {
  patientFriendlySummary: string;
  medicationSchedule: Array<{
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    timing: string;
  }>;
  followUpSteps: string;
}

export const aiService = {
  /**
   * Generates a pre-visit summary from symptoms.
   */
  generatePreVisitSummary: async (symptoms: string): Promise<PreVisitAIResult> => {
    const provider = (process.env.LLM_PROVIDER || 'GROQ').toUpperCase();
    const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || '';
    const strictMode = process.env.STRICT_AI_MODE === 'true';

    if (provider === 'MOCK' || !apiKey) {
      if (strictMode && provider !== 'MOCK') {
        throw new Error('LLM API key is missing, and STRICT_AI_MODE is enabled.');
      }
      return getMockPreVisitSummary(symptoms);
    }

    const systemPrompt = `You are a medical triage assistant. You must analyze the patient's symptoms and return a structured JSON response.
Do NOT include any conversation, conversational wrapping, or explanation outside the JSON.
Do NOT present the urgency as a formal medical diagnosis, and keep questions relevant.

The JSON response MUST match this structure exactly:
{
  "urgency": "LOW" | "MEDIUM" | "HIGH",
  "chiefComplaint": "A short sentence describing the main complaint.",
  "suggestedQuestions": [
    "Suggested question 1 for the doctor",
    "Suggested question 2 for the doctor",
    "Suggested question 3 for the doctor"
  ]
}`;

    const userPrompt = `Patient symptoms: "${symptoms}"`;

    let rawText = '';
    try {
      if (provider === 'GEMINI') {
        rawText = await callGeminiAPI(apiKey, systemPrompt, userPrompt);
      } else {
        rawText = await callGroqAPI(apiKey, systemPrompt, userPrompt);
      }
    } catch (err: any) {
      throw new Error(`LLM provider API call failed: ${err.message}`);
    }

    const parsed = attemptSafeJSONParse(rawText);
    if (!parsed) {
      throw new Error('LLM returned malformed/unparseable JSON');
    }

    // Validate fields strictly
    const urgency = String(parsed.urgency || '').toUpperCase();
    if (!['LOW', 'MEDIUM', 'HIGH'].includes(urgency)) {
      throw new Error(`AI output validation failed: Invalid urgency value "${parsed.urgency}"`);
    }

    if (!parsed.chiefComplaint || typeof parsed.chiefComplaint !== 'string' || parsed.chiefComplaint.trim() === '') {
      throw new Error('AI output validation failed: chiefComplaint is missing or invalid');
    }

    if (!Array.isArray(parsed.suggestedQuestions) || parsed.suggestedQuestions.length < 3) {
      throw new Error('AI output validation failed: suggestedQuestions must contain at least 3 items');
    }

    return {
      urgency: urgency as 'LOW' | 'MEDIUM' | 'HIGH',
      chiefComplaint: parsed.chiefComplaint.trim(),
      suggestedQuestions: parsed.suggestedQuestions.map((q: any) => String(q).trim())
    };
  },

  /**
   * Generates a patient-friendly post-visit summary.
   */
  generatePostVisitSummary: async (notes: string, prescription: any, followUpInfo: string): Promise<PostVisitAIResult> => {
    const provider = (process.env.LLM_PROVIDER || 'GROQ').toUpperCase();
    const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || '';
    const strictMode = process.env.STRICT_AI_MODE === 'true';

    if (provider === 'MOCK' || !apiKey) {
      if (strictMode && provider !== 'MOCK') {
        throw new Error('LLM API key is missing, and STRICT_AI_MODE is enabled.');
      }
      return getMockPostVisitSummary(notes, prescription, followUpInfo);
    }

    const systemPrompt = `You are a medical assistant helping a patient understand their visit summary.
You must translate the doctor's clinical notes, prescription details, and follow-up info into a patient-friendly JSON response.
Do NOT include any extra text outside the JSON. Include warning context that this is an AI-assisted summary.

The JSON response MUST match this structure exactly:
{
  "patientFriendlySummary": "A friendly explanation of the visit/notes. Always state: This is an AI-assisted summary and does not replace your doctor's official advice.",
  "medicationSchedule": [
    {
      "medicineName": "Name of medication",
      "dosage": "Dosage details",
      "frequency": "Frequency",
      "duration": "Duration",
      "instructions": "Additional instructions",
      "timing": "Recommended timing (e.g. Morning, Night, Before meals)"
    }
  ],
  "followUpSteps": "Actionable follow-up steps."
}`;

    const prescriptionStr = typeof prescription === 'string' ? prescription : JSON.stringify(prescription);
    const userPrompt = `Doctor Notes: "${notes}"\nPrescriptions: "${prescriptionStr}"\nFollow-up: "${followUpInfo}"`;

    let rawText = '';
    try {
      if (provider === 'GEMINI') {
        rawText = await callGeminiAPI(apiKey, systemPrompt, userPrompt);
      } else {
        rawText = await callGroqAPI(apiKey, systemPrompt, userPrompt);
      }
    } catch (err: any) {
      throw new Error(`LLM provider API call failed: ${err.message}`);
    }

    const parsed = attemptSafeJSONParse(rawText);
    if (!parsed) {
      throw new Error('LLM returned malformed/unparseable JSON');
    }

    if (!parsed.patientFriendlySummary || typeof parsed.patientFriendlySummary !== 'string' || parsed.patientFriendlySummary.trim() === '') {
      throw new Error('AI output validation failed: patientFriendlySummary is missing or invalid');
    }

    if (!Array.isArray(parsed.medicationSchedule)) {
      throw new Error('AI output validation failed: medicationSchedule must be an array');
    }

    if (!parsed.followUpSteps || typeof parsed.followUpSteps !== 'string' || parsed.followUpSteps.trim() === '') {
      throw new Error('AI output validation failed: followUpSteps is missing or invalid');
    }

    // Standardize medication list
    const medications = parsed.medicationSchedule.map((med: any) => ({
      medicineName: String(med.medicineName || 'Medication').trim(),
      dosage: String(med.dosage || 'As prescribed').trim(),
      frequency: String(med.frequency || 'Once daily').trim(),
      duration: String(med.duration || 'As prescribed').trim(),
      instructions: String(med.instructions || '').trim(),
      timing: String(med.timing || 'As scheduled').trim()
    }));

    return {
      patientFriendlySummary: parsed.patientFriendlySummary.trim(),
      medicationSchedule: medications,
      followUpSteps: parsed.followUpSteps.trim()
    };
  }
};

/**
 * Strips markdown code fences (e.g. ```json ... ```) and extracts raw JSON.
 */
function attemptSafeJSONParse(text: string): any {
  let cleaned = text.trim();
  
  // Remove markdown code fences
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '');
    cleaned = cleaned.replace(/\n?```$/, '');
    cleaned = cleaned.trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Attempt parsing via substring matching if LLM wrapped it in text
    try {
      const startIdx = cleaned.indexOf('{');
      const endIdx = cleaned.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        const sliced = cleaned.slice(startIdx, endIdx + 1);
        return JSON.parse(sliced);
      }
    } catch (_) {}
    return null;
  }
}

/**
 * Call Groq API via standard fetch
 */
async function callGroqAPI(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const model = process.env.LLM_MODEL || 'llama-3.1-8b-instant';
  
  // Set a strict 15s timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      throw new Error(`HTTP Error ${res.status}: ${errorText}`);
    }

    const data: any = await res.json();
    return data?.choices?.[0]?.message?.content || '';
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Call Gemini API via standard fetch
 */
async function callGeminiAPI(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const model = process.env.LLM_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nUser Input:\n${userPrompt}` }]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      throw new Error(`HTTP Error ${res.status}: ${errorText}`);
    }

    const data: any = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Generates mock pre-visit summary
 */
function getMockPreVisitSummary(symptoms: string): PreVisitAIResult {
  const syms = symptoms.toLowerCase();
  
  let urgency: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  let chiefComplaint = 'General consult';
  let suggestedQuestions = [
    'How long have you felt these symptoms?',
    'Does anything specific make the symptoms better or worse?',
    'Are you taking any over-the-counter medications currently?'
  ];

  if (
    syms.includes('chest pain') ||
    syms.includes('breathing') ||
    syms.includes('shortness of breath') ||
    syms.includes('numbness') ||
    syms.includes('stroke') ||
    syms.includes('weakness')
  ) {
    urgency = 'HIGH';
    chiefComplaint = 'Potential acute cardiovascular or neurological symptom';
    suggestedQuestions = [
      'When did this severe onset begin?',
      'Do you feel radiation to your neck or left arm?',
      'Have you checked your blood pressure?'
    ];
  } else if (
    syms.includes('fever') ||
    syms.includes('vomit') ||
    syms.includes('diarrhea') ||
    syms.includes('stomach') ||
    syms.includes('pain')
  ) {
    urgency = 'MEDIUM';
    chiefComplaint = 'Moderate systemic/gastrointestinal symptoms';
    suggestedQuestions = [
      'What is your highest recorded temperature?',
      'Are you able to keep fluids down?',
      'Have you travelled or eaten anything unusual recently?'
    ];
  } else if (syms.includes('cough') || syms.includes('sore throat') || syms.includes('flu') || syms.includes('cold')) {
    urgency = 'LOW';
    chiefComplaint = 'Upper respiratory infection symptoms';
    suggestedQuestions = [
      'Are you experiencing sinus pressure or headaches?',
      'Is the cough dry or productive?',
      'How are you managing your hydration and rest?'
    ];
  }

  return { urgency, chiefComplaint, suggestedQuestions };
}

/**
 * Generates mock post-visit summary
 */
function getMockPostVisitSummary(notes: string, prescription: any, followUpInfo: string): PostVisitAIResult {
  const patientFriendlySummary = `Based on your consultation, the doctor noted: "${notes}". This is an AI-assisted summary and does not replace your doctor's official advice.`;
  
  let medicationSchedule: PostVisitAIResult['medicationSchedule'] = [];
  if (Array.isArray(prescription)) {
    medicationSchedule = prescription.map((med: any) => ({
      medicineName: med.medicineName || 'Medication',
      dosage: med.dosage || 'As prescribed',
      frequency: med.frequency || 'Once daily',
      duration: med.duration || 'As directed',
      instructions: med.instructions || '',
      timing: med.frequency?.toLowerCase().includes('night') ? 'Night' : 'Morning'
    }));
  } else if (typeof prescription === 'string' && prescription.trim() !== '') {
    medicationSchedule = [
      {
        medicineName: prescription,
        dosage: 'As prescribed',
        frequency: 'Once daily',
        duration: 'As prescribed',
        instructions: '',
        timing: 'Morning'
      }
    ];
  } else {
    medicationSchedule = [
      {
        medicineName: 'Rest & Fluids',
        dosage: 'N/A',
        frequency: 'Continuous',
        duration: 'Ongoing',
        instructions: 'Drink plenty of electrolytes.',
        timing: 'Throughout the day'
      }
    ];
  }

  const followUpSteps = followUpInfo || 'Please schedule a follow-up appointment if symptoms persist.';

  return {
    patientFriendlySummary,
    medicationSchedule,
    followUpSteps
  };
}
