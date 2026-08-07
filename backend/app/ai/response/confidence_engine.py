"""
Enhanced Confidence Engine
============================
Computes a composite confidence score (0-1) using multiple signals, not
just raw retrieval similarity:

    - Retrieval Similarity     : average top-k similarity from retrieval
    - Number of Sources        : more corroborating official sources = higher confidence
    - Metadata Match           : how much of the scheme's structured metadata
                                  we could actually compare against the citizen
    - Eligibility Match        : strength of the eligibility match (Likely > Possible > ...)
    - Freshness                : how recently the source was last verified
    - Context Completeness     : how much of the citizen's context we had available

Weights are tunable via the WEIGHTS dict below.
"""

from __future__ import annotations

from datetime import date, datetime

from app.ai.schemas import ConfidenceResult, EligibilityResult, MatchStatus, RetrievedDocument

WEIGHTS = {
    "retrieval_similarity": 0.30,
    "num_sources": 0.10,
    "metadata_match": 0.15,
    "eligibility_match": 0.25,
    "freshness": 0.10,
    "context_completeness": 0.10,
}

_ELIGIBILITY_SCORE = {
    MatchStatus.LIKELY_MATCH: 1.0,
    MatchStatus.POSSIBLE_MATCH: 0.6,
    MatchStatus.OFFICIAL_VERIFICATION_REQUIRED: 0.4,
    MatchStatus.NOT_A_MATCH: 0.0,
}

_EXPECTED_CONTEXT_FIELDS = [
    "state", "occupation", "income", "age", "gender", "category",
]


def _retrieval_similarity_score(documents: list[RetrievedDocument]) -> float:
    if not documents:
        return 0.0
    return sum(d.similarity_score for d in documents) / len(documents)


def _num_sources_score(documents: list[RetrievedDocument]) -> float:
    unique_portals = {d.source_portal for d in documents if d.source_portal}
    # Saturates at 3+ distinct corroborating sources.
    return min(len(unique_portals) / 3, 1.0)


def _metadata_match_score(eligibility_results: list[EligibilityResult]) -> float:
    if not eligibility_results:
        return 0.0
    return sum(r.match_score for r in eligibility_results) / len(eligibility_results)


def _eligibility_match_score(eligibility_results: list[EligibilityResult]) -> float:
    if not eligibility_results:
        return 0.0
    best = max(eligibility_results, key=lambda r: _ELIGIBILITY_SCORE[r.status])
    return _ELIGIBILITY_SCORE[best.status]


def _freshness_score(documents: list[RetrievedDocument]) -> float:
    if not documents:
        return 0.0
    scores = []
    today = date.today()
    for doc in documents:
        if not doc.last_verified_date:
            scores.append(0.3)
            continue
        try:
            verified = datetime.strptime(doc.last_verified_date, "%Y-%m-%d").date()
            age_days = (today - verified).days
            # Full score if verified within 90 days, decaying to 0.2 by 2 years.
            score = max(0.2, 1.0 - (age_days / 730))
            scores.append(min(score, 1.0))
        except ValueError:
            scores.append(0.3)
    return sum(scores) / len(scores)


def _context_completeness_score(citizen_context: dict) -> float:
    present = sum(1 for field in _EXPECTED_CONTEXT_FIELDS if citizen_context.get(field) is not None)
    return present / len(_EXPECTED_CONTEXT_FIELDS)


def calculate(
    documents: list[RetrievedDocument],
    eligibility_results: list[EligibilityResult],
    citizen_context: dict,
) -> ConfidenceResult:
    """Compute the overall confidence score and a human-readable reason."""
    breakdown = {
        "retrieval_similarity": _retrieval_similarity_score(documents),
        "num_sources": _num_sources_score(documents),
        "metadata_match": _metadata_match_score(eligibility_results),
        "eligibility_match": _eligibility_match_score(eligibility_results),
        "freshness": _freshness_score(documents),
        "context_completeness": _context_completeness_score(citizen_context),
    }

    score = sum(breakdown[k] * WEIGHTS[k] for k in WEIGHTS)
    score = max(0.0, min(score, 1.0))

    num_sources = len({d.source_portal for d in documents if d.source_portal})
    reason = (
        f"Matched {len(documents)} document(s) from {num_sources} verified "
        f"official source(s); eligibility signal: "
        f"{breakdown['eligibility_match']:.0%}, context completeness: "
        f"{breakdown['context_completeness']:.0%}."
    )

    return ConfidenceResult(score=score, reason=reason, breakdown=breakdown)
