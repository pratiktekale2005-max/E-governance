"""
Module 6 — Pre-screening Classification Engine
Classifies scheme evaluation results into deterministic pre-screening statuses.
"""
from __future__ import annotations

from typing import List
from app.models.pre_screening_result import (
    PreScreeningStatus,
    ThreeValuedLogic,
    ConditionEvaluationResult,
)


def classify_pre_screening(
    tree_result: ThreeValuedLogic,
    evaluations: List[ConditionEvaluationResult],
    provenance_valid: bool,
) -> PreScreeningStatus:
    """
    Classifies scheme evaluation into pre-screening status.
    """
    if not provenance_valid:
        return PreScreeningStatus.STALE_RULE

    if tree_result == ThreeValuedLogic.FALSE:
        return PreScreeningStatus.APPEARS_NOT_TO_MATCH

    if tree_result == ThreeValuedLogic.UNKNOWN:
        return PreScreeningStatus.MORE_INFORMATION_REQUIRED

    if tree_result == ThreeValuedLogic.TRUE:
        # Check if any optional evaluations are UNKNOWN or FALSE
        all_true = all(e.result == ThreeValuedLogic.TRUE for e in evaluations)
        if all_true:
            return PreScreeningStatus.LIKELY_MATCH
        else:
            return PreScreeningStatus.POSSIBLE_MATCH

    return PreScreeningStatus.OFFICIAL_VERIFICATION_REQUIRED
