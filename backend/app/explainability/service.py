"""
ExplainabilityService Facade
Orchestrates Modules 1 through 9 of the Explainability & Trust Engine.
"""
from __future__ import annotations

from typing import List, Dict, Any, Optional
from app.models.explanation import ExplainableResponsePayload
from app.models.citation import CitationItem
from app.models.confidence import ConfidenceEvaluation
from app.explainability.evidence import evidence_collector_instance
from app.explainability.reasoning import generate_reasons
from app.explainability.citations import generate_citations
from app.explainability.confidence import calculate_confidence
from app.explainability.conflict_detector import detect_source_conflicts
from app.explainability.freshness import validate_freshness
from app.explainability.transparency import generate_transparency_trace
from app.explainability.official_links import extract_official_links
from app.explainability.formatter import format_explainable_response


import threading

REQUIRED_PROFILE_FIELDS = ["occupation", "state", "income"]


class ExplainabilityService:
    def __init__(self):
        self._response_cache: Dict[str, ExplainableResponsePayload] = {}
        self._lock = threading.Lock()

    def build_explainable_response(
        self,
        query: str,
        answer: str,
        retrieved_chunks: List[Dict[str, Any]],
        profile_dict: Optional[Dict[str, Any]] = None,
        matching_conditions: Optional[List[str]] = None,
        missing_fields: Optional[List[str]] = None,
    ) -> ExplainableResponsePayload:
        prof = profile_dict or {}
        conds = matching_conditions or []
        missing = missing_fields or []

        # 1. Evidence Collection
        collection = evidence_collector_instance.create_collection(query, retrieved_chunks)
        evidence_items = collection.items

        # 2. Reason Generator
        matched_schemes = [{"scheme_id": item.scheme_id, "name": item.source_title} for item in evidence_items]
        reasons = generate_reasons(prof, conds, matched_schemes)

        # 3. Citation Generator
        citations = generate_citations(evidence_items)

        # 4. Source Conflict Detector
        conflicts = detect_source_conflicts(evidence_items)

        # 5. Freshness Checker
        is_fresh, last_verified, freshness_warning = validate_freshness(evidence_items)

        # 6. Confidence Engine
        confidence = calculate_confidence(
            evidence_items=evidence_items,
            conflicts=conflicts,
            missing_fields=missing,
            is_stale=not is_fresh,
        )

        # 7. Official Link Manager
        official_links = extract_official_links(evidence_items)

        # 8. Transparency Trace Generator
        trace = generate_transparency_trace(
            num_documents_retrieved=len(retrieved_chunks),
            num_rules_evaluated=len(conds) if conds else len(evidence_items) * 2,
            num_matches_found=len(matched_schemes),
        )

        # 9. Format Response
        payload = format_explainable_response(
            query=query,
            answer=answer,
            reasons=reasons,
            sources=citations,
            confidence=confidence,
            official_links=official_links,
            last_updated=last_verified,
            conflicts=conflicts,
            freshness_warning=freshness_warning,
            trace=trace,
        )

        # Cache with thread safety
        with self._lock:
            self._response_cache[payload.response_id] = payload
        return payload

    def get_cached_response(self, response_id: str) -> Optional[ExplainableResponsePayload]:
        with self._lock:
            return self._response_cache.get(response_id)

    def get_latest_for_scheme(self, scheme_id: str) -> Optional[ExplainableResponsePayload]:
        with self._lock:
            matches = [
                r for r in self._response_cache.values()
                if any(s.source_name and scheme_id.lower() in s.source_name.lower() for s in r.sources)
            ]
            return matches[-1] if matches else None


explainability_service_instance = ExplainabilityService()
ExplainabilityStore = ExplainabilityService
store = explainability_service_instance


def _missing_profile_fields(citizen_profile: dict | None) -> list[str]:
    profile = citizen_profile or {}
    return [f for f in REQUIRED_PROFILE_FIELDS if not profile.get(f)]


def generate_explanation(
    query: str,
    language: str,
    answer_text: str,
    citizen_profile: dict | None = None,
    scheme_id: str | None = None,
) -> ExplainableResponsePayload:
    mock_chunks = [
        {
            "scheme_id": scheme_id or "pm-kisan",
            "scheme_name": "PM-KISAN Guidelines",
            "official_url": "https://pmkisan.gov.in",
            "section": "Eligibility",
            "page": 4,
            "text": "Direct income support of Rs 6,000 per year.",
        }
    ]
    return explainability_service_instance.build_explainable_response(
        query=query,
        answer=answer_text,
        retrieved_chunks=mock_chunks,
        profile_dict=citizen_profile,
    )
