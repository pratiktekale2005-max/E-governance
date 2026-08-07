"""
Entity Extraction Component

Extracts citizen demographic entities (State, District, Occupation, Income, Age, Gender, Category)
from user query and explicit profile metadata.
"""
from __future__ import annotations
import re
from typing import Dict, Any, Optional

INDIAN_STATES = [
    "Maharashtra", "Madhya Pradesh", "Karnataka", "West Bengal", "Delhi",
    "Gujarat", "Uttar Pradesh", "Bihar", "Tamil Nadu", "Rajasthan",
    "Punjab", "Haryana", "Kerala", "Telangana", "Andhra Pradesh",
]

OCCUPATIONS = {
    "farmer": ["farmer", "agricultural", "kisan", "farming", "crop", "शेतकरी", "किसान"],
    "student": ["student", "scholarship", "school", "college", "education", "विद्यार्थी", "छात्र"],
    "artisan": ["artisan", "craftsman", "vishwakarma", "weaver", "karigar", "कारागीर"],
    "vendor": ["street vendor", "vendor", "hawker", "pmsvanidhi", "फेरीवाला"],
}

CATEGORIES = {
    "farmer": ["farmer", "kisan", "agriculture"],
    "women": ["women", "girl", "mother", "female", "lady", "महिला", "स्त्री"],
    "health": ["health", "hospital", "dialysis", "medical", "treatment", "आरोग्य"],
    "housing": ["house", "housing", "awas", "home", "घर"],
    "social_welfare": ["pension", "disability", "senior", "bpl", "वयोवृद्ध"],
}


def extract_entities(query: str, profile_dict: Optional[dict] = None) -> Dict[str, Any]:
    """
    Extracts structured entities from text and merges with provided profile context.
    """
    profile_dict = profile_dict or {}
    q_lower = query.lower()

    # Extract State
    extracted_state = profile_dict.get("state")
    if not extracted_state:
        for st in INDIAN_STATES:
            if st.lower() in q_lower:
                extracted_state = st
                break

    # Extract Occupation
    extracted_occ = profile_dict.get("occupation")
    if not extracted_occ:
        for occ, kw_list in OCCUPATIONS.items():
            if any(kw in q_lower for kw in kw_list):
                extracted_occ = occ.capitalize()
                break

    # Extract Category
    extracted_cat = profile_dict.get("category")
    if not extracted_cat:
        for cat, kw_list in CATEGORIES.items():
            if any(kw in q_lower for kw in kw_list):
                extracted_cat = cat
                break

    # Extract Age
    extracted_age = profile_dict.get("age")
    if not extracted_age:
        age_match = re.search(r"\b(\d{1,2})\s*(?:years old|year old|yrs old|yr old|years|year|yrs|yr)\b", q_lower)
        if age_match:
            extracted_age = int(age_match.group(1))

    # Extract Gender
    extracted_gender = profile_dict.get("gender")
    if not extracted_gender:
        if any(w in q_lower for w in ["woman", "women", "female", "girl", "mother", "lady"]):
            extracted_gender = "Female"
        elif any(w in q_lower for w in ["man", "male", "boy", "father"]):
            extracted_gender = "Male"

    return {
        "state": extracted_state or "Central",
        "district": profile_dict.get("district"),
        "occupation": extracted_occ or "General Citizen",
        "category": extracted_cat or "other",
        "income": profile_dict.get("income"),
        "age": extracted_age,
        "gender": extracted_gender,
    }
