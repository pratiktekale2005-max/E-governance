"""
Query Rewriter
==============
Rewrites vague citizen queries into specific, retrieval-friendly queries by
injecting known entities (from the query itself and/or the citizen's profile).

Example
-------
Input:  "Help me with schemes."
Profile: occupation=farmer, state=Maharashtra
Output: "Government schemes for farmer in Maharashtra"
"""

from __future__ import annotations

from app.ai.schemas import Entities, Intent

_VAGUE_MARKERS = [
    "help me", "schemes.", "scheme?", "what can i get", "options", "anything for me",
]

_INTENT_VERB = {
    Intent.SCHEME_RECOMMENDATION: "Government schemes for",
    Intent.ELIGIBILITY_CHECK: "Eligibility criteria for schemes for",
    Intent.REQUIRED_DOCUMENTS: "Required documents for schemes for",
    Intent.APPLICATION_PROCESS: "Application process for schemes for",
    Intent.SCHEME_INFORMATION: "Scheme information for",
    Intent.FAQ: "Frequently asked questions about schemes for",
}


def _is_vague(text: str) -> bool:
    text_l = text.lower().strip()
    if len(text_l.split()) <= 4:
        return True
    return any(marker in text_l for marker in _VAGUE_MARKERS)


def rewrite(raw_query: str, intent: Intent, entities: Entities, profile_entities: dict) -> str:
    """
    Produce a retrieval-friendly query.

    If the original query already looks specific (has entities and enough
    detail), it is returned unmodified. Otherwise it is rebuilt from
    known entities (query entities take priority over profile entities).
    """
    merged = {**profile_entities, **entities.as_dict()}

    if not _is_vague(raw_query) and entities.as_dict():
        return raw_query.strip()

    if not merged:
        return raw_query.strip()

    descriptors = []
    if merged.get("occupation"):
        descriptors.append(str(merged["occupation"]))
    if merged.get("category"):
        descriptors.append(f"{merged['category']} category")
    if merged.get("gender"):
        descriptors.append(str(merged["gender"]))

    subject = " ".join(descriptors) if descriptors else "citizens"

    location = ""
    if merged.get("state"):
        location = f" in {merged['state']}"
        if merged.get("district"):
            location = f" in {merged['district']}, {merged['state']}"

    prefix = _INTENT_VERB.get(intent, "Government schemes for")
    rewritten = f"{prefix} {subject}{location}".strip()
    return rewritten
