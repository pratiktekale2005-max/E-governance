"""
OpenAI LLM Service
===================
Wraps the OpenAI Chat Completions API behind the shared LLMService interface.
Handles retries with backoff, streaming, and basic token/usage tracking.
Requires OPENAI_API_KEY in the environment.

Degrades to a clearly-labeled mock response when the `openai` package or an
API key isn't available, so the pipeline stays runnable/testable offline.
"""

from __future__ import annotations

import logging
import os
import time
from collections.abc import Iterator

from app.ai.llm.base import LLMError, LLMService
from app.ai.schemas import LLMResponse

logger = logging.getLogger(__name__)

_MODEL_NAME = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
_MAX_RETRIES = 3
_BACKOFF_SECONDS = 1.5

try:
    from openai import OpenAI  # type: ignore
    _HAS_SDK = True
except ImportError:
    _HAS_SDK = False


class OpenAIService(LLMService):
    provider_name = "openai"

    def __init__(self, api_key: str | None = None, model: str = _MODEL_NAME):
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY")
        self.model_name = model
        self._client_ready = False

        if _HAS_SDK and self.api_key:
            self._client = OpenAI(api_key=self.api_key)
            self._client_ready = True
        else:
            logger.warning(
                "OpenAI SDK/API key unavailable -- OpenAIService running in MOCK mode."
            )

    def generate(self, prompt: str, *, max_tokens: int = 1024, temperature: float = 0.3) -> LLMResponse:
        if not self._client_ready:
            return self._mock_response(prompt)

        last_error: Exception | None = None
        for attempt in range(1, _MAX_RETRIES + 1):
            try:
                completion = self._client.chat.completions.create(
                    model=self.model_name,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=max_tokens,
                    temperature=temperature,
                )
                choice = completion.choices[0]
                usage = completion.usage
                usage_dict = (
                    {
                        "prompt_tokens": usage.prompt_tokens,
                        "completion_tokens": usage.completion_tokens,
                        "total_tokens": usage.total_tokens,
                    }
                    if usage
                    else {}
                )
                return LLMResponse(
                    text=choice.message.content or "",
                    model=self.model_name,
                    finish_reason=choice.finish_reason or "stop",
                    usage=usage_dict,
                )
            except Exception as exc:  # noqa: BLE001
                last_error = exc
                logger.warning("OpenAI call failed (attempt %s/%s): %s", attempt, _MAX_RETRIES, exc)
                time.sleep(_BACKOFF_SECONDS * attempt)

        raise LLMError(f"OpenAI generation failed after {_MAX_RETRIES} attempts: {last_error}")

    def stream(self, prompt: str, *, max_tokens: int = 1024, temperature: float = 0.3) -> Iterator[str]:
        if not self._client_ready:
            yield self._mock_response(prompt).text
            return

        try:
            stream = self._client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens,
                temperature=temperature,
                stream=True,
            )
            for chunk in stream:
                delta = chunk.choices[0].delta
                if delta and delta.content:
                    yield delta.content
        except Exception as exc:  # noqa: BLE001
            logger.error("OpenAI streaming failed: %s", exc)
            raise LLMError(f"OpenAI streaming failed: {exc}") from exc

    @staticmethod
    def _mock_response(prompt: str) -> LLMResponse:
        return LLMResponse(
            text=(
                "[MOCK OPENAI RESPONSE - configure OPENAI_API_KEY and install "
                "openai for real responses]\n\n"
                "Based on the retrieved government information, here is a summary "
                "of relevant schemes. Please verify all details on the official portal."
            ),
            model="mock-openai",
            finish_reason="mock",
        )
