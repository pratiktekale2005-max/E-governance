"""
whisper_service.py
Wraps faster-whisper (CTranslate2 backend) running the "tiny" model on CPU.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from functools import lru_cache

try:
    from faster_whisper import WhisperModel
except ImportError:
    WhisperModel = None

logger = logging.getLogger("app.speech.whisper_service")

# Supported languages for this project (ISO 639-1 codes used by Whisper)
SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
    "ta": "Tamil",
    "te": "Telugu",
    "bn": "Bengali",
}


@dataclass
class TranscriptionResult:
    text: str
    language: str
    confidence: float

    def to_dict(self) -> dict:
        return {"text": self.text, "language": self.language, "confidence": round(self.confidence, 4)}


@lru_cache(maxsize=1)
def get_model():
    """Loads the Whisper Tiny model once per process."""
    if WhisperModel is None:
        logger.warning("faster_whisper module is not installed.")
        return None
    logger.info("Loading faster-whisper tiny model (CPU, int8)...")
    model = WhisperModel("tiny", device="cpu", compute_type="int8")
    logger.info("Whisper model loaded.")
    return model


def transcribe_audio(audio, sample_rate: int = 16_000, hint_language: str | None = None) -> TranscriptionResult:
    """Runs STT + language ID on a preprocessed 16kHz mono float32 array."""
    model = get_model()
    if model is None:
        return TranscriptionResult(text="", language=hint_language or "en", confidence=0.0)

    segments, info = model.transcribe(
        audio,
        language=hint_language,
        vad_filter=True,
        vad_parameters=dict(min_silence_duration_ms=300),
        beam_size=5,
    )

    text_parts = []
    avg_logprobs = []
    for segment in segments:
        text_parts.append(segment.text.strip())
        if segment.avg_logprob is not None:
            avg_logprobs.append(segment.avg_logprob)

    full_text = " ".join(p for p in text_parts if p).strip()

    lang_prob = float(info.language_probability) if info.language_probability else 0.0
    if avg_logprobs:
        logprob_conf = float(np.clip(1.0 + (sum(avg_logprobs) / len(avg_logprobs)), 0.0, 1.0))
        confidence = (lang_prob + logprob_conf) / 2
    else:
        confidence = lang_prob

    detected_language = info.language

    if not full_text:
        logger.warning("Whisper produced empty transcription (likely silence or noise-only clip).")

    return TranscriptionResult(text=full_text, language=detected_language, confidence=confidence)
