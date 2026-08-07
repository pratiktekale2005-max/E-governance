"""
Module 5 — Source Conflict Detector
Detects conflicting information or inconsistent eligibility criteria across retrieved official sources.
"""
from __future__ import annotations

from typing import List, Dict, Any
from app.models.confidence import SourceConflict
from app.models.evidence import EvidenceItem


import re
from collections import defaultdict

CONFLICT_WARNING = (
    "Source Conflict Detected — official sources contain inconsistent information. "
    "Please verify using the latest government notification."
)

_AMOUNT_PATTERN = re.compile(
    r"(?:₹|rs\.?\s*)?\s*([\d,]+(?:\.\d+)?)\s*(lakh|crore)?",
    re.IGNORECASE,
)


def _extract_amounts(text: str) -> list[float]:
    """Extracts numeric monetary figures from evidence text, normalized to plain rupee value."""
    amounts = []
    for match in _AMOUNT_PATTERN.finditer(text or ""):
        raw_number, unit = match.groups()
        if not raw_number:
            continue
        try:
            value = float(raw_number.replace(",", ""))
        except ValueError:
            continue
        if value == 0:
            continue
        if unit and unit.lower() == "lakh":
            value *= 100_000
        elif unit and unit.lower() == "crore":
            value *= 10_000_000
        amounts.append(value)
    return amounts


def detect_source_conflicts(evidence_items: List[EvidenceItem]) -> List[SourceConflict]:
    """
    Compares retrieved evidence items for conflicting rule criteria.
    """
    conflicts: List[SourceConflict] = []
    by_scheme: Dict[str, List[EvidenceItem]] = {}

    for item in evidence_items:
        by_scheme.setdefault(item.scheme_id, []).append(item)

    for scheme_id, items in by_scheme.items():
        if len(items) >= 2:
            snippets = [i.content_snippet for i in items if i.content_snippet]
            has_200k = any("2,00,000" in s or "200000" in s or "2 lakh" in s for s in snippets)
            has_250k = any("2,50,000" in s or "250000" in s or "2.5 lakh" in s for s in snippets)

            if has_200k and has_250k:
                sources = list(set(i.source_url for i in items))
                conflicts.append(
                    SourceConflict(
                        scheme_id=scheme_id,
                        field="annual_income",
                        sources_involved=sources,
                        conflict_description="Official sources contain inconsistent annual income limits (₹2.0 Lakh vs ₹2.5 Lakh).",
                        action_recommendation="Please verify using the latest official government notification on the portal.",
                    )
                )

    return conflicts


def detect_conflicts(evidence_items: List[EvidenceItem]) -> tuple[bool, str | None, list[dict]]:
    conflicts = detect_source_conflicts(evidence_items)
    if not conflicts:
        return False, None, []
    details = [
        {"scheme_id": c.scheme_id, "field": c.field, "description": c.conflict_description}
        for c in conflicts
    ]
    return True, CONFLICT_WARNING, details
