"""
Module 8 — Official Link Generator
Extracts and validates direct links to official government service portals.
"""
from __future__ import annotations

from typing import List
from app.models.evidence import EvidenceItem

OFFICIAL_FALLBACK_LINKS = [
    "https://pmkisan.gov.in",
    "https://www.myscheme.gov.in",
    "https://india.gov.in",
]


def extract_official_links(evidence_items: List[EvidenceItem]) -> List[str]:
    """
    Extracts unique official government domain URLs.
    """
    links: List[str] = []
    seen = set()

    for item in evidence_items:
        url = item.source_url
        if url and url not in seen:
            # Check if domain looks official (or starts with https)
            if ".gov.in" in url.lower() or ".nic.in" in url.lower() or "myscheme" in url.lower() or "pmkisan" in url.lower():
                seen.add(url)
                links.append(url)

    # Fallback to general official portals if none found
    if not links:
        for fallback in OFFICIAL_FALLBACK_LINKS:
            if fallback not in seen:
                seen.add(fallback)
                links.append(fallback)

    return links
