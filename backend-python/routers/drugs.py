from fastapi import APIRouter
from models.schemas import DrugInteractionRequest, DrugInteractionResponse
from services.drug_service import check_drug_interactions_logic

router = APIRouter()

@router.post("/api/check-drug-interactions", response_model=DrugInteractionResponse)
def check_drug_interactions(request: DrugInteractionRequest):
    return check_drug_interactions_logic(request)
