"""
Module 9 — Explainable Response Formatter
Combines all explainability components into a single standardized ExplainableResponsePayload.
"""
from __future__ import annotations

import uuid
from typing import List, Dict, Any, Optional
from app.models.explanation import ExplainableResponsePayload, TransparencyTraceStep
from app.models.citation import CitationItem
from app.models.confidence import ConfidenceEvaluation, SourceConflict


def format_explainable_response(
    query: str,
    answer: str,
    reasons: List[str],
    sources: List[CitationItem],
    confidence: ConfidenceEvaluation,
    official_links: List[str],
    last_updated: str,
    conflicts: List[SourceConflict],
    freshness_warning: Optional[str] = None,
    trace: Optional[List[TransparencyTraceStep]] = None,
    response_id: Optional[str] = None,
) -> ExplainableResponsePayload:
    """
    Assembles complete ExplainableResponsePayload.
    """
    resp_id = response_id or f"resp_{uuid.uuid4().hex[:10]}"

    return ExplainableResponsePayload(
        response_id=resp_id,
        query=query,
        answer=answer,
        reasons=reasons,
        sources=sources,
        confidence=confidence,
        official_links=official_links,
        last_updated=last_updated,
        conflicts=conflicts,
        freshness_warning=freshness_warning,
        transparency_trace=trace or [],
    )
