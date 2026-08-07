"""
Intent Detector
===============
Classifies a citizen query into one of the supported intents:
scheme_recommendation, eligibility_check, required_documents,
application_process, scheme_information, faq.

Approach: weighted keyword/regex matching across English + transliterated
Hindi/Marathi/Tamil/Telugu terms. This keeps the module dependency-free and
fast, while remaining easy to extend with more phrases per intent, or to
swap out for an ML classifier later behind the same `detect_intent()` call.
"""

from __future__ import annotations

import re

from app.ai.schemas import Intent

_PATTERNS: dict[Intent, list[str]] = {
    Intent.ELIGIBILITY_CHECK: [
        r"\beligib", r"\bqualify", r"\bcan i (apply|get)", r"\bam i\b",
        r"\bपात्र", r"\blaayak", r"\bहकदार",
    ],
    Intent.REQUIRED_DOCUMENTS: [
        r"\bdocument", r"\bpapers?\b", r"\bproof\b", r"\bcertificate",
        r"\bदस्तावेज", r"\bkagaz", r"\bआधार", r"\bproof of\b",
    ],
    Intent.APPLICATION_PROCESS: [
        r"\bhow (do|can) i apply", r"\bapplication process", r"\bhow to apply",
        r"\bसंलग्न करा", r"\bआवेदन", r"\bapply karna", r"\bregister\b", r"\bsteps? to apply",
    ],
    Intent.SCHEME_INFORMATION: [
        r"\btell me about\b", r"\bwhat is\b.*\bscheme\b", r"\bdetails? (of|about)\b",
        r"\bबद्दल सांगा", r"\byojana.*(kay|kya) hai",
    ],
    Intent.SCHEME_RECOMMENDATION: [
        r"\bschemes?\b.*\b(for|available)\b", r"\bwhich schemes?\b",
        r"\bhelp me with schemes\b", r"\bsuggest.*scheme", r"\brecommend.*scheme",
        r"\byojana", r"\bकोणत्या योजना", r"\bकौन सी योजना",
    ],
    Intent.FAQ: [
        r"\bwhat happens if\b", r"\bhow long does\b", r"\bwhy\b", r"\bfaq\b",
        r"\bgeneral question\b",
    ],
}

# Priority order used when multiple intents match with equal score.
# Narrower/more specific intents win over the broad "recommendation" catch-all.
_PRIORITY = [
    Intent.ELIGIBILITY_CHECK,
    Intent.REQUIRED_DOCUMENTS,
    Intent.APPLICATION_PROCESS,
    Intent.SCHEME_INFORMATION,
    Intent.FAQ,
    Intent.SCHEME_RECOMMENDATION,
]


def detect_intent(text: str) -> Intent:
    """Classify the query intent. Defaults to SCHEME_RECOMMENDATION."""
    text_l = (text or "").lower()

    scores: dict[Intent, int] = {intent: 0 for intent in Intent}
    for intent, patterns in _PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, text_l, flags=re.IGNORECASE | re.UNICODE):
                scores[intent] += 1

    best_score = max(scores.values())
    if best_score == 0:
        return Intent.SCHEME_RECOMMENDATION  # sensible default for vague queries

    for intent in _PRIORITY:
        if scores[intent] == best_score:
            return intent

    return Intent.SCHEME_RECOMMENDATION
