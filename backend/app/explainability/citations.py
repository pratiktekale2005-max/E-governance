"""
Module 3 — Citation Generator
Attaches official government source metadata to every response.
"""
from __future__ import annotations

from typing import List, Dict, Any
from app.models.citation import CitationItem
from app.models.evidence import EvidenceItem


def generate_citations(evidence_items: List[EvidenceItem]) -> List[CitationItem]:
    """
    Generates structured citation items from collected evidence.
    """
    citations: List[CitationItem] = []
    seen_urls = set()

    for item in evidence_items:
        url = item.source_url
        if url not in seen_urls:
            seen_urls.add(url)
            
            # Derive department from title or URL
            dept = "Ministry of Agriculture & Farmers Welfare" if "kisan" in item.scheme_id.lower() else "Department of Social Justice & Empowerment"
            if "health" in item.scheme_id.lower() or "arogya" in item.scheme_id.lower():
                dept = "Ministry of Health and Family Welfare"
            citations.append(
                CitationItem(
                    source_name=item.source_title,
                    department=dept,
                    official_url=url,
                    section=item.section or "Eligibility Guidelines",
                    page_number=item.page or 1,
                    last_verified=item.last_verified_date or "2026-08-07",
                )
            )

    return citations


from app.explainability.official_links import extract_official_links

generate_official_links = extract_official_links
