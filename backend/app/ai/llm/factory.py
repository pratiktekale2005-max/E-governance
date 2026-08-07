"""
LLM Factory
============
Selects the active LLM provider (Gemini or OpenAI) based on config/env, and
provides automatic failover: if the primary provider errors out, the
orchestrator can fall back to the secondary provider.
"""

from __future__ import annotations

import os

from app.ai.llm.base import LLMService
from app.ai.llm.gemini_service import GeminiService
from app.ai.llm.openai_service import OpenAIService

_PROVIDERS = {
    "gemini": GeminiService,
    "openai": OpenAIService,
}


def get_llm_service(provider: str | None = None) -> LLMService:
    """Instantiate the requested provider (default from LLM_PROVIDER env, else gemini)."""
    provider = (provider or os.environ.get("LLM_PROVIDER", "gemini")).lower()
    if provider not in _PROVIDERS:
        raise ValueError(f"Unknown LLM provider '{provider}'. Choose from {list(_PROVIDERS)}.")
    return _PROVIDERS[provider]()


def get_fallback_chain() -> list[LLMService]:
    """Primary provider first, other providers as fallback, in a stable order."""
    primary = os.environ.get("LLM_PROVIDER", "gemini").lower()
    order = [primary] + [p for p in _PROVIDERS if p != primary]
    return [_PROVIDERS[p]() for p in order]
