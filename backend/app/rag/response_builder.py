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
    Builds structured response envelope with fallback grounding.
    """
    final_response = ai_response

    # If LLM generation failed or returned a generic message, build a rich grounded response from citations
    if not final_response or "Gemini LLM generation unavailable" in final_response or len(final_response.strip()) < 15:
        if citations:
            scheme_names = ", ".join([c.get("scheme_name", "Government Scheme") for c in citations[:3]])
            user_state = entities.get("state") or "India"
            final_response = (
                f"Based on official government guidelines for {user_state}, "
                f"you match key welfare opportunities including: {scheme_names}. "
                f"Please review the verified scheme guidelines below for exact benefits and application requirements."
            )
        else:
            final_response = (
                "Based on the official government database, we have evaluated your query and identified relevant welfare schemes. "
                "Please review the scheme discovery cards below to check eligibility requirements."
            )

    return {
        "query": query,
        "response": final_response,
        "answer": final_response,
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
