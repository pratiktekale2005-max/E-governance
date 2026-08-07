"""
Match Calculator
=================
Runs the rule engine across every retrieved scheme document and returns a
ranked list of EligibilityResult, best matches first.
"""

from __future__ import annotations

from app.ai.eligibility import rule_engine
from app.ai.schemas import EligibilityResult, MatchStatus, RetrievedDocument

_STATUS_RANK = {
    MatchStatus.LIKELY_MATCH: 0,
    MatchStatus.POSSIBLE_MATCH: 1,
    MatchStatus.OFFICIAL_VERIFICATION_REQUIRED: 2,
    MatchStatus.NOT_A_MATCH: 3,
}


def match_all(
    documents: list[RetrievedDocument], citizen_context: dict
) -> list[EligibilityResult]:
    """Evaluate eligibility for every retrieved scheme, best matches first."""
    results = [rule_engine.evaluate(doc, citizen_context) for doc in documents]
    results.sort(key=lambda r: (_STATUS_RANK[r.status], -r.match_score))
    return results


def filter_relevant(results: list[EligibilityResult]) -> list[EligibilityResult]:
    """Drop schemes explicitly contradicted by the citizen's stated facts."""
    return [r for r in results if r.status != MatchStatus.NOT_A_MATCH]
