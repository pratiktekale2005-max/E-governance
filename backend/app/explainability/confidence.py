"""
Module 4 — Multi-Factor Evidence Confidence Engine
Calculates confidence (High / Medium / Low) based on evidence quality and generates explicit explanations.
"""
from __future__ import annotations

from typing import List, Dict, Any
from app.models.confidence import (
    ConfidenceLevelEnum,
    ConfidenceFactor,
    ConfidenceEvaluation,
    SourceConflict,
)
from app.models.evidence import EvidenceItem


def calculate_confidence(
    evidence_items: List[EvidenceItem],
    conflicts: List[SourceConflict],
    missing_fields: List[str],
    is_stale: bool = False,
) -> ConfidenceEvaluation:
    """
    Calculates multi-factor evidence confidence.
    """
    score = 0
    factors: List[ConfidenceFactor] = []
    explanations: List[str] = []

    # Factor 1: Multiple Official Sources
    num_sources = len(set(e.source_url for e in evidence_items))
    if num_sources >= 2:
        score += 25
        factors.append(ConfidenceFactor(factor_name="Multi-Source Verification", passed=True, score_delta=25, description="Retrieved from multiple official government sources"))
        explanations.append("Information retrieved from multiple official government sources.")
    elif num_sources == 1:
        score += 15
        factors.append(ConfidenceFactor(factor_name="Single Source Verification", passed=True, score_delta=15, description="Retrieved from an official government source"))
        explanations.append("Information retrieved from 1 verified official source.")
    else:
        factors.append(ConfidenceFactor(factor_name="No Official Sources", passed=False, score_delta=0, description="No verified government sources found"))
        explanations.append("No verified official sources retrieved.")

    # Factor 2: Human Verification Status
    all_human_verified = all(e.review_status == "human_verified" for e in evidence_items) if evidence_items else False
    if all_human_verified:
        score += 25
        factors.append(ConfidenceFactor(factor_name="Human Verified Rules", passed=True, score_delta=25, description="Scheme rules are human verified"))
        explanations.append("Rules are human verified.")
    else:
        score += 10
        factors.append(ConfidenceFactor(factor_name="Unverified Rules", passed=False, score_delta=10, description="Some scheme rules require human review"))

    # Factor 3: Freshness
    if not is_stale and evidence_items:
        score += 20
        factors.append(ConfidenceFactor(factor_name="Information Freshness", passed=True, score_delta=20, description="Evidence last verified recently"))
        explanations.append("Information is recently verified.")
    else:
        factors.append(ConfidenceFactor(factor_name="Stale Information Warning", passed=False, score_delta=0, description="Information requires re-verification"))

    # Factor 4: Conflict Free
    if not conflicts:
        score += 15
        factors.append(ConfidenceFactor(factor_name="No Source Conflicts", passed=True, score_delta=15, description="No conflicting information detected across sources"))
        explanations.append("No conflicting information detected.")
    else:
        factors.append(ConfidenceFactor(factor_name="Source Conflict Detected", passed=False, score_delta=0, description="Inconsistent criteria detected across official sources"))
        explanations.append("Source conflicts detected across official notifications.")

    # Factor 5: Profile Completeness
    if not missing_fields:
        score += 15
        factors.append(ConfidenceFactor(factor_name="Complete Profile", passed=True, score_delta=15, description="All required citizen profile attributes available"))
        explanations.append("Citizen profile details are complete.")
    else:
        factors.append(ConfidenceFactor(factor_name="Incomplete Profile", passed=False, score_delta=0, description="Some profile attributes are missing"))

    # Determine Level
    if score >= 80:
        level = ConfidenceLevelEnum.HIGH
        reason_summary = "High confidence: backed by multiple human-verified, conflict-free official government sources."
    elif score >= 50:
        level = ConfidenceLevelEnum.MEDIUM
        reason_summary = "Medium confidence: backed by official sources, but additional citizen information or verification is recommended."
    else:
        level = ConfidenceLevelEnum.LOW
        reason_summary = "Low confidence: limited official evidence available; official portal verification required."

    return ConfidenceEvaluation(
        level=level,
        score_percentage=float(score),
        reason=reason_summary,
        explanation_points=explanations,
        factors=factors,
    )
