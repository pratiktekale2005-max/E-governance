"""
Module 10 — LLM Explanation Layer
Converts deterministic pre-screening results into simple, citizen-friendly explanations.
The LLM ONLY explains results and NEVER decides or mutates eligibility status.
"""
from __future__ import annotations

from typing import List, Dict, Any, Optional
from app.models.pre_screening_result import PreScreeningSchemeResult
from app.ai.llm.factory import get_fallback_chain
from app.utils.logger import logger


def generate_llm_explanation(
    profile_dict: Dict[str, Any],
    results: List[PreScreeningSchemeResult],
    language: str = "en"
) -> str:
    """
    Generates plain language explanation for citizen pre-screening results.
    """
    if not results:
        return (
            "Based on the profile details provided, no matching government schemes were found. "
            "Please update your profile details (such as state, occupation, or age) to discover relevant schemes."
        )

    # Build structured summary for prompt
    top_matches = [r for r in results if r.status in ["likely_match", "possible_match"]]
    more_info_matches = [r for r in results if r.status == "more_information_required"]

    prompt = f"""You are Sahayak AI, a helpful citizen assistant for government scheme pre-screening.
Explain the following pre-screening results clearly, concisely, and empathetically to the citizen.

RULES:
1. Explain ONLY the pre-screening results provided in the structured JSON below.
2. DO NOT alter any scheme status, invent rules, or declare official eligibility.
3. Explicitly remind the citizen to verify final eligibility on the official portal before applying.

CITIZEN PROFILE:
{profile_dict}

LIKELY & POSSIBLE MATCHES:
{[m.dict() for m in top_matches[:3]]}

SCHEMES REQUIRING MORE INFORMATION:
{[m.dict() for m in more_info_matches[:2]]}

Respond in clean markdown using standard headings:
- **Pre-screening Summary**
- **Why These Schemes Match Your Profile**
- **Required Documents & Next Steps**
- **Official Portal Verification Notice**
"""

    try:
        chain = get_fallback_chain()
        response_text = chain.generate(prompt=prompt, system_instruction="You are Sahayak AI.")
        if response_text and len(response_text.strip()) > 30:
            return response_text.strip()
    except Exception as e:
        logger.warning(f"LLM explanation generation failed or fallback triggered: {e}")

    # Fallback template explanation if LLM is unavailable
    lines = [
        "### Pre-screening Summary",
        "Based on the information provided, we have pre-screened your profile against official government scheme rules.",
        "",
        "#### Matching Schemes:",
    ]

    for res in results[:3]:
        status_label = res.status.value.replace("_", " ").title()
        lines.append(f"- **{res.scheme_name}** (*Status: {status_label}*)")
        for reason in res.ranking_reasons[:3]:
            lines.append(f"  - {reason}")

    lines.extend([
        "",
        "#### Required Documents:",
    ])
    all_docs = []
    for res in results[:3]:
        for d in res.required_documents:
            all_docs.append(f"- {d.document_name} (*{d.issuing_authority}*)")
    for doc in list(dict.fromkeys(all_docs))[:5]:
        lines.append(doc)

    lines.extend([
        "",
        "> **Notice**: This is an automated pre-screening guidance tool. Final eligibility decision rests exclusively with the official government department."
    ])

    return "\n".join(lines)
