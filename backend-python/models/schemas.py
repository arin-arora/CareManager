from pydantic import BaseModel
from typing import List, Optional

class SymptomIntake(BaseModel):
    symptoms: List[str]
    duration: Optional[str] = "unknown"
    age: Optional[int] = None
    notes: Optional[str] = ""

class ConditionPrediction(BaseModel):
    name: str
    confidence: float

class PredictionResult(BaseModel):
    conditions: List[ConditionPrediction]
    urgency_level: str
    suggested_specialist: str
    home_care_notes: str
    red_flags_triggered: List[str]
    critical_warning: Optional[str] = None
    recommended_tests: List[str] = []
    emergency_recommendation: bool = False

class LabReportIntake(BaseModel):
    raw_text: str

class ParsedTestData(BaseModel):
    testName: str
    value: float
    unit: Optional[str] = None
    referenceRange: Optional[str] = None
    status: str # 'normal', 'high', 'low', 'abnormal'
    parameterExplanation: Optional[str] = None

class LabReportParseResult(BaseModel):
    parsedData: List[ParsedTestData]
    explanation: str
    citations: List[str]
    suggestedFollowUpTests: List[str] = []

class DrugInteractionRequest(BaseModel):
    medications: List[str]

class MedicationDetails(BaseModel):
    name: str
    genericName: Optional[str] = None
    uses: Optional[str] = None
    sideEffects: Optional[str] = None

class InteractionDetail(BaseModel):
    severity: str # 'Minor', 'Moderate', 'Major'
    mechanism: str
    clinicalEffect: str
    recommendation: str
    alternatives: List[str]
    references: List[str]
    drugsInvolved: List[str]

class DrugInteractionResponse(BaseModel):
    medications: List[MedicationDetails]
    interactions: List[str]
    interactionDetails: List[InteractionDetail] = []
