"""
Response Formatter
====================
Assembles the final structured, citizen-friendly response from all pipeline
outputs, matching the standard response contract:

{
  "answer": "...",
  "matching_schemes": [],
  "eligibility_summary": [],
  "required_documents": [],
  "application_steps": [],
  "citations": [],
  "confidence": { "score": 0.94, "reason": "..." }
}
"""

from __future__ import annotations

from app.ai.schemas import Citation, ConfidenceResult, EligibilityResult, LLMResponse, RetrievedDocument


def format_response(
    llm_response: LLMResponse,
    eligibility_results: list[EligibilityResult],
    citations: list[Citation],
    confidence: ConfidenceResult,
    documents: list[RetrievedDocument],
    required_documents: list[str] | None = None,
    application_steps: list[str] | None = None,
) -> dict:
    """Build the final standard API response dict."""
    matching_schemes = [
        {
            "scheme_id": r.scheme_id,
            "scheme_name": r.scheme_name,
            "status": r.status.value,
        }
        for r in eligibility_results
    ]

    return {
        "answer": llm_response.text.strip(),
        "matching_schemes": matching_schemes,
        "eligibility_summary": [r.as_dict() for r in eligibility_results],
        "required_documents": required_documents or [],
        "application_steps": application_steps or [],
        "citations": [c.as_dict() for c in citations],
        "confidence": confidence.as_dict(),
        "meta": {
            "model": llm_response.model,
            "sources_used": len(documents),
        },
    }
