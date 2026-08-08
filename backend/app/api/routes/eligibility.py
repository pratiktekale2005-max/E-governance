from typing import Optional, List, Any, Dict
from fastapi import APIRouter, Request
from pydantic import BaseModel, Field
from app.models.citizen_profile import CitizenProfileInput
from app.pre_screening.service import pre_screening_service_instance
from app.utils.limiter import limiter

router = APIRouter(prefix="/eligibility", tags=["Eligibility Pre-Screening Engine"])


class EligibilityRequest(BaseModel):
    age: Optional[int] = Field(None, json_schema_extra={"example": 22})
    income: Optional[float] = Field(None, json_schema_extra={"example": 180000})
    annual_income: Optional[float] = Field(None)
    state: Optional[str] = Field(None, json_schema_extra={"example": "Maharashtra"})
    occupation: Optional[str] = Field(None, json_schema_extra={"example": "student"})
    gender: Optional[str] = Field(None, json_schema_extra={"example": "female"})
    category: Optional[str] = Field(None, json_schema_extra={"example": "OBC"})
    disability: Optional[bool] = Field(False)
    education: Optional[str] = Field(None, json_schema_extra={"example": "undergraduate"})
    family_size: Optional[int] = Field(None)


@router.post(
    "",
    summary="Perform Citizen Scheme Pre-Screening",
    description="Evaluates citizen profile against verified deterministic rule trees and returns likely_match, possible_match, or more_information_required classifications.",
)
@limiter.limit("30/minute")
def check_eligibility(
    request: Request,
    payload: EligibilityRequest,
):
    profile_input = CitizenProfileInput(
        state=payload.state,
        occupation=payload.occupation,
        age=payload.age,
        annual_income=payload.income or payload.annual_income,
        category=payload.category,
        gender=payload.gender,
        disability=payload.disability,
        education=payload.education,
    )

    res = pre_screening_service_instance.run_pre_screening(profile_input, include_llm_explanation=True)

    results_list = []
    summary_counts: Dict[str, int] = {}

    for item in res.matched_schemes:
        status_str = item.status.value if hasattr(item.status, "value") else str(item.status)
        summary_counts[status_str] = summary_counts.get(status_str, 0) + 1

        results_list.append({
            "scheme_id": item.scheme_id,
            "scheme_name": item.scheme_name,
            "status": status_str,
            "matched_conditions": item.matched_conditions,
            "missing_information": item.missing_information,
            "conflicting_conditions": item.conflicting_conditions,
            "required_documents": [
                doc.document_name if hasattr(doc, "document_name") else str(doc)
                for doc in (item.required_documents or [])
            ] or [
                "Income Certificate",
                "Aadhaar Card",
                "Educational Marksheet",
                "Bank Passbook Details"
            ],
            "ranking_reasons": item.ranking_reasons or ["State location verified", "Category criteria matched"],
            "official_verification_required": True,
        })

    return {
        "decision_type": "pre_screening",
        "timestamp": getattr(res, "timestamp", ""),
        "total_evaluated": getattr(res, "schemes_evaluated", len(results_list)),
        "summary_counts": summary_counts,
        "results": results_list,
        "llm_explanation": getattr(res, "llm_explanation", ""),
    }
