from typing import Optional, List
from fastapi import APIRouter, Request
from pydantic import BaseModel, Field
from app.services.retrieval_service import RetrievalService, CitizenProfile
from app.utils.limiter import limiter

router = APIRouter(prefix="/retrieve", tags=["RAG Evidence Retrieval"])
retrieval_service = RetrievalService()


class RetrieveRequest(BaseModel):
    question: str = Field(..., min_length=2, json_schema_extra={"example": "What help is available for a farmer in Maharashtra?"})
    state: Optional[str] = Field(None, json_schema_extra={"example": "Maharashtra"})
    category: Optional[str] = Field(None, json_schema_extra={"example": "farmer"})
    language: Optional[str] = Field("en", json_schema_extra={"example": "en"})
    top_k: Optional[int] = Field(5, ge=1, le=20)


@router.post(
    "",
    summary="Retrieve Source-Backed Evidence",
    description="Searches normalized government schemes using hybrid semantic vector search + keyword matching.",
)
@limiter.limit("30/minute")
def retrieve_evidence(
    request: Request,
    payload: RetrieveRequest,
):
    profile = CitizenProfile(
        state=payload.state,
        language=payload.language or "en",
    )
    result = retrieval_service.retrieve(
        question=payload.question,
        profile=profile,
        category=payload.category,
        top_k=payload.top_k or 5,
    )
    return result
