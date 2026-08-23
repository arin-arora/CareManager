import json
import base64
import io
import hashlib
from pypdf import PdfReader
from fastapi import HTTPException
from models.schemas import LabReportIntake, LabReportParseResult, ParsedTestData
from services.groq_client import groq_client, STRICT_AI_MODE
from utils.cache import generate_cache_key, get_cached_response, set_cached_response

# Centralized clinical data extraction instructions prompt
PARSING_PROMPT = """
You are a medical data extraction assistant. Parse the clinical lab report into a structured JSON object.
Extract all tests that have numerical values. For each test, extract:
- testName: name of the test (e.g., Hemoglobin, Thyroid Stimulating Hormone, WBC)
- value: numerical value of the result (as a float/number, e.g., 12.4, 5.0)
- unit: measurement unit (e.g., g/dL, uIU/mL, pg)
- referenceRange: the reference interval specified (e.g., 12.0 - 16.0)
- status: one of "normal", "high", "low", "abnormal" based on the value and reference range.
- parameterExplanation: a brief, one-sentence medical explanation of why this parameter is high/low/abnormal (or null if status is normal).

Additionally, provide:
- explanation: a clear, plain-english overall explanation of what these results mean, highlighting any abnormal values, and suggesting questions to ask a doctor. Keep it concise.
- citations: 1-3 clinical citations or references to medical sources (like MedlinePlus or PubMed).
- suggestedFollowUpTests: a list of 1-3 recommended follow-up tests if abnormal values are present (or empty list if normal).

Your output MUST be a JSON object with this EXACT structure:
{
  "parsedData": [
    { "testName": "...", "value": 1.23, "unit": "...", "referenceRange": "...", "status": "normal", "parameterExplanation": null }
  ],
  "explanation": "...",
  "citations": ["..."],
  "suggestedFollowUpTests": ["..."]
}
"""

