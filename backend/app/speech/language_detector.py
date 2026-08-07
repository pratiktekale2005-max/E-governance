"""
language_detector.py
For text input (a citizen typing instead of speaking), detect the language
before routing to the AI pipeline.
"""

from __future__ import annotations

import logging

from langdetect import DetectorFactory, detect_langs

from app.speech.whisper_service import SUPPORTED_LANGUAGES

logger = logging.getLogger("app.speech.language_detector")

# make detection deterministic across runs
DetectorFactory.seed = 0

_LANGDETECT_TO_PROJECT = {
    "en": "en",
    "hi": "hi",
    "mr": "mr",
    "ta": "ta",
    "te": "te",
    "bn": "bn",
}


def detect_text_language(text: str, fallback: str = "en") -> tuple[str, float]:
    """Returns (language_code, confidence)."""
    text = (text or "").strip()
    if not text:
        return fallback, 0.0

    try:
        candidates = detect_langs(text)
    except Exception as exc:
        logger.warning("Language detection failed for text input: %s", exc)
        return fallback, 0.0

    for candidate in candidates:
        project_code = _LANGDETECT_TO_PROJECT.get(candidate.lang)
        if project_code and project_code in SUPPORTED_LANGUAGES:
            return project_code, float(candidate.prob)

    logger.info("Detected language not in supported set, falling back to %s", fallback)
    return fallback, 0.0
