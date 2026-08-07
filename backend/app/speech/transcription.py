"""
transcription.py
Orchestrates the full Speech-to-Text step: raw upload bytes -> preprocessed
audio -> Whisper -> structured result.
"""

from __future__ import annotations

import logging

from app.speech.audio_utils import preprocess_upload, TARGET_SAMPLE_RATE
from app.speech.whisper_service import transcribe_audio, TranscriptionResult

logger = logging.getLogger("app.speech.transcription")

MIN_CONFIDENCE_WARNING = 0.5


class TranscriptionError(Exception):
    """Raised when the pipeline can't produce a usable transcription."""


def run_stt_pipeline(raw_audio_bytes: bytes, hint_language: str | None = None) -> TranscriptionResult:
    """Full pipeline: decode -> resample -> VAD trim -> transcribe."""
    audio = preprocess_upload(raw_audio_bytes)

    if len(audio) < TARGET_SAMPLE_RATE * 0.2:
        raise TranscriptionError("Audio too short or silent after trimming — please try again.")

    result = transcribe_audio(audio, sample_rate=TARGET_SAMPLE_RATE, hint_language=hint_language)

    if not result.text:
        raise TranscriptionError("Could not detect any speech in the provided audio.")

    if result.confidence < MIN_CONFIDENCE_WARNING:
        logger.warning(
            "Low-confidence transcription (%.2f): %r [%s]",
            result.confidence, result.text, result.language,
        )

    return result
