"""
Citizen Context Builder
========================
Merges the citizen's stored profile with information extracted from the
current query, conversation history, and preferences into one final
context object used by every downstream module.

Precedence rule: the CURRENT QUERY always overrides the stored PROFILE for
any field present in both (the citizen is telling us something new/updated
right now). Missing fields fall back to the profile.

Example
-------
Profile:  state=Maharashtra, language=mr, occupation=farmer
Query:    income=200000
Result:   state=Maharashtra, occupation=farmer, income=200000, language=mr
"""

from __future__ import annotations

from app.ai.schemas import CitizenContext, CitizenProfile, ConversationTurn, Entities, Language


def build_context(
    profile: CitizenProfile,
    query_entities: Entities,
    detected_language: Language,
    conversation_history: list[ConversationTurn] | None = None,
    preferences: dict | None = None,
) -> CitizenContext:
    """Merge profile + query + history + preferences into a CitizenContext."""
    merged = {**profile.as_dict(), **query_entities.as_dict()}

    # Language resolution: explicit detection from the current query wins;
    # otherwise fall back to the citizen's stored language preference.
    if detected_language and detected_language != Language.UNKNOWN:
        resolved_language = detected_language
    elif profile.language:
        try:
            resolved_language = Language(profile.language)
        except ValueError:
            resolved_language = Language.ENGLISH
    else:
        resolved_language = Language.ENGLISH

    return CitizenContext(
        merged=merged,
        language=resolved_language,
        conversation_history=conversation_history or [],
        preferences=preferences or {},
    )
