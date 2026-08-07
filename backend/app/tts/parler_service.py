"""
parler_service.py
Wraps AI4Bharat's Indic Parler-TTS model for offline, multilingual
text-to-speech running locally on CPU.
"""

from __future__ import annotations

import logging
from functools import lru_cache

import numpy as np

logger = logging.getLogger("app.tts.parler_service")

MODEL_NAME = "ai4bharat/indic-parler-tts"
DEFAULT_OUTPUT_SAMPLE_RATE = 24_000


@lru_cache(maxsize=1)
def _get_model_and_tokenizers():
    """Lazily loads the model + tokenizers once per process."""
    from parler_tts import ParlerTTSForConditionalGeneration
    from transformers import AutoTokenizer

    logger.info("Loading Indic Parler-TTS model on CPU (this can take a while on first run)...")
    device = "cpu"
    model = ParlerTTSForConditionalGeneration.from_pretrained(MODEL_NAME).to(device)
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    description_tokenizer = AutoTokenizer.from_pretrained(model.config.text_encoder._name_or_path)
    logger.info("Indic Parler-TTS model loaded.")
    return model, tokenizer, description_tokenizer, device


def synthesize(text: str, voice_description: str) -> tuple[np.ndarray, int]:
    """Generates speech audio for `text`, conditioned on `voice_description`."""
    if not text.strip():
        raise ValueError("Cannot synthesize speech for empty text.")

    try:
        import torch
        model, tokenizer, description_tokenizer, device = _get_model_and_tokenizers()
    except ImportError as exc:
        raise RuntimeError(
            "parler-tts / torch is not installed. Run: "
            "pip install torch transformers && "
            "pip install git+https://github.com/huggingface/parler-tts.git"
        ) from exc

    description_ids = description_tokenizer(voice_description, return_tensors="pt").input_ids.to(device)
    prompt_ids = tokenizer(text, return_tensors="pt").input_ids.to(device)

    with torch.no_grad():
        generation = model.generate(input_ids=description_ids, prompt_input_ids=prompt_ids)

    audio = generation.cpu().numpy().squeeze()
    sample_rate = model.config.sampling_rate or DEFAULT_OUTPUT_SAMPLE_RATE

    return audio.astype(np.float32), sample_rate


def is_available() -> bool:
    """Check if parler_tts is importable."""
    try:
        import parler_tts  # noqa: F401
        return True
    except ImportError:
        return False
