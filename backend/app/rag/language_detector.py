"""
Language Detection Component

Detects query language (English, Hindi, Marathi, Tamil, Telugu, etc.)
with confidence scoring and fallback.
"""
from __future__ import annotations
from typing import Dict, Any

try:
    from langdetect import detect_langs
except Exception:
    detect_langs = None


LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
    "ta": "Tamil",
    "te": "Telugu",
    "bn": "Bengali",
    "gu": "Gujarati",
    "kn": "Kannada",
    "ml": "Malayalam",
    "pa": "Punjabi",
}


def detect_language(query: str) -> Dict[str, Any]:
    """
    Detects language code and display name for user query.
    """
    if not query or len(query.strip()) < 3:
        return {"code": "en", "name": "English", "confidence": 1.0}

    # Devanagari script check for Hindi/Marathi
    has_devanagari = any("\u0900" <= char <= "\u097F" for char in query)
    if has_devanagari:
        # Simple heuristic check for Marathi specific words
        marathi_markers = ["आहे", "नाही", "माझी", "योजना", "कागदपत्रे", "कसे"]
        is_marathi = any(marker in query for marker in marathi_markers)
        code = "mr" if is_marathi else "hi"
        return {"code": code, "name": LANGUAGE_NAMES.get(code, "Hindi/Marathi"), "confidence": 0.95}

    if detect_langs:
        try:
            predictions = detect_langs(query)
            if predictions:
                top = predictions[0]
                code = str(top.lang)
                if code in LANGUAGE_NAMES:
                    return {"code": code, "name": LANGUAGE_NAMES[code], "confidence": round(float(top.prob), 2)}
        except Exception:
            pass

    return {"code": "en", "name": "English", "confidence": 0.90}
