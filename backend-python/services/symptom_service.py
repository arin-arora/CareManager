import json
from fastapi import HTTPException
from models.schemas import SymptomIntake, PredictionResult, ConditionPrediction
from services.groq_client import groq_client, STRICT_AI_MODE
from utils.cache import generate_cache_key, get_cached_response, set_cached_response

RED_FLAGS = {
    "chest pain": "Potential cardiac event. Seek immediate emergency medical care.",
    "difficulty breathing": "Potential respiratory failure. Seek immediate emergency medical care.",
    "shortness of breath": "Potential respiratory issues. Seek immediate emergency medical care.",
    "severe headache": "Could indicate neurological issue. If sudden and severe, seek emergency care.",
    "numbness": "Potential neurological issue or stroke sign. Seek immediate medical attention.",
    "weakness on one side": "Potential stroke indicator. Call emergency services immediately.",
    "loss of speech": "Potential stroke indicator. Call emergency services immediately.",
    "confusion": "Potential neurological issue, infection, or stroke. Seek urgent care."
}

def predict_symptoms_logic(intake: SymptomIntake) -> PredictionResult:
    # Rule-based emergency check takes priority
    triggered_flags = []
    warning_msg = None
    combined_text = (intake.notes + " " + " ".join(intake.symptoms)).lower()
    for flag, warning in RED_FLAGS.items():
        if flag in combined_text:
            triggered_flags.append(flag)
            if not warning_msg:
                warning_msg = warning
                
    if warning_msg:
        return PredictionResult(
            conditions=[ConditionPrediction(name="Emergency Medical Condition", confidence=1.0)],
            urgency_level="Emergency",
            suggested_specialist="Emergency Medicine Physician",
            home_care_notes="Do not attempt home care. Call emergency services (e.g., 911) immediately.",
            red_flags_triggered=triggered_flags,
            critical_warning=warning_msg,
            recommended_tests=["Electrocardiogram (ECG)", "Complete Blood Count", "CT Scan (if neurological)"],
            emergency_recommendation=True
        )

    # Generate cache key
    symptoms_serialized = ",".join(sorted(intake.symptoms))
    payload_str = f"symptoms={symptoms_serialized}&duration={intake.duration}&age={intake.age}&notes={intake.notes}"
    cache_key = generate_cache_key("symptom", payload_str)
    
    cached = get_cached_response(cache_key)
    if cached:
        print(f"Redis cache hit for key: {cache_key}")
        conditions = [
            ConditionPrediction(name=c.get("name", "Unknown"), confidence=float(c.get("confidence", 0.5)))
            for c in cached.get("conditions", [])
        ]
        return PredictionResult(
            conditions=conditions,
            urgency_level=cached.get("urgency_level", "Routine"),
            suggested_specialist=cached.get("suggested_specialist", "General Practitioner"),
            home_care_notes=cached.get("home_care_notes", "Rest and hydrate."),
            red_flags_triggered=cached.get("red_flags_triggered", []),
            critical_warning=cached.get("critical_warning"),
            recommended_tests=cached.get("recommended_tests", []),
            emergency_recommendation=cached.get("emergency_recommendation", False)
        )

    print(f"Redis cache miss for key: {cache_key}")

    # Check for client configuration
    if not groq_client:
        if STRICT_AI_MODE:
            raise HTTPException(status_code=400, detail="Groq API Key is not configured on the server.")
        result_dict = _get_mock_symptom_prediction_dict(intake)
    else:
        try:
            prompt = f"""
            You are a medical triage assistant. Analyze the following patient symptoms and details:
            - Symptoms: {", ".join(intake.symptoms)}
            - Duration: {intake.duration}
            - Age: {intake.age if intake.age else "Not specified"}
            - Additional Notes: {intake.notes}

            Analyze the inputs and predict the top 1-3 differential diagnoses. For each:
            - Provide condition name and confidence level (float between 0.0 and 1.0).
            - Identify urgency level ('Routine', 'Urgent', or 'Emergency').
            - List red flags triggered.
            - Provide home care recommendations.
            - Suggest a specialist to consult.
            - List recommended diagnostic/laboratory tests.
            - Determine if emergency medical services are needed (emergency_recommendation).

            Your output MUST be a JSON object with this EXACT structure:
            {{
              "conditions": [
                {{ "name": "Condition Name", "confidence": 0.85 }}
              ],
              "urgency_level": "Routine" or "Urgent" or "Emergency",
              "suggested_specialist": "Specialist Name",
              "home_care_notes": "Home care tips...",
              "red_flags_triggered": ["List of warning signs..."],
              "recommended_tests": ["List of recommended lab tests..."],
              "emergency_recommendation": false
            }}
            """
            import time
            from utils.metrics import record_request
            start_time = time.time()
            chat_completion = groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a medical assistant that outputs ONLY raw JSON. Do not wrap in markdown code blocks (```json) or include extra text."},
                    {"role": "user", "content": prompt}
                ],
                model="qwen/qwen3.6-27b",
                response_format={"type": "json_object"},
                max_tokens=4096
            )
            latency = time.time() - start_time
            record_request(latency, success=True)
            response_text = chat_completion.choices[0].message.content
            data = json.loads(response_text)
            
            result_dict = {
                "conditions": data.get("conditions", []),
                "urgency_level": data.get("urgency_level", "Routine"),
                "suggested_specialist": data.get("suggested_specialist", "General Practitioner"),
                "home_care_notes": data.get("home_care_notes", "Rest and hydrate."),
                "red_flags_triggered": data.get("red_flags_triggered", []),
                "critical_warning": None,
                "recommended_tests": data.get("recommended_tests", []),
                "emergency_recommendation": data.get("emergency_recommendation", False)
            }
        except Exception as e:
            latency = time.time() - start_time if 'start_time' in locals() else 0.0
            from utils.metrics import record_request
            record_request(latency, success=False, error=str(e))
            print(f"Error querying Groq for symptoms: {e}")
            if STRICT_AI_MODE:
                raise HTTPException(status_code=500, detail=f"Groq API Error: {str(e)}")
            result_dict = _get_mock_symptom_prediction_dict(intake)

    # Save to Redis cache
    set_cached_response(cache_key, result_dict, expire=86400)

    # Map output dict to Pydantic model
    conditions = [
        ConditionPrediction(name=c.get("name", "Unknown"), confidence=float(c.get("confidence", 0.5)))
        for c in result_dict.get("conditions", [])
    ]
    return PredictionResult(
        conditions=conditions,
        urgency_level=result_dict.get("urgency_level", "Routine"),
        suggested_specialist=result_dict.get("suggested_specialist", "General Practitioner"),
        home_care_notes=result_dict.get("home_care_notes", "Rest and hydrate."),
        red_flags_triggered=result_dict.get("red_flags_triggered", []),
        critical_warning=result_dict.get("critical_warning"),
        recommended_tests=result_dict.get("recommended_tests", []),
        emergency_recommendation=result_dict.get("emergency_recommendation", False)
    )

def _get_mock_symptom_prediction_dict(intake: SymptomIntake) -> dict:
    symptoms_lower = [s.lower() for s in intake.symptoms]
    notes_lower = intake.notes.lower()
    combined = symptoms_lower + [notes_lower]
    
    # 1. Cold/Flu
    if any(any(x in text for x in ["cough", "fever", "throat"]) for text in combined):
        cond = [{"name": "Common Cold", "confidence": 0.8}, {"name": "Influenza (Flu)", "confidence": 0.5}]
        specialist = "General Practitioner / Family Physician"
        home_care = "Rest, stay hydrated, over-the-counter pain relievers/decongestants if appropriate."
        urgency = "Routine"
        tests = ["Influenza A/B Rapid Test", "Sputum Culture"]
    # 2. Gastroenteritis
    elif any(any(x in text for x in ["stomach", "nausea", "vomit", "diarrhea"]) for text in combined):
        cond = [{"name": "Gastroenteritis (Stomach Flu)", "confidence": 0.85}]
        specialist = "Gastroenterologist / Family Physician"
        home_care = "Hydration with electrolytes, oral rehydration solutions, bland diet (BRAT diet)."
        urgency = "Routine"
        tests = ["Stool Culture", "Electrolyte Panel"]
    # 3. Tension Headache
    elif any(any(x in text for x in ["headache", "migraine"]) for text in combined):
        cond = [{"name": "Tension Headache", "confidence": 0.75}, {"name": "Migraine", "confidence": 0.4}]
        specialist = "Neurologist / Primary Care Physician"
        home_care = "Rest in a quiet, dark room, over-the-counter pain relievers, stress management."
        urgency = "Routine"
        tests = ["MRI Brain (if persistent)", "Blood Pressure Monitoring"]
    else:
        cond = [{"name": "Mild General Symptom", "confidence": 0.6}]
        specialist = "Primary Care Physician"
        home_care = "Monitor symptoms. Rest and hydrate. Consult doctor if symptoms persist."
        urgency = "Routine"
        tests = ["Basic Metabolic Panel"]
        
    return {
        "conditions": cond,
        "urgency_level": urgency,
        "suggested_specialist": specialist,
        "home_care_notes": home_care,
        "red_flags_triggered": [],
        "critical_warning": None,
        "recommended_tests": tests,
        "emergency_recommendation": False
    }
