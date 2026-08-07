"""
Module 8 — Text Embedding Generator

Generates normalized vector embeddings for text chunks.
Uses sentence-transformers ('all-MiniLM-L6-v2') if available, with a fast
hashing vectorizer fallback for standalone offline environments.
"""
from __future__ import annotations
import math
import re
from typing import List

DIM = 384

_st_model = None

try:
    from sentence_transformers import SentenceTransformer
    _st_model = SentenceTransformer("all-MiniLM-L6-v2")
except Exception:
    _st_model = None


def _hashing_vectorizer(text: str, dim: int = DIM) -> List[float]:
    words = re.findall(r"\w+", text.lower())
    vec = [0.0] * dim
    for w in words:
        h = 0
        for ch in w:
            h = (h * 31 + ord(ch)) & 0xFFFFFFFF
        idx = h % dim
        vec[idx] += 1.0

    norm = math.sqrt(sum(v * v for v in vec))
    if norm > 0:
        vec = [v / norm for v in vec]
    return vec


def embed_texts(texts: List[str]) -> List[List[float]]:
    if not texts:
        return []

    if _st_model is not None:
        try:
            embeddings = _st_model.encode(texts, normalize_embeddings=True)
            return embeddings.tolist()
        except Exception:
            pass

    return [_hashing_vectorizer(t) for t in texts]
