"""
Response Builder Component

Assembles final structured JSON response envelope.
"""
from __future__ import annotations
from typing import Dict, Any, List, Optional


def build_response_envelope(
    query: str,
    ai_response: str,
    entities: Dict[str, Any],
    intent_data: Dict[str, Any],
    language_data: Dict[str, Any],
    confidence_data: Dict[str, Any],
    citations: List[dict],
    context_data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Builds structured response envelope.
    """
    return {
        "query": query,
        "response": ai_response,
        "language": language_data,
        "intent": intent_data,
        "entities": entities,
        "confidence": confidence_data,
        "citations": citations,
        "evidence": {
            "matched_schemes": context_data.get("compressed_chunks", []),
            "scheme_count": context_data.get("scheme_count", 0),
        },
        "disclaimer": (
            "This guidance is generated from official government scheme guidelines for informational purposes. "
            "Please verify final eligibility and details on the official portal(s) linked above before submitting applications."
        ),
    }
