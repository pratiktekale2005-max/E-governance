"""
Pre-screening Engine REST API Router (Module 10 / Module 11)
"""
from __future__ import annotations

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Request, Query
from app.models.citizen_profile import CitizenProfileInput
from app.models.pre_screening_result import PreScreeningCheckResponse
from app.pre_screening.service import pre_screening_service_instance
from app.utils.limiter import limiter

router = APIRouter(prefix="/pre-screening", tags=["Government Scheme Pre-screening Engine"])

# In-memory history store
PRE_SCREENING_HISTORY: List[Dict[str, Any]] = []


@router.post(
    "/check",
    response_model=PreScreeningCheckResponse,
    summary="Full Pre-screening Check with LLM Explanation",
    description="Evaluates citizen profile against human-verified government scheme rules using Three-Valued Logic and returns structured results with LLM plain language explanation.",
)
@limiter.limit("20/minute")
def check_pre_screening(request: Request, payload: CitizenProfileInput):
    response = pre_screening_service_instance.run_pre_screening(
        raw_profile=payload,
        include_llm_explanation=True,
    )
    PRE_SCREENING_HISTORY.append(response.dict())
    return response


@router.post(
    "/preview",
    response_model=PreScreeningCheckResponse,
    summary="Fast Pre-screening Preview (No LLM Call)",
    description="Evaluates profile deterministically against rule trees using Three-Valued Logic and returns candidate scheme statuses instantly without invoking LLM explanation layer.",
)
@limiter.limit("40/minute")
def preview_pre_screening(request: Request, payload: CitizenProfileInput):
    response = pre_screening_service_instance.run_pre_screening(
        raw_profile=payload,
        include_llm_explanation=False,
    )
    return response


@router.get(
    "/history",
    summary="Get Pre-screening Check History",
    description="Retrieves historical pre-screening evaluation logs.",
)
def get_pre_screening_history(user_id: Optional[str] = None):
    if user_id:
        user_logs = [log for log in PRE_SCREENING_HISTORY if log.get("user_id") == user_id]
        return {"user_id": user_id, "count": len(user_logs), "history": user_logs}
    return {"total_checks": len(PRE_SCREENING_HISTORY), "history": PRE_SCREENING_HISTORY[-50:]}


@router.get(
    "/schemes/recommended",
    summary="Get Recommended Schemes for Citizen Profile",
    description="Runs pre-screening matching and returns candidate schemes filtered by likelihood.",
)
def get_recommended_schemes(
    state: Optional[str] = None,
    occupation: Optional[str] = None,
    age: Optional[int] = None,
    annual_income: Optional[float] = None,
    category: Optional[str] = None,
    gender: Optional[str] = None,
):
    input_profile = CitizenProfileInput(
        state=state,
        occupation=occupation,
        age=age,
        annual_income=annual_income,
        category=category,
        gender=gender,
    )
    res = pre_screening_service_instance.run_pre_screening(input_profile, include_llm_explanation=False)
    filtered = [s for s in res.matched_schemes if s.status.value in ["likely_match", "possible_match", "more_information_required"]]
    return {
        "recommended_count": len(filtered),
        "schemes": filtered,
    }


@router.get(
    "/schemes/{scheme_id}",
    summary="Get Scheme Details & Human-Verified Rules",
    description="Retrieves detailed human-verified rule set and provenance for a specific scheme.",
)
def get_scheme_details(scheme_id: str):
    rule_set = pre_screening_service_instance.rules_map.get(scheme_id)
    if not rule_set:
        raise HTTPException(status_code=404, detail=f"Scheme '{scheme_id}' not found in verified rule repository.")
    return rule_set
