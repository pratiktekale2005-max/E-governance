"""
Citation Generator Component

Generates automatic, citable source references linking AI responses to verified government portals.
"""
from __future__ import annotations
from typing import List, Dict, Any


def generate_citations(reranked_chunks: List[dict]) -> List[Dict[str, Any]]:
    """
    Constructs citable reference list for a set of evidence chunks.
    """
    citations = []
    seen_schemes = set()

    for chunk in reranked_chunks:
        sid = chunk.get("scheme_id") or chunk.get("scheme_name")
        if sid in seen_schemes:
            continue
        seen_schemes.add(sid)

        cit = {
            "scheme_id": sid,
            "scheme_name": chunk.get("scheme_name", "Government Scheme"),
            "category": chunk.get("category", "other"),
            "jurisdiction": chunk.get("jurisdiction", "central"),
            "state": chunk.get("state"),
            "official_url": chunk.get("official_url", ""),
            "last_verified_date": chunk.get("last_verified_date", ""),
            "relevance_score": chunk.get("hybrid_score", chunk.get("vector_score", 0.0)),
        }
        citations.append(cit)

    return citations
