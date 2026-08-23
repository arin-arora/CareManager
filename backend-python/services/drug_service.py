import json
from fastapi import HTTPException
from models.schemas import DrugInteractionRequest, DrugInteractionResponse, MedicationDetails, InteractionDetail
from services.groq_client import groq_client, STRICT_AI_MODE
from utils.cache import generate_cache_key, get_cached_response, set_cached_response

def check_drug_interactions_logic(request: DrugInteractionRequest) -> DrugInteractionResponse:
    if not request.medications:
        raise HTTPException(status_code=400, detail="Medication list is empty")
        
    # Sort and normalize medication names for reliable cache matches
    sorted_meds = sorted([m.lower().strip() for m in request.medications])
    meds_serialized = ",".join(sorted_meds)
    cache_key = generate_cache_key("drug_int", meds_serialized)

    # Try fetching from cache
    cached = get_cached_response(cache_key)
    if cached:
        print(f"Redis cache hit for key: {cache_key}")
        meds = [
            MedicationDetails(
                name=m.get("name", "Unknown"),
                genericName=m.get("genericName"),
                uses=m.get("uses"),
                sideEffects=m.get("sideEffects")
            )
            for m in cached.get("medications", [])
        ]
        details = [
            InteractionDetail(
                severity=d.get("severity", "Moderate"),
                mechanism=d.get("mechanism", ""),
                clinicalEffect=d.get("clinicalEffect", ""),
                recommendation=d.get("recommendation", ""),
                alternatives=d.get("alternatives", []),
                references=d.get("references", []),
                drugsInvolved=d.get("drugsInvolved", [])
            )
            for d in cached.get("interactionDetails", [])
        ]
        return DrugInteractionResponse(
            medications=meds,
            interactions=cached.get("interactions", []),
            interactionDetails=details
        )

    print(f"Redis cache miss for key: {cache_key}")

    # Process if cache miss
    result_dict = None
    if not groq_client:
        if STRICT_AI_MODE:
            raise HTTPException(status_code=400, detail="Groq API Key is not configured on the server.")
        result_dict = _get_mock_drug_interactions_dict(request)
    else:
        try:
            prompt = f"""
            You are a medical drug safety expert. Analyze this list of medications for potential drug-drug interactions:
            {", ".join(request.medications)}

            For each medication, provide standard details:
            - genericName: the chemical/generic name of the drug.
            - uses: primary clinical indications.
            - sideEffects: common adverse reactions.

            Additionally, list all clinical drug-drug interactions detected between any combinations of the medications.
            Each interaction detail must have:
            - severity: 'Minor', 'Moderate', or 'Major'.
            - mechanism: pharmacokinetic or pharmacodynamic pathway explaining the interaction.
            - clinicalEffect: what happens to the patient clinically.
            - recommendation: clinical advice/safety precautions.
            - alternatives: 1-2 safer alternative medications (if available).
            - references: medical citations (e.g. FDA labeling or PubMed studies).
            - drugsInvolved: list of drug names involved in this specific interaction.

            Provide a legacy 'interactions' list containing simple one-sentence warning strings for backwards compatibility.

            Your output MUST be a JSON object with this EXACT structure:
            {{
              "medications": [
                {{ "name": "Drug Name", "genericName": "Generic Name", "uses": "Uses...", "sideEffects": "Side effects..." }}
              ],
              "interactions": [
                "Simple warning warning 1"
              ],
              "interactionDetails": [
                {{
                  "severity": "Major",
                  "mechanism": "Mechanism...",
                  "clinicalEffect": "Effect...",
                  "recommendation": "Recommendation...",
                  "alternatives": ["Alternative..."],
                  "references": ["Reference..."],
                  "drugsInvolved": ["drug1", "drug2"]
                }}
              ]
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
            result_dict = json.loads(chat_completion.choices[0].message.content)
        except Exception as e:
            latency = time.time() - start_time if 'start_time' in locals() else 0.0
            from utils.metrics import record_request
            record_request(latency, success=False, error=str(e))
            print(f"Error querying Groq for drug interactions: {e}")
            if STRICT_AI_MODE:
                raise HTTPException(status_code=500, detail=f"Groq API Error: {str(e)}")
            result_dict = _get_mock_drug_interactions_dict(request)

    # Cache the result dict
    set_cached_response(cache_key, result_dict, expire=86400)

    # Reconstruct schema response
    meds = [
        MedicationDetails(
            name=m.get("name", "Unknown"),
            genericName=m.get("genericName"),
            uses=m.get("uses"),
            sideEffects=m.get("sideEffects")
        )
        for m in result_dict.get("medications", [])
    ]
    details = [
        InteractionDetail(
            severity=d.get("severity", "Moderate"),
            mechanism=d.get("mechanism", ""),
            clinicalEffect=d.get("clinicalEffect", ""),
            recommendation=d.get("recommendation", ""),
            alternatives=d.get("alternatives", []),
            references=d.get("references", []),
            drugsInvolved=d.get("drugsInvolved", [])
        )
        for d in result_dict.get("interactionDetails", [])
    ]
    return DrugInteractionResponse(
        medications=meds,
        interactions=result_dict.get("interactions", []),
        interactionDetails=details
    )

def _get_mock_drug_interactions_dict(request: DrugInteractionRequest) -> dict:
    med_names = [m.lower() for m in request.medications]
    
    # 1. Aspirin + Warfarin
    if "aspirin" in med_names and "warfarin" in med_names:
        warnings = ["Major Interaction: Concurrent use of Aspirin and Warfarin may significantly increase the risk of serious bleeding. Monitor for bruising, blood in stool/urine, or bleeding gums. Avoid combination unless specifically directed by doctor."]
        details = [
            {
                "severity": "Major",
                "mechanism": "Synergistic antiplatelet and anticoagulant effects increase bleeding risk.",
                "clinicalEffect": "Increased risk of severe internal/external bleeding.",
                "recommendation": "Avoid concurrent use unless strictly directed. Monitor coagulation indices (INR) closely.",
                "alternatives": ["Acetaminophen (for pain instead of Aspirin)"],
                "references": ["FDA Warfarin Labeling", "American Heart Association Guidelines"],
                "drugsInvolved": ["aspirin", "warfarin"]
            }
        ]
    # 2. Ibuprofen + Aspirin
    elif "ibuprofen" in med_names and "aspirin" in med_names:
        warnings = ["Moderate Interaction: Ibuprofen may decrease the cardioprotective effect of low-dose Aspirin. Concomitant use can also increase gastrointestinal bleeding risks. Take ibuprofen at least 8 hours before or 30 minutes after aspirin."]
        details = [
            {
                "severity": "Moderate",
                "mechanism": "Competitive binding of cyclooxygenase (COX-1) binding sites.",
                "clinicalEffect": "Reduced cardioprotective effect of low-dose aspirin and increased GI mucosal stress.",
                "recommendation": "Space dosing: take ibuprofen at least 8 hours before or 30 minutes after low-dose aspirin.",
                "alternatives": ["Acetaminophen"],
                "references": ["FDA Drug Safety Communication (2015)", "PubMed: COX-1 competitive inhibition studies"],
                "drugsInvolved": ["ibuprofen", "aspirin"]
            }
        ]
    else:
        warnings = []
        details = []
        
    meds_details = []
    for med in request.medications:
        name_lower = med.lower()
        if name_lower == "aspirin":
            meds_details.append({ "name": med, "genericName": "Acetylsalicylic Acid", "uses": "Pain relief, fever reducer, anti-inflammatory, cardiovascular protection.", "sideEffects": "Gastrointestinal upset, bleeding, nausea." })
        elif name_lower == "warfarin":
            meds_details.append({ "name": med, "genericName": "Warfarin Sodium", "uses": "Blood thinner used to prevent and treat blood clots.", "sideEffects": "Bleeding, bruising, nausea, stomach pain." })
        elif name_lower == "ibuprofen":
            meds_details.append({ "name": med, "genericName": "Ibuprofen", "uses": "NSAID used for pain relief, fever reduction, and swelling.", "sideEffects": "Stomach irritation, dizziness, headache, kidney stress." })
        else:
            meds_details.append({ "name": med, "genericName": "Unknown Generic", "uses": "Mock medication description - details not found.", "sideEffects": "General side effects apply. Consult doctor." })
            
    return {
        "medications": meds_details,
        "interactions": warnings,
        "interactionDetails": details
    }
