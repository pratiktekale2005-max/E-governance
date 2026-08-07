"""
audio_utils.py
Low-level audio helpers used by the speech pipeline:
 - load raw upload bytes into a numpy float32 array
 - resample to 16kHz mono (what Whisper expects)
 - simple energy-based Voice Activity Detection (VAD) to trim silence
 - save numpy audio back to WAV bytes (used by the TTS output stage too)
"""

from __future__ import annotations

import io
try:
    import soundfile as sf
except ImportError:
    sf = None

TARGET_SAMPLE_RATE = 16_000


def load_audio_bytes(raw_bytes: bytes) -> tuple[np.ndarray, int]:
    """Decode arbitrary uploaded audio bytes (wav/ogg/flac/etc) into a mono float32 numpy array + sample rate."""
    if sf is None:
        return np.array([], dtype=np.float32), TARGET_SAMPLE_RATE
    data, sample_rate = sf.read(io.BytesIO(raw_bytes), dtype="float32", always_2d=False)
    if data.ndim > 1:
        data = data.mean(axis=1)
    return data, sample_rate


def resample_to_target(audio: np.ndarray, orig_sr: int, target_sr: int = TARGET_SAMPLE_RATE) -> np.ndarray:
    """Linear-interpolation resampler for speech."""
    if orig_sr == target_sr:
        return audio.astype(np.float32)

    duration = len(audio) / orig_sr
    target_len = int(round(duration * target_sr))
    if target_len <= 0:
        return np.zeros(0, dtype=np.float32)

    orig_idx = np.linspace(0, len(audio) - 1, num=len(audio))
    target_idx = np.linspace(0, len(audio) - 1, num=target_len)
    resampled = np.interp(target_idx, orig_idx, audio)
    return resampled.astype(np.float32)


def energy_vad_trim(audio: np.ndarray, sample_rate: int, frame_ms: int = 30, energy_threshold: float = 0.008) -> np.ndarray:
    """Trims leading/trailing silence using short-frame RMS energy."""
    if len(audio) == 0:
        return audio

    frame_len = max(1, int(sample_rate * frame_ms / 1000))
    n_frames = max(1, len(audio) // frame_len)

    voiced_frame_indices = []
    for i in range(n_frames):
        frame = audio[i * frame_len:(i + 1) * frame_len]
        rms = np.sqrt(np.mean(frame ** 2)) if len(frame) else 0.0
        if rms > energy_threshold:
            voiced_frame_indices.append(i)

    if not voiced_frame_indices:
        return audio

    start = voiced_frame_indices[0] * frame_len
    end = min(len(audio), (voiced_frame_indices[-1] + 1) * frame_len)
    return audio[start:end]


def audio_to_wav_bytes(audio: np.ndarray, sample_rate: int) -> bytes:
    """Encode a float32 numpy array back into WAV bytes for an API response."""
    buf = io.BytesIO()
    sf.write(buf, audio, sample_rate, format="WAV", subtype="PCM_16")
    return buf.getvalue()


def preprocess_upload(raw_bytes: bytes) -> np.ndarray:
    """Full preprocessing chain used by the STT endpoint."""
    audio, sr = load_audio_bytes(raw_bytes)
    audio = resample_to_target(audio, sr, TARGET_SAMPLE_RATE)
    audio = energy_vad_trim(audio, TARGET_SAMPLE_RATE)
    return audio
