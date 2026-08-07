"""
ai_processor.py
Module 3 (AI Processing): Eligibility Engine -> RAG Retrieval -> Memory -> Gemini.
Integrated with app.services.retrieval_service for RAG context retrieval.
"""

from __future__ import annotations

import logging
import os
from typing import Callable, Optional

try:
    from google import genai
    from google.genai import types as genai_types
except (ImportError, AttributeError):
    import google.generativeai as genai
    genai_types = None

from app.multilingual.prompt_builder import build_messages
from app.multilingual.response_formatter import format_for_display, format_for_speech

logger = logging.getLogger("app.multilingual.ai_processor")

GEMINI_MODEL_NAME = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")

# Signature: (query: str, language: str, citizen_profile: dict | None) -> str | None
EligibilityFn = Callable[[str, str, Optional[dict]], Optional[str]]
RagFn = Callable[[str, str], Optional[str]]

eligibility_engine: Optional[EligibilityFn] = None
rag_retriever: Optional[RagFn] = None


def default_rag_retriever(query: str, language: str) -> str | None:
    """Default RAG hook using backend's RetrievalService."""
    try:
        from app.services.retrieval_service import RetrievalService, CitizenProfile
        service = RetrievalService()
        res = service.retrieve(question=query, profile=CitizenProfile(language=language))
        matched = res.get("matched_schemes", [])
        if not matched:
            return None
        chunks = []
        for scheme in matched[:3]:
            scheme_info = f"Scheme: {scheme.get('scheme_name')} ({scheme.get('category')})"
            sections = [f"- {sec.get('section')}: {sec.get('text')}" for sec in scheme.get("matched_sections", [])[:2]]
            chunks.append(scheme_info + "\n" + "\n".join(sections))
        return "\n\n".join(chunks)
    except Exception as exc:
        logger.warning(f"Default RAG retrieval error: {exc}")
        return None


def _get_client() -> genai.Client:
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY / GOOGLE_API_KEY is not set. Add it to your environment or .env file."
        )
    return genai.Client(api_key=api_key)


def _gather_context(query: str, language: str, citizen_profile: dict | None) -> str | None:
    context_chunks = []

    retriever = rag_retriever or default_rag_retriever
    try:
        rag_context = retriever(query, language)
        if rag_context:
            context_chunks.append(rag_context)
    except Exception:
        logger.exception("RAG retrieval hook failed; continuing without it.")

    if eligibility_engine is not None:
        try:
            eligibility_note = eligibility_engine(query, language, citizen_profile)
            if eligibility_note:
                context_chunks.append(f"Eligibility notes: {eligibility_note}")
        except Exception:
            logger.exception("Eligibility engine hook failed; continuing without it.")

    return "\n\n".join(context_chunks) if context_chunks else None


def _messages_to_gemini_contents(messages: list[dict]) -> tuple[str | None, list[genai_types.Content]]:
    system_instruction = None
    contents: list[genai_types.Content] = []
    for m in messages:
        if m["role"] == "system":
            system_instruction = m["content"]
        elif m["role"] == "user":
            contents.append(genai_types.Content(role="user", parts=[genai_types.Part.from_text(text=m["content"])]))
        elif m["role"] == "assistant":
            contents.append(genai_types.Content(role="model", parts=[genai_types.Part.from_text(text=m["content"])]))
    return system_instruction, contents


def generate_response(
    query: str,
    language: str,
    conversation_history: list[dict] | None = None,
    citizen_profile: dict | None = None,
) -> dict:
    """Runs full AI processing stage and returns display-ready and speech-ready answers."""
    client = _get_client()

    context = _gather_context(query, language, citizen_profile)
    messages = build_messages(language, query, conversation_history, retrieved_context=context)
    system_instruction, contents = _messages_to_gemini_contents(messages)

    result = client.models.generate_content(
        model=GEMINI_MODEL_NAME,
        contents=contents,
        config=genai_types.GenerateContentConfig(system_instruction=system_instruction),
    )
    raw_text = result.text or ""

    return {
        "text": format_for_display(raw_text),
        "speech_text": format_for_speech(raw_text),
        "language": language,
    }
