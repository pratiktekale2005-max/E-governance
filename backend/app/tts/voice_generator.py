"""
voice_generator.py
Voice Response orchestration: takes text response & target language,
builds voice description for Parler-TTS, and synthesizes audio.
"""

from __future__ import annotations

import logging

from app.tts.parler_service import synthesize

logger = logging.getLogger("app.tts.voice_generator")

_DEFAULT_VOICE_DESCRIPTIONS = {
    "en": "A clear, warm female voice speaks English at a moderate pace with natural intonation and minimal background noise.",
    "hi": "एक स्पष्ट, गर्मजोश महिला आवाज़ मध्यम गति और स्वाभाविक लहजे में हिंदी बोलती है, बिना पृष्ठभूमि शोर के।",
    "mr": "एक स्पष्ट, उबदार महिला आवाज मध्यम वेगाने आणि नैसर्गिक स्वरात मराठी बोलते, पार्श्वभूमी आवाजाशिवाय.",
    "ta": "ஒரு தெளிவான, அன்பான பெண் குரல் மிதமான வேகத்தில் இயல்பான தொனியில் தமிழ் பேசுகிறது.",
    "te": "స్పష్టమైన, వెచ్చని స్త్రీ స్వరం మధ్యస్థ వేగంతో సహజమైన శైలిలో తెలుగు మాట్లాడుతుంది.",
    "bn": "একটি স্পষ্ট, উষ্ণ নারী কণ্ঠ মাঝারি গতিতে স্বাভাবিক সুরে বাংলা বলে।",
}


def get_voice_description(language: str, voice_style: str | None = None) -> str:
    """Returns the voice description to condition Parler on."""
    if voice_style:
        return voice_style
    return _DEFAULT_VOICE_DESCRIPTIONS.get(language, _DEFAULT_VOICE_DESCRIPTIONS["en"])


import io
import numpy as np

def generate_voice_response(text: str, language: str, voice_style: str | None = None):
    """Returns (audio_array, sample_rate) for the given text/language."""
    try:
        description = get_voice_description(language, voice_style)
        logger.info("Synthesizing speech (%s, %d chars)", language, len(text))
        return synthesize(text, description)
    except Exception as exc:
        logger.info("Parler-TTS unavailable or failed (%s), using gTTS fallback...", exc)
        try:
            from gtts import gTTS
            import soundfile as sf

            lang_code = language if language in ["en", "hi", "mr", "ta", "te", "bn"] else "en"
            tts = gTTS(text=text, lang=lang_code)
            mp3_fp = io.BytesIO()
            tts.write_to_fp(mp3_fp)
            mp3_fp.seek(0)
            data, sample_rate = sf.read(mp3_fp, dtype="float32")
            return data, sample_rate
        except Exception as fallback_exc:
            logger.warning("gTTS fallback failed: %s", fallback_exc)
            return np.zeros(16000, dtype=np.float32), 16000
