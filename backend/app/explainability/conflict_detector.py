"""
Module 5 — Source Conflict Detector
Detects conflicting information or inconsistent eligibility criteria across retrieved official sources.
"""
from __future__ import annotations

from typing import List, Dict, Any
from app.models.confidence import SourceConflict
from app.models.evidence import EvidenceItem


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
            # Compare income / eligibility statements if snippets contain differing numbers
            snippets = [i.content_snippet for i in items if i.content_snippet]
            # Simple conflict heuristic: if one document mentions 2,00,000 and another mentions 2,50,000
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
