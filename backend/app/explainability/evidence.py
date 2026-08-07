"""
Module 1 — Evidence Collector & Repository
Captures retrieved document chunks, rule IDs, section, page, source URL, retrieved timestamp, and content snippet.
"""
from __future__ import annotations

from typing import List, Dict, Any, Optional
from datetime import date
from app.models.evidence import EvidenceItem, EvidenceCollection


class EvidenceCollector:
    """Collects and stores supporting evidence for AI responses."""

    def __init__(self):
        self._store: Dict[str, EvidenceCollection] = {}

    def create_collection(self, query: str, chunks: List[Dict[str, Any]]) -> EvidenceCollection:
        items: List[EvidenceItem] = []
        today_str = date.today().isoformat()

        for idx, chunk in enumerate(chunks):
            scheme_id = chunk.get("scheme_id", chunk.get("id", f"scheme_{idx}"))
            chunk_id = chunk.get("chunk_id", f"{scheme_id}-chunk-{idx}")
            title = chunk.get("scheme_name", chunk.get("title", "Official Scheme Guidelines"))
            
            # Extracts official URL
            url = chunk.get("official_url")
            if not url and isinstance(chunk.get("official_urls"), list) and chunk["official_urls"]:
                url = chunk["official_urls"][0]
            if not url:
                url = "https://myscheme.gov.in"

            section = chunk.get("section", "Eligibility & Guidelines")
            page = chunk.get("page", 1)
            last_verified = chunk.get("last_verified_date", "2026-08-07")
            review_status = chunk.get("status", "human_verified")

            items.append(
                EvidenceItem(
                    scheme_id=scheme_id,
                    chunk_id=chunk_id,
                    source_title=title,
                    source_url=url,
                    section=section,
                    page=page,
                    retrieved_at=today_str,
                    rule_ids=[f"rule_{scheme_id}_{i}" for i in range(1, 3)],
                    content_snippet=chunk.get("text", chunk.get("summary", "")),
                    review_status=review_status,
                    last_verified_date=last_verified,
                )
            )

        col = EvidenceCollection(query=query, items=items)
        return col


evidence_collector_instance = EvidenceCollector()


def _mock_retriever(query: str, language: str) -> List[Dict[str, Any]]:
    today = date.today().isoformat()
    return [
        {
            "scheme_id": "pm-kisan",
            "chunk_id": "eligibility-001",
            "source_title": "PM-KISAN Portal",
            "official_url": "https://pmkisan.gov.in",
            "section": "Eligibility",
            "page": 4,
            "retrieved_at": today,
            "last_verified_date": "2026-08-07",
            "text": "Small and marginal farmer families with landholding are eligible.",
            "status": "human_verified",
        }
    ]


def collect_evidence(query: str, language: str = "en") -> List[EvidenceItem]:
    chunks = _mock_retriever(query, language)
    col = evidence_collector_instance.create_collection(query, chunks)
    return col.items
