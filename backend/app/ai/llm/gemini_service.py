"""
Gemini LLM Service
===================
Wraps Google's Gemini API behind the shared LLMService interface.
"""

from __future__ import annotations

import logging
import os
import time
import warnings
from collections.abc import Iterator

warnings.filterwarnings("ignore", category=FutureWarning)

from app.ai.llm.base import LLMError, LLMService
from app.ai.schemas import LLMResponse
from app.utils.config import settings

logger = logging.getLogger(__name__)

_MODEL_NAME = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
_MAX_RETRIES = 3
_BACKOFF_SECONDS = 1.0

try:
    import google.generativeai as genai  # type: ignore
    _HAS_SDK = True
except ImportError:
    _HAS_SDK = False


class GeminiService(LLMService):
    provider_name = "gemini"

    def __init__(self, api_key: str | None = None, model: str = _MODEL_NAME):
        self.api_key = api_key or getattr(settings, "GOOGLE_API_KEY", None) or os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
        self.model_name = model
        self._client_ready = False

        if _HAS_SDK and self.api_key and self.api_key != "YOUR_GEMINI_KEY":
            try:
                genai.configure(api_key=self.api_key)
                self._model = genai.GenerativeModel(self.model_name)
                self._client_ready = True
                logger.info("GeminiService initialized with model '%s'.", self.model_name)
            except Exception as exc:
                logger.warning("Failed to configure Gemini model '%s': %s", self.model_name, exc)
        else:
            logger.warning("Gemini SDK/API key unavailable -- GeminiService running in fallback mode.")

    def generate(self, prompt: str, *, max_tokens: int = 1024, temperature: float = 0.3) -> LLMResponse:
        if not self._client_ready:
            return self._mock_response(prompt)

        last_error: Exception | None = None
        for attempt in range(1, _MAX_RETRIES + 1):
            try:
                response = self._model.generate_content(
                    prompt,
                    generation_config={
                        "max_output_tokens": max_tokens,
                        "temperature": temperature,
                    },
                )
                text = getattr(response, "text", "") or ""
                usage = getattr(response, "usage_metadata", None)
                usage_dict = (
                    {
                        "prompt_tokens": getattr(usage, "prompt_token_count", None),
                        "completion_tokens": getattr(usage, "candidates_token_count", None),
                    }
                    if usage
                    else {}
                )
                return LLMResponse(text=text, model=self.model_name, usage=usage_dict)
            except Exception as exc:  # noqa: BLE001
                last_error = exc
                logger.warning("Gemini call failed (attempt %s/%s): %s", attempt, _MAX_RETRIES, exc)
                time.sleep(_BACKOFF_SECONDS * attempt)

        raise LLMError(f"Gemini generation failed after {_MAX_RETRIES} attempts: {last_error}")

    def stream(self, prompt: str, *, max_tokens: int = 1024, temperature: float = 0.3) -> Iterator[str]:
        if not self._client_ready:
            yield self._mock_response(prompt).text
            return

        try:
            response = self._model.generate_content(
                prompt,
                generation_config={
                    "max_output_tokens": max_tokens,
                    "temperature": temperature,
                },
                stream=True,
            )
            for chunk in response:
                if getattr(chunk, "text", None):
                    yield chunk.text
        except Exception as exc:  # noqa: BLE001
            logger.error("Gemini streaming failed: %s", exc)
            raise LLMError(f"Gemini streaming failed: {exc}") from exc

    @staticmethod
    def _mock_response(prompt: str) -> LLMResponse:
        return LLMResponse(
            text=(
                "Based on verified government information, here is a summary of relevant schemes. "
                "Please verify all details on the official portal."
            ),
            model="mock-gemini",
            finish_reason="mock",
        )
