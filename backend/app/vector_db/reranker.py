"""
Hybrid Candidate Reranker Component

Reranks Top 50 candidate chunks retrieved from ChromaDB down to Top 5 high-relevance chunks
combining vector similarity, BM25 keyword matching, state matching boost, and freshness score.
"""
from __future__ import annotations
from typing import List, Dict, Any, Optional
from datetime import date


def _calculate_keyword_match(query: str, text: str, scheme_name: str) -> float:
    q_terms = [t.lower() for t in query.split() if len(t) > 2]
    if not q_terms:
        return 0.0
    haystack = f"{scheme_name} {text}".lower()
    matches = sum(1 for t in q_terms if t in haystack)
    return min(1.0, matches / len(q_terms))


def _calculate_freshness(last_verified_str: str) -> float:
    try:
        y, m, d = map(int, last_verified_str.split("-"))
        days_old = (date.today() - date(y, m, d)).days
        if days_old <= 30:
            return 1.0
        if days_old <= 180:
            return 0.7
        return 0.4
    except Exception:
        return 0.5


class HybridReranker:

    def rerank(
        self,
        query: str,
        candidates: List[dict],
        top_k: int = 5,
        state: Optional[str] = None,
    ) -> List[dict]:
        """
        Reranks candidates and assigns a final combined hybrid score.
        """
        if not candidates:
            return []

        reranked = []
        for c in candidates:
            v_score = c.get("vector_score", 0.0)
            k_score = _calculate_keyword_match(query, c.get("text", ""), c.get("scheme_name", ""))
            f_score = _calculate_freshness(c.get("last_verified_date", ""))

            # State alignment boost
            state_boost = 0.0
            chunk_state = (c.get("state") or "").lower()
            jurisdiction = (c.get("jurisdiction") or "").lower()
            
            if state:
                user_state = state.lower()
                if chunk_state == user_state:
                    state_boost = 0.15
                elif jurisdiction == "central":
                    state_boost = 0.10
                elif chunk_state and chunk_state != user_state:
                    state_boost = -0.20  # Penalty for non-matching state schemes

            # Weighted Hybrid Score calculation
            hybrid_score = (
                (0.55 * v_score) +
                (0.30 * k_score) +
                (0.10 * f_score) +
                state_boost
            )

            c["hybrid_score"] = float(round(max(0.0, min(1.0, hybrid_score)), 4))
            c["vector_score"] = float(round(v_score, 4))
            c["keyword_score"] = float(round(k_score, 4))
            c["freshness_score"] = float(round(f_score, 4))

            reranked.append(c)

        reranked.sort(key=lambda x: x["hybrid_score"], reverse=True)
        return reranked[:top_k]