def parse_lab_report_text_logic(intake: LabReportIntake) -> LabReportParseResult:
    cache_key = generate_cache_key("lab_text", intake.raw_text)
    
    # Try fetching from cache
    cached = get_cached_response(cache_key)
    if cached:
        print(f"Redis cache hit for key: {cache_key}")
        parsed_data = [
            ParsedTestData(
                testName=item.get("testName", "Unknown Test"),
                value=float(item.get("value", 0.0)),
                unit=item.get("unit"),
                referenceRange=item.get("referenceRange"),
                status=item.get("status", "normal"),
                parameterExplanation=item.get("parameterExplanation")
            )
            for item in cached.get("parsedData", [])
        ]
        return LabReportParseResult(
            parsedData=parsed_data,
            explanation=cached.get("explanation", ""),
            citations=cached.get("citations", []),
            suggestedFollowUpTests=cached.get("suggestedFollowUpTests", [])
        )

    print(f"Redis cache miss for key: {cache_key}")

    # Process if cache miss
    result_dict = None
    if not groq_client:
        if STRICT_AI_MODE:
            raise HTTPException(status_code=400, detail="Groq API Key is not configured on the server.")
        result_dict = _get_mock_lab_report_parse_dict()
    else:
        try:
            prompt = f"""
            {PARSING_PROMPT}

            Raw Lab Report Text:
            {intake.raw_text}
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
            print(f"Error querying Groq for lab report: {e}")
            if STRICT_AI_MODE:
                raise HTTPException(status_code=500, detail=f"Groq API Error: {str(e)}")
            result_dict = _get_mock_lab_report_parse_dict()

    # Cache the result dict
    set_cached_response(cache_key, result_dict, expire=86400)

    # Map output dict to Pydantic model
    parsed_data = []
    for item in result_dict.get("parsedData", []):
        try:
            val = float(item["value"])
        except (ValueError, TypeError):
            continue
        parsed_data.append(ParsedTestData(
            testName=item.get("testName", "Unknown Test"),
            value=val,
            unit=item.get("unit"),
            referenceRange=item.get("referenceRange"),
            status=item.get("status", "normal"),
            parameterExplanation=item.get("parameterExplanation")
        ))
        
    return LabReportParseResult(
        parsedData=parsed_data,
        explanation=result_dict.get("explanation", "Parsed results successfully."),
        citations=result_dict.get("citations", []),
        suggestedFollowUpTests=result_dict.get("suggestedFollowUpTests", [])
    )

def parse_lab_report_file_logic(contents: bytes, mime_type: str) -> LabReportParseResult:
    # Hash raw binary bytes for reliable cache hits
    file_hash = hashlib.sha256(contents).hexdigest()
    cache_key = f"cache:lab_file:{file_hash}"
    
    # Try fetching from cache
    cached = get_cached_response(cache_key)
    if cached:
        print(f"Redis cache hit for key: {cache_key}")
        parsed_data = [
            ParsedTestData(
                testName=item.get("testName", "Unknown Test"),
                value=float(item.get("value", 0.0)),
                unit=item.get("unit"),
                referenceRange=item.get("referenceRange"),
                status=item.get("status", "normal"),
                parameterExplanation=item.get("parameterExplanation")
            )
            for item in cached.get("parsedData", [])
        ]
        return LabReportParseResult(
            parsedData=parsed_data,
            explanation=cached.get("explanation", ""),
            citations=cached.get("citations", []),
            suggestedFollowUpTests=cached.get("suggestedFollowUpTests", [])
        )

    print(f"Redis cache miss for key: {cache_key}")

    # Process if cache miss
    result_dict = None
    if not groq_client:
        if STRICT_AI_MODE:
            raise HTTPException(status_code=400, detail="Groq API Key is not configured on the server.")
        result_dict = _get_mock_lab_report_parse_dict()
    else:
        try:
            import time
            from utils.metrics import record_request
            start_time = time.time()
            if mime_type == "application/pdf":
                # PDF parsing: extract raw text from PDF binary pages
                try:
                    pdf_file = io.BytesIO(contents)
                    reader = PdfReader(pdf_file)
                    extracted_text = ""
                    for page in reader.pages:
                        page_text = page.extract_text()
                        if page_text:
                            extracted_text += page_text + "\n"
                except Exception as pdf_err:
                    raise HTTPException(status_code=400, detail=f"Invalid or corrupted PDF file: {str(pdf_err)}")
                    
                if not extracted_text.strip():
                    raise HTTPException(status_code=400, detail="No readable text could be extracted from this PDF document.")
                    
                prompt = f"""
                {PARSING_PROMPT}
                
                Extracted Lab Report Text:
                {extracted_text}
                """
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
            else:
                # Image parsing: base64 multimodal request using Qwen 3.6 Vision
                base64_image = base64.b64encode(contents).decode("utf-8")
                chat_completion = groq_client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": "You are a medical assistant that outputs ONLY raw JSON. Do not wrap in markdown code blocks (```json) or include extra text."},
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": PARSING_PROMPT},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:{mime_type};base64,{base64_image}"
                                    }
                                }
                            ]
                        }
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
            print(f"Error parsing lab file via Groq: {e}")
            if STRICT_AI_MODE:
                raise HTTPException(status_code=500, detail=f"Groq API Error: {str(e)}")
            result_dict = _get_mock_lab_report_parse_dict()

    # Cache the result dict
    set_cached_response(cache_key, result_dict, expire=86400)

    # Map output dict to Pydantic model
    parsed_data = []
    for item in result_dict.get("parsedData", []):
        try:
            val = float(item["value"])
        except (ValueError, TypeError):
            continue
        parsed_data.append(ParsedTestData(
            testName=item.get("testName", "Unknown Test"),
            value=val,
            unit=item.get("unit"),
            referenceRange=item.get("referenceRange"),
            status=item.get("status", "normal"),
            parameterExplanation=item.get("parameterExplanation")
        ))
        
    return LabReportParseResult(
        parsedData=parsed_data,
        explanation=result_dict.get("explanation", "Parsed results successfully."),
        citations=result_dict.get("citations", []),
        suggestedFollowUpTests=result_dict.get("suggestedFollowUpTests", [])
    )

def _get_mock_lab_report_parse_dict() -> dict:
    return {
        "parsedData": [
            { "testName": "Hemoglobin", "value": 11.5, "unit": "g/dL", "referenceRange": "12.0 - 16.0", "status": "low", "parameterExplanation": "Slightly low hemoglobin indicates mild anemia, reducing blood oxygen capacity." },
            { "testName": "White Blood Cell Count", "value": 6500.0, "unit": "/uL", "referenceRange": "4500 - 11000", "status": "normal", "parameterExplanation": None },
            { "testName": "Platelets", "value": 250000.0, "unit": "/uL", "referenceRange": "150000 - 450000", "status": "normal", "parameterExplanation": None }
        ],
        "explanation": "[MOCK ANALYSIS - GROQ API KEY NOT CONFIGURED] Your Hemoglobin appears slightly low (11.5 g/dL), which can indicate mild anemia. Rest of the parameters look normal. Please consult your physician.",
        "citations": ["MedlinePlus: Hemoglobin Test", "Mayo Clinic: Complete Blood Count"],
        "suggestedFollowUpTests": ["Serum Iron Test", "Ferritin Level Check", "Total Iron-Binding Capacity (TIBC)"]
    }
