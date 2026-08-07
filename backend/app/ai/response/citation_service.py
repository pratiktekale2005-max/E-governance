"""
Citation Generator
===================
Attaches official evidence (scheme name, department, official URL, last
verified date, source portal) to a response, sourced strictly from the
retrieved documents -- never fabricated by the LLM.
"""

from __future__ import annotations

from app.ai.schemas import Citation, RetrievedDocument


def generate_citations(documents: list[RetrievedDocument]) -> list[Citation]:
    """Build one citation per unique retrieved scheme document."""
    seen: set[str] = set()
    citations: list[Citation] = []

    for doc in documents:
        if doc.scheme_id in seen:
            continue
        seen.add(doc.scheme_id)
        citations.append(
            Citation(
                scheme_name=doc.scheme_name,
                department=doc.department,
                official_url=doc.official_url,
                last_verified_date=doc.last_verified_date,
                source_portal=doc.source_portal,
            )
        )
    return citations
