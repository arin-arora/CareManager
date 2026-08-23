from fastapi import APIRouter, UploadFile, File
from models.schemas import LabReportIntake, LabReportParseResult
from services.lab_service import parse_lab_report_text_logic, parse_lab_report_file_logic

router = APIRouter()

@router.post("/api/parse-lab-report", response_model=LabReportParseResult)
def parse_lab_report(intake: LabReportIntake):
    return parse_lab_report_text_logic(intake)

@router.post("/api/parse-lab-report-file", response_model=LabReportParseResult)
async def parse_lab_report_file(file: UploadFile = File(...)):
    contents = await file.read()
    mime_type = file.content_type
    return parse_lab_report_file_logic(contents, mime_type)
