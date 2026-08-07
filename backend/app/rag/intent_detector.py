"""
Intent Classification Component

Classifies user query intent into scheme search, eligibility check, document request,
application process, complaint, office locator, or general FAQ.
"""
from __future__ import annotations
from enum import Enum
from typing import Dict, Any


class IntentType(str, Enum):
    SCHEME_SEARCH = "Scheme Search"
    ELIGIBILITY_CHECK = "Eligibility Check"
    DOCUMENT_REQUEST = "Document Request"
    APPLICATION_PROCESS = "Application Process"
    COMPLAINT = "Complaint"
    OFFICE_LOCATOR = "Office Locator"
    FAQ = "FAQ"


INTENT_KEYWORDS = {
    IntentType.ELIGIBILITY_CHECK: ["eligible", "eligibility", "who can apply", "age limit", "income limit", "criteria", "पात्रता", "पात्र"],
    IntentType.DOCUMENT_REQUEST: ["document", "documents", "paperwork", "proof", "aadhaar", "card", "कागदपत्रे", "दस्तावेज"],
    IntentType.APPLICATION_PROCESS: ["how to apply", "application", "form", "portal", "website", "process", "अर्ज", "आवेदन"],
    IntentType.COMPLAINT: ["complaint", "status", "issue", "not received", "helpline", "grievance", "तक्रार"],
    IntentType.OFFICE_LOCATOR: ["office", "csc", "center", "address", "location", "near me", "कार्यालय"],
    IntentType.SCHEME_SEARCH: ["scheme", "yojana", "help", "money", "subsidy", "assistance", "pension", "scholarship", "योजना"],
}


def detect_intent(query: str) -> Dict[str, Any]:
    """
    Classifies user intent from natural language query.
    """
    q_lower = query.lower()

    for intent, keywords in INTENT_KEYWORDS.items():
        if any(kw in q_lower for kw in keywords):
            return {"intent": intent.value, "confidence": 0.88}

    return {"intent": IntentType.FAQ.value, "confidence": 0.75}
