"""
Multi-Factor Confidence Engine

Calculates a weighted 7-factor confidence score (0-100%) and natural language explanation reason
combining vector similarity, keyword match, state alignment, freshness, source authority,
chunk count, and context completeness.
"""
from __future__ import annotations
from typing import List, Dict, Any, Optional


def evaluate_confidence(
    reranked_chunks: List[dict],
    user_state: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Evaluates multi-factor confidence for a retrieval evidence set.
    """
    if not reranked_chunks:
        return {
            "score": 0.0,
            "score_percentage": "0%",
            "level": "NONE",
            "reason": "No government scheme records matched the search query.",
        }

    top_chunk = reranked_chunks[0]

    # 1. Similarity score (30%)
    sim_score = top_chunk.get("hybrid_score", top_chunk.get("vector_score", 0.0))

    # 2. Keyword score (20%)
    k_score = top_chunk.get("keyword_score", 0.5)

    # 3. State match score (15%)
    chunk_state = (top_chunk.get("state") or "").lower()
    jurisdiction = (top_chunk.get("jurisdiction") or "").lower()
    if user_state and user_state.lower() != "central":
        if chunk_state == user_state.lower():
            state_score = 1.0
        elif jurisdiction == "central":
            state_score = 0.85
        else:
            state_score = 0.4
    else:
        state_score = 1.0

    # 4. Freshness score (10%)
    freshness_score = top_chunk.get("freshness_score", 0.8)

    # 5. Source authority (10%)
    source_score = 1.0 if top_chunk.get("status") in ("validated", "published") else 0.7

    # 6. Chunk count score (10%)
    count_score = min(1.0, len(reranked_chunks) / 4.0)

    # 7. Context completeness (5%)
    sections = [c.get("section") for c in reranked_chunks]
    completeness = min(1.0, len(set(sections)) / 3.0)

    # Weighted Score calculation
    weighted_score = (
        (0.30 * sim_score) +
        (0.20 * k_score) +
        (0.15 * state_score) +
        (0.10 * freshness_score) +
        (0.10 * source_score) +
        (0.10 * count_score) +
        (0.05 * completeness)
    )

    percentage = int(round(weighted_score * 100))

    if percentage >= 75:
        level = "HIGH"
    elif percentage >= 45:
        level = "MEDIUM"
    elif percentage > 0:
        level = "LOW"
    else:
        level = "NONE"

    sources_count = len(set(c.get("scheme_id") for c in reranked_chunks if c.get("scheme_id")))
    top_scheme_name = top_chunk.get("scheme_name", "official portals")

    reason = (
        f"{percentage}% confidence based on {sources_count} verified scheme source(s) "
        f"({top_scheme_name}), {int(sim_score * 100)}% semantic match, and location alignment."
    )

    return {
        "score": round(weighted_score, 4),
        "score_percentage": f"{percentage}%",
        "level": level,
        "reason": reason,
        "metrics": {
            "similarity": round(sim_score, 2),
            "keyword": round(k_score, 2),
            "state_match": round(state_score, 2),
            "freshness": round(freshness_score, 2),
            "sources_count": sources_count,
        },
    }
