"""
Explainable Response Payload Models (Module 7 & 9)
"""
from __future__ import annotations

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.models.citation import CitationItem
from app.models.confidence import ConfidenceEvaluation, SourceConflict


class TransparencyTraceStep(BaseModel):
    step_number: int
    component: str
    action: str
    status: str = "success"
    details: Optional[str] = None


class ExplainableResponsePayload(BaseModel):
    response_id: str
    query: str
    answer: str
    reasons: List[str] = Field(default_factory=list, description="Rule & profile based reasoning points")
    sources: List[CitationItem] = Field(default_factory=list, description="Official citations")
    confidence: ConfidenceEvaluation
    official_links: List[str] = Field(default_factory=list, description="Validated government portal links")
    last_updated: str = Field("2026-08-07", description="Latest verification date")
    conflicts: List[SourceConflict] = Field(default_factory=list, description="Detected source conflicts")
    freshness_warning: Optional[str] = Field(None, description="Stale data warning if applicable")
    transparency_trace: List[TransparencyTraceStep] = Field(default_factory=list, description="How answer was generated")
