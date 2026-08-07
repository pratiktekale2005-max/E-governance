"""
audio_output.py
Encodes raw numpy audio array to WAV bytes or base64 string.
"""

from __future__ import annotations

import base64
import io

import numpy as np
try:
    import soundfile as sf
except ImportError:
    sf = None


def encode_wav(audio: np.ndarray, sample_rate: int) -> bytes:
    if sf is None:
        return b""
    buf = io.BytesIO()
    sf.write(buf, audio, sample_rate, format="WAV", subtype="PCM_16")
    return buf.getvalue()


def encode_wav_base64(audio: np.ndarray, sample_rate: int) -> str:
    """Base64 encode WAV for JSON API responses."""
    return base64.b64encode(encode_wav(audio, sample_rate)).decode("ascii")


def save_to_disk(audio: np.ndarray, sample_rate: int, path: str) -> str:
    sf.write(path, audio, sample_rate, format="WAV", subtype="PCM_16")
    return path
