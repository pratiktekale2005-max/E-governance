"""
Module 9 — RAG Integration & Evidence Retrieval

Citizen Question -> Profile Context -> State Filter -> Keyword Search
-> Semantic Search -> Relevant Scheme Chunks -> Evidence Assembly + Confidence Scoring.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from datetime import date
from typing import List, Dict, Any, Optional

from app.embeddings.vector_store import VectorStore
from app.utils.logger import logger


@dataclass
class CitizenProfile:
    state: Optional[str] = None
    category_interests: List[str] = field(default_factory=list)
    language: str = "en"


def _merge_semantic_and_keyword(semantic: List[dict], keyword: List[dict], top_k: int) -> List[dict]:
    by_id: Dict[str, dict] = {}
    for r in semantic:
        by_id[r["chunk_id"]] = {**r, "semantic_score": r["score"], "keyword_hits": 0}
    for r in keyword:
        if r["chunk_id"] in by_id:
            by_id[r["chunk_id"]]["keyword_hits"] = r["score"]
        else:
            by_id[r["chunk_id"]] = {**r, "semantic_score": 0.0, "keyword_hits": r["score"]}

    merged = list(by_id.values())
    for m in merged:
        m["combined_score"] = m["semantic_score"] + 0.05 * m["keyword_hits"]
    merged.sort(key=lambda m: m["combined_score"], reverse=True)
    return merged[:top_k]


def _confidence_level(top_score: float, n_results: int) -> str:
    if n_results == 0:
        return "none"
    if top_score >= 0.45:
        return "high"
    if top_score >= 0.25:
        return "medium"
    return "low"


def _days_stale(last_verified_date: str) -> int:
    try:
        y, m, d = map(int, last_verified_date.split("-"))
        return (date.today() - date(y, m, d)).days
    except Exception:
        return -1


class RetrievalService:

    def __init__(self, store: Optional[VectorStore] = None):
        self.store = store or VectorStore()
        try:
            self.store.load()
        except Exception:
            logger.info("Initializing and building FAISS vector store index...")
            self.store.build_from_scratch()
            self.store.save()

    def retrieve(
        self,
        question: str,
        profile: Optional[CitizenProfile] = None,
        category: Optional[str] = None,
        top_k: int = 5,
    ) -> Dict[str, Any]:
        profile = profile or CitizenProfile()
        logger.info(f"RAG Retrieval query: '{question}' [State: {profile.state or 'Central'}, Category: {category or 'All'}]")

        semantic = self.store.search(
            question,
            top_k=top_k * 2,
            state=profile.state,
            category=category,
            language=None,
        )
        keyword = self.store.keyword_search(question, top_k=top_k * 2)
        merged = _merge_semantic_and_keyword(semantic, keyword, top_k=top_k)

        by_scheme: Dict[str, dict] = {}
        for chunk in merged:
            sid = chunk["scheme_id"]
            if sid not in by_scheme:
                by_scheme[sid] = {
                    "scheme_id": sid,
                    "scheme_name": chunk["scheme_name"],
                    "category": chunk["category"],
                    "jurisdiction": chunk["jurisdiction"],
                    "state": chunk["state"],
                    "official_url": chunk["official_url"],
                    "last_verified_date": chunk["last_verified_date"],
                    "status": chunk["status"],
                    "days_since_verified": _days_stale(chunk["last_verified_date"]),
                    "matched_sections": [],
                }
            by_scheme[sid]["matched_sections"].append({
                "section": chunk["section"],
                "text": chunk["text"],
                "score": round(chunk["combined_score"], 4),
            })

        top_score = merged[0]["combined_score"] if merged else 0.0
        confidence = _confidence_level(top_score, len(merged))

        return {
            "question": question,
            "citizen_profile": {
                "state": profile.state,
                "category_interests": profile.category_interests,
                "language": profile.language,
            },
            "matched_schemes": list(by_scheme.values()),
            "confidence": confidence,
            "disclaimer": (
                "This is informational guidance only, not an official eligibility decision. "
                "Please verify on the official portal(s) linked above before applying."
            ),
        }
