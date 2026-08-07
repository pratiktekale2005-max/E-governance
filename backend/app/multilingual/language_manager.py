"""
language_manager.py
Session language tracking and auto-switching threshold manager.
"""

from __future__ import annotations

import threading
from dataclasses import dataclass

from app.speech.whisper_service import SUPPORTED_LANGUAGES

DEFAULT_LANGUAGE = "en"
AUTO_SWITCH_CONFIDENCE_THRESHOLD = 0.75


@dataclass
class LanguageState:
    language: str = DEFAULT_LANGUAGE
    locked: bool = False  # True once explicit PUT /language request occurs


class LanguageManager:
    def __init__(self) -> None:
        self._store: dict[str, LanguageState] = {}
        self._lock = threading.Lock()

    def get_language(self, session_id: str) -> str:
        with self._lock:
            state = self._store.get(session_id)
            return state.language if state else DEFAULT_LANGUAGE

    def set_language(self, session_id: str, language: str, *, explicit: bool = True) -> str:
        if language not in SUPPORTED_LANGUAGES:
            raise ValueError(f"Unsupported language '{language}'. Supported: {list(SUPPORTED_LANGUAGES)}")

        with self._lock:
            state = self._store.setdefault(session_id, LanguageState())
            if state.locked and not explicit:
                return state.language
            state.language = language
            if explicit:
                state.locked = True
            return state.language

    def maybe_update_from_detection(self, session_id: str, detected_language: str, confidence: float) -> str:
        if detected_language not in SUPPORTED_LANGUAGES:
            return self.get_language(session_id)

        with self._lock:
            state = self._store.setdefault(session_id, LanguageState())
            if state.locked:
                return state.language
            if confidence >= AUTO_SWITCH_CONFIDENCE_THRESHOLD:
                state.language = detected_language
            return state.language

    def list_supported(self) -> dict:
        return dict(SUPPORTED_LANGUAGES)


# Singleton
language_manager = LanguageManager()
