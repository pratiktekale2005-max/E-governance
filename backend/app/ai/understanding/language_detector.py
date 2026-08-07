"""
Language Detector
=================
Detects the citizen's query language: English, Hindi, Marathi, Tamil, Telugu.

Approach
--------
1. Script-based detection first (fast, zero dependency): Tamil and Telugu
   have dedicated Unicode blocks, so those are unambiguous. Devanagari script
   is shared by Hindi and Marathi, so we disambiguate using a small lexicon
   of high-frequency Marathi-only function words/particles.
2. If no Indic script characters are found, fall back to English.
3. If the optional `langdetect` package is installed, it is used as a
   secondary signal to increase confidence on mixed/short queries. This is
   fully optional -- the detector works with zero external dependencies.

This is an MVP heuristic good enough for routing/prompting. For
production-grade accuracy, swap in a proper fastText/langid model behind
the same `detect()` interface.
"""

from __future__ import annotations

import re

from app.ai.schemas import Language

# Unicode block ranges
_DEVANAGARI = re.compile(r"[\u0900-\u097F]")
_TAMIL = re.compile(r"[\u0B80-\u0BFF]")
_TELUGU = re.compile(r"[\u0C00-\u0C7F]")

# High-frequency Marathi function words / verb forms that rarely appear in Hindi
_MARATHI_MARKERS = {
    "आहे", "आहेत", "नाही", "मला", "तुम्ही", "आम्ही", "काय", "कसे", "कुठे",
    "योजना", "साठी", "मध्ये", "यांना", "त्यांनी", "करतो", "करते", "झाले",
}
# High-frequency Hindi-only markers
_HINDI_MARKERS = {
    "है", "हैं", "नहीं", "मुझे", "आप", "हम", "क्या", "कैसे", "कहाँ",
    "योजना", "के लिए", "में", "उनको", "किया", "हुआ",
}

try:
    from langdetect import detect as _langdetect_detect  # type: ignore
    _HAS_LANGDETECT = True
except ImportError:
    _HAS_LANGDETECT = False


def _script_scores(text: str) -> dict[str, int]:
    return {
        "devanagari": len(_DEVANAGARI.findall(text)),
        "tamil": len(_TAMIL.findall(text)),
        "telugu": len(_TELUGU.findall(text)),
    }


def _disambiguate_devanagari(text: str) -> Language:
    marathi_hits = sum(1 for w in _MARATHI_MARKERS if w in text)
    hindi_hits = sum(1 for w in _HINDI_MARKERS if w in text)
    if marathi_hits > hindi_hits:
        return Language.MARATHI
    if hindi_hits > marathi_hits:
        return Language.HINDI
    # Tie-break using langdetect if available
    if _HAS_LANGDETECT:
        try:
            code = _langdetect_detect(text)
            if code == "mr":
                return Language.MARATHI
            if code == "hi":
                return Language.HINDI
        except Exception:
            pass
    # Default: Hindi is the more common of the two nationally
    return Language.HINDI


def detect(text: str) -> Language:
    """Detect the language of a citizen query. Defaults to English."""
    if not text or not text.strip():
        return Language.UNKNOWN

    scores = _script_scores(text)

    if scores["tamil"] > 0:
        return Language.TAMIL
    if scores["telugu"] > 0:
        return Language.TELUGU
    if scores["devanagari"] > 0:
        return _disambiguate_devanagari(text)

    # No Indic script detected -- treat as English (also covers
    # romanized/Hinglish queries, which the LLM handles fine as English).
    return Language.ENGLISH
