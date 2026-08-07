"""
Entity Extractor
================
Pulls structured fields out of a free-text citizen query:
state, district, occupation, income, age, gender, category, disability, education.

Implementation is a rule/lexicon-based extractor (regex + gazetteer lists),
chosen deliberately over a black-box NER model so that:
  - it works fully offline / with zero ML dependencies,
  - every extraction is traceable to a rule (important for an explainable,
    government-facing system),
  - it is trivial to extend with more states/occupations/synonyms.

Swap in a proper NER model later behind the same `extract()` interface if needed.
"""

from __future__ import annotations

import re

from app.ai.schemas import Entities

INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
    "West Bengal", "Delhi",
]

OCCUPATIONS = {
    "farmer": ["farmer", "farming", "agriculture", "kisan", "किसान", "शेतकरी"],
    "laborer": ["laborer", "labourer", "daily wage", "mazdoor", "मजदूर"],
    "student": ["student", "studying", "छात्र", "विद्यार्थी"],
    "self-employed": ["self employed", "self-employed", "business owner", "shopkeeper"],
    "unemployed": ["unemployed", "jobless", "no job", "बेरोजगार"],
    "government employee": ["government employee", "govt employee", "sarkari naukri"],
    "private employee": ["private employee", "private job", "salaried"],
    "artisan": ["artisan", "weaver", "craftsman", "कारीगर"],
    "fisherman": ["fisherman", "fisher", "मछुआरा"],
}

CATEGORY_TERMS = {
    "SC": ["sc", "scheduled caste", "अनुसूचित जाति"],
    "ST": ["st", "scheduled tribe", "अनुसूचित जनजाति"],
    "OBC": ["obc", "other backward class", "इतर मागासवर्गीय"],
    "EWS": ["ews", "economically weaker section"],
    "General": ["general category", "unreserved"],
}

EDUCATION_TERMS = {
    "below 10th": ["below 10th", "no formal education", "illiterate"],
    "10th pass": ["10th pass", "matriculate", "ssc"],
    "12th pass": ["12th pass", "higher secondary", "hsc"],
    "graduate": ["graduate", "bachelor", "b.a", "b.sc", "b.com", "b.tech"],
    "postgraduate": ["postgraduate", "master", "m.a", "m.sc", "mba"],
}

_GENDER_TERMS = {
    "male": ["male", "man", "पुरुष"],
    "female": ["female", "woman", "महिला", "स्त्री"],
    "transgender": ["transgender", "third gender", "किन्नर"],
}

_DISABILITY_TERMS = ["disability", "disabled", "divyang", "दिव्यांग", "पीडब्ल्यूडी", "pwd"]

# "45 years old", "45 yrs old", "45 साल", "उम्र 45"
_AGE_YEARS_OLD_RE = re.compile(r"\b(\d{1,3})\s*(?:years?|yrs?|साल|वर्ष)\s*(?:old|age|उम्र)?\b", re.IGNORECASE)
_AGE_CONTEXT_RE = re.compile(r"\b(?:age|aged|umar|उम्र)\D{0,5}(\d{1,3})\b", re.IGNORECASE)

# Income: handles "₹2 lakh", "2,00,000", "50000 rupees", "3 lakh per year"
_INCOME_LAKH_RE = re.compile(r"(?:₹|rs\.?|inr)?\s*([\d,.]+)\s*(lakh|lakhs|lac)\b", re.IGNORECASE)
_INCOME_PLAIN_RE = re.compile(r"(?:₹|rs\.?|inr)\s*([\d,]{4,})", re.IGNORECASE)


def _find_state(text_l: str) -> str | None:
    for state in INDIAN_STATES:
        if state.lower() in text_l:
            return state
    return None


def _find_from_lexicon(text_l: str, lexicon: dict[str, list[str]]) -> str | None:
    for canonical, synonyms in lexicon.items():
        for term in synonyms:
            term_l = term.lower()
            # Multi-word terms / non-ASCII (Devanagari, Tamil, Telugu) terms are
            # matched as plain substrings; single ASCII words use a word
            # boundary so short terms like "sc" don't match inside "schemes".
            if " " in term_l or not term_l.isascii():
                if term_l in text_l:
                    return canonical
            elif re.search(rf"\b{re.escape(term_l)}\b", text_l):
                return canonical
    return None


def _find_income(text_l: str) -> float | None:
    m = _INCOME_LAKH_RE.search(text_l)
    if m:
        try:
            value = float(m.group(1).replace(",", ""))
            return value * 100_000
        except ValueError:
            pass
    m = _INCOME_PLAIN_RE.search(text_l)
    if m:
        try:
            return float(m.group(1).replace(",", ""))
        except ValueError:
            pass
    return None


def _find_age(text_l: str) -> int | None:
    m = _AGE_CONTEXT_RE.search(text_l)
    if m:
        return int(m.group(1))
    m = _AGE_YEARS_OLD_RE.search(text_l)
    if m:
        return int(m.group(1))
    return None


def _find_disability(text_l: str) -> bool | None:
    for term in _DISABILITY_TERMS:
        if term.lower() in text_l:
            return True
    return None


def extract(text: str) -> Entities:
    """Extract structured entities from a free-text citizen query."""
    text_l = (text or "").lower()

    return Entities(
        state=_find_state(text_l),
        district=None,  # left for gazetteer/DB lookup keyed off detected state
        occupation=_find_from_lexicon(text_l, OCCUPATIONS),
        income=_find_income(text_l),
        age=_find_age(text_l),
        gender=_find_from_lexicon(text_l, _GENDER_TERMS),
        category=_find_from_lexicon(text_l, CATEGORY_TERMS),
        disability=_find_disability(text_l),
        education=_find_from_lexicon(text_l, EDUCATION_TERMS),
    )
