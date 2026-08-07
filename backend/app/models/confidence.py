"""
Confidence Engine & Source Conflict Models (Module 4 & 5)
"""
from __future__ import annotations

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class ConfidenceLevelEnum(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class ConfidenceFactor(BaseModel):
    factor_name: str
    passed: bool
    score_delta: int
    description: str


class ConfidenceEvaluation(BaseModel):
    level: ConfidenceLevelEnum
    score_percentage: float = Field(..., ge=0.0, le=100.0)
    reason: str
    explanation_points: List[str] = Field(default_factory=list)
    factors: List[ConfidenceFactor] = Field(default_factory=list)


class SourceConflict(BaseModel):
    scheme_id: str
    field: str
    sources_involved: List[str] = Field(default_factory=list)
    conflict_description: str
    action_recommendation: str = "Please verify using the latest official government notification."


Confidence = ConfidenceEvaluation
ConfidenceLevel = ConfidenceLevelEnum
