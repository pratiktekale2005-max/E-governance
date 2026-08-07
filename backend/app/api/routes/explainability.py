"""
Explainability & Trust Engine REST API Router (Module 10)
"""
from __future__ import annotations

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from app.models.explanation import ExplainableResponsePayload
from app.explainability.service import explainability_service_instance
from app.pre_screening.rules.parser import load_all_scheme_rules
from app.utils.limiter import limiter

router = APIRouter(prefix="", tags=["Explainability & Trust Engine"])


class ExplainRequest(BaseModel):
    query: str = Field(..., example="What schemes match a farmer in Maharashtra?")
    answer: str = Field(..., example="PM-KISAN provides direct income support of Rs 6,000 annually.")
    profile: Optional[Dict[str, Any]] = Field(None, example={"state": "Maharashtra", "occupation": "farmer", "annual_income": 180000})
    retrieved_chunks: List[Dict[str, Any]] = Field(default_factory=list)
    matching_conditions: List[str] = Field(default_factory=list)


@router.post(
    "/explain",
    response_model=ExplainableResponsePayload,
    summary="Generate Full Explainability & Trust Payload",
    description="Generates complete transparent evidence, rule reasoning, citations, confidence evaluation, conflict detection, freshness warnings, and execution trace for an AI response.",
)
@limiter.limit("30/minute")
def generate_explanation(request: Request, payload: ExplainRequest):
    chunks = payload.retrieved_chunks
    if not chunks:
        # Fallback mock chunk if none passed explicitly
        chunks = [
            {
                "scheme_id": "pm-kisan",
                "scheme_name": "PM-KISAN",
                "official_url": "https://pmkisan.gov.in",
                "section": "Eligibility Criteria",
                "page": 4,
                "text": "Direct income support of Rs 6,000 per year to landholding farmer families.",
                "last_verified_date": "2026-08-07",
                "status": "human_verified",
            }
        ]

    explainable_resp = explainability_service_instance.build_explainable_response(
        query=payload.query,
        answer=payload.answer,
        retrieved_chunks=chunks,
        profile_dict=payload.profile,
        matching_conditions=payload.matching_conditions,
    )
    return explainable_resp


@router.get(
    "/sources/{scheme_id}",
    summary="Get Verified Sources for Scheme",
    description="Retrieves human-verified official government sources and last verified dates for a specific scheme.",
)
def get_scheme_sources(scheme_id: str):
    rule_map = load_all_scheme_rules()
    scheme = rule_map.get(scheme_id)
    if not scheme:
        raise HTTPException(status_code=404, detail=f"Scheme '{scheme_id}' not found.")

    return {
        "scheme_id": scheme_id,
        "scheme_name": scheme.scheme_name,
        "sources": [
            {
                "source_title": scheme.provenance.source_title,
                "source_url": scheme.provenance.source_url,
                "page_number": scheme.provenance.page_number,
                "effective_from": scheme.provenance.effective_from,
                "last_verified_at": scheme.provenance.last_verified_at,
                "review_status": scheme.provenance.review_status.value,
            }
        ],
    }


@router.get(
    "/confidence/{response_id}",
    summary="Get Confidence Evaluation Details",
    description="Retrieves evidence-based confidence evaluation and factors for a specific response.",
)
def get_response_confidence(response_id: str):
    cached = explainability_service_instance.get_cached_response(response_id)
    if not cached:
        raise HTTPException(status_code=404, detail=f"Response ID '{response_id}' not found in explainability cache.")
    return {
        "response_id": response_id,
        "confidence": cached.confidence,
        "conflicts": cached.conflicts,
        "freshness_warning": cached.freshness_warning,
    }


@router.get(
    "/citations/{response_id}",
    summary="Get Citations for Response",
    description="Retrieves official government source citations with section and page metadata for a specific response.",
)
def get_response_citations(response_id: str):
    cached = explainability_service_instance.get_cached_response(response_id)
    if not cached:
        raise HTTPException(status_code=404, detail=f"Response ID '{response_id}' not found in explainability cache.")
    return {
        "response_id": response_id,
        "citations": cached.sources,
        "official_links": cached.official_links,
    }
