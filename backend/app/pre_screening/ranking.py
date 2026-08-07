"""
Module 9 — Transparent Ranking Engine
Ranks pre-screened schemes deterministically using integer point deltas without probability scores.
"""
from __future__ import annotations

from typing import List, Dict, Any
from app.models.pre_screening_result import (
    ConditionEvaluationResult,
    ThreeValuedLogic,
    PreScreeningStatus,
)
from app.models.scheme_rule import SchemeRuleSet


def calculate_ranking_score(
    scheme_rule: SchemeRuleSet,
    evaluations: List[ConditionEvaluationResult],
    status: PreScreeningStatus,
    profile_dict: Dict[str, Any],
) -> tuple[int, List[str]]:
    """
    Computes integer ranking score and transparent human-readable ranking reasons.
    """
    score = 0
    reasons: List[str] = []

    # State relevance
    citizen_state = profile_dict.get("state")
    if scheme_rule.target_state and citizen_state:
        if citizen_state.lower() == scheme_rule.target_state.lower():
            score += 1
            reasons.append(f"✓ State matched ({citizen_state})")
    elif not scheme_rule.target_state:
        score += 1
        reasons.append("✓ Applicable nationwide (Central scheme)")

    # Category relevance
    if scheme_rule.category:
        score += 1
        reasons.append(f"✓ Category matched ({scheme_rule.category.title()})")

    # Evaluate atomic conditions
    for e in evaluations:
        if e.result == ThreeValuedLogic.TRUE:
            score += 3
            reasons.append(f"✓ {e.description} matched")
        elif e.result == ThreeValuedLogic.UNKNOWN:
            score -= 2
        elif e.result == ThreeValuedLogic.FALSE:
            score -= 3

    # Penalty for stale rules
    if status == PreScreeningStatus.STALE_RULE:
        score -= 2
        reasons.append("⚠ Stale rule verification penalty applied")

    return score, reasons
