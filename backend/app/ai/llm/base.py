"""
Base interface all LLM provider services implement, so the orchestrator can
swap providers (or fail over between them) without caring about SDK details.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import Iterator

from app.ai.schemas import LLMResponse


class LLMService(ABC):
    provider_name: str = "base"

    @abstractmethod
    def generate(self, prompt: str, *, max_tokens: int = 1024, temperature: float = 0.3) -> LLMResponse:
        """Generate a complete (non-streamed) response."""
        raise NotImplementedError

    @abstractmethod
    def stream(self, prompt: str, *, max_tokens: int = 1024, temperature: float = 0.3) -> Iterator[str]:
        """Yield response text incrementally as it is generated."""
        raise NotImplementedError


class LLMError(Exception):
    """Raised when a provider call fails after retries."""
