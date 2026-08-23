from fastapi import APIRouter
from models.schemas import SymptomIntake, PredictionResult
from services.symptom_service import predict_symptoms_logic

router = APIRouter()

@router.post("/api/predict-symptom", response_model=PredictionResult)
def predict_symptom(intake: SymptomIntake):
    return predict_symptoms_logic(intake)
