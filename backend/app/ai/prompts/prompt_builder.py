"""
Prompt Builder
==============
Assembles the final dynamic prompt sent to the LLM, in this order:

    System Prompt
    -> Citizen Profile
    -> Eligibility Result
    -> Retrieved Context
    -> Conversation History
    -> Safety Rules
    -> Output Template

Each section is clearly delimited so the LLM can distinguish instructions
from data, and so the prompt is easy to debug/log.
"""

from __future__ import annotations

import json
from pathlib import Path

from app.ai.schemas import CitizenContext, ConversationTurn, EligibilityResult, RetrievedDocument

_PROMPT_DIR = Path(__file__).parent

_SYSTEM_PROMPT_TEMPLATE = (_PROMPT_DIR / "system_prompt.txt").read_text(encoding="utf-8")
_SAFETY_PROMPT = (_PROMPT_DIR / "safety_prompt.txt").read_text(encoding="utf-8")
_OUTPUT_TEMPLATE = (_PROMPT_DIR / "output_template.txt").read_text(encoding="utf-8")


def _section(title: str, body: str) -> str:
    return f"### {title}\n{body.strip()}\n"


def build_prompt(
    query: str,
    context: CitizenContext,
    eligibility_results: list[EligibilityResult],
    retrieved_docs: list[RetrievedDocument],
    conversation_history: list[ConversationTurn] | None = None,
) -> str:
    """Build the full prompt string to send to the LLM."""
    system_prompt = _SYSTEM_PROMPT_TEMPLATE.format(language=context.language.value)

    profile_section = _section(
        "Citizen Profile / Context", json.dumps(context.merged, indent=2, ensure_ascii=False)
    )

    eligibility_section = _section(
        "Eligibility Results (do not override these; never say 'eligible')",
        json.dumps([r.as_dict() for r in eligibility_results], indent=2, ensure_ascii=False)
        if eligibility_results
        else "No scheme matches found for the given context.",
    )

    retrieved_section = _section(
        "Retrieved Government Context (only source of factual claims)",
        "\n\n".join(
            f"[{doc.scheme_name}] ({doc.source_portal or 'unknown source'})\n{doc.content}"
            for doc in retrieved_docs
        )
        or "No relevant documents retrieved.",
    )

    history = conversation_history or context.conversation_history or []
    history_section = _section(
        "Conversation History",
        "\n".join(f"{turn.role}: {turn.content}" for turn in history) or "(none)",
    )

    safety_section = _section("Safety Rules", _SAFETY_PROMPT)
    output_section = _section("Output Instructions", _OUTPUT_TEMPLATE)
    query_section = _section("Current Citizen Query", query)

    return "\n".join(
        [
            _section("System Instructions", system_prompt),
            profile_section,
            eligibility_section,
            retrieved_section,
            history_section,
            safety_section,
            output_section,
            query_section,
        ]
    )
