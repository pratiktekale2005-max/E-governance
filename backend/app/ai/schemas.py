"""
Shared data structures used across the AI workflow.

Keeping these in one place means every module (understanding, context,
eligibility, prompts, llm, response) speaks the same "language" and the
orchestrator can pass objects between steps without ad-hoc dicts.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Optional


class Language(str, Enum):
    ENGLISH = "en"
    HINDI = "hi"
    MARATHI = "mr"
    TAMIL = "ta"
    TELUGU = "te"
    UNKNOWN = "unknown"


class Intent(str, Enum):
    SCHEME_RECOMMENDATION = "scheme_recommendation"
    ELIGIBILITY_CHECK = "eligibility_check"
    REQUIRED_DOCUMENTS = "required_documents"
    APPLICATION_PROCESS = "application_process"
    SCHEME_INFORMATION = "scheme_information"
    FAQ = "faq"


class MatchStatus(str, Enum):
    LIKELY_MATCH = "Likely Match"
    POSSIBLE_MATCH = "Possible Match"
    OFFICIAL_VERIFICATION_REQUIRED = "Official Verification Required"
    NOT_A_MATCH = "Not a Match"


@dataclass
class Entities:
    state: Optional[str] = None
    district: Optional[str] = None
    occupation: Optional[str] = None
    income: Optional[float] = None  # annual income in INR
    age: Optional[int] = None
    gender: Optional[str] = None
    category: Optional[str] = None  # SC / ST / OBC / General / EWS
    disability: Optional[bool] = None
    education: Optional[str] = None

    def as_dict(self) -> dict:
        return {k: v for k, v in self.__dict__.items() if v is not None}


@dataclass
class QueryUnderstanding:
    raw_query: str
    language: Language
    intent: Intent
    entities: Entities
    rewritten_query: str


@dataclass
class CitizenProfile:
    """Whatever is already known/stored about the citizen (from account/DB)."""
    state: Optional[str] = None
    district: Optional[str] = None
    language: Optional[str] = None
    occupation: Optional[str] = None
    income: Optional[float] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    category: Optional[str] = None
    disability: Optional[bool] = None
    education: Optional[str] = None

    def as_dict(self) -> dict:
        return {k: v for k, v in self.__dict__.items() if v is not None}


@dataclass
class ConversationTurn:
    role: str  # "user" | "assistant"
    content: str


@dataclass
class CitizenContext:
    """Final merged context: profile <- overridden by -> current query entities."""
    merged: dict = field(default_factory=dict)
    language: Language = Language.ENGLISH
    conversation_history: list[ConversationTurn] = field(default_factory=list)
    preferences: dict = field(default_factory=dict)


@dataclass
class RetrievedDocument:
    scheme_id: str
    scheme_name: str
    department: Optional[str] = None
    source_portal: Optional[str] = None
    official_url: Optional[str] = None
    last_verified_date: Optional[str] = None
    content: str = ""
    similarity_score: float = 0.0
    metadata: dict = field(default_factory=dict)


@dataclass
class EligibilityResult:
    scheme_id: str
    scheme_name: str
    status: MatchStatus
    reason: list[str] = field(default_factory=list)
    missing_information: list[str] = field(default_factory=list)
    match_score: float = 0.0

    def as_dict(self) -> dict:
        return {
            "scheme": self.scheme_name,
            "status": self.status.value,
            "reason": self.reason,
            "missing_information": self.missing_information,
        }


@dataclass
class Citation:
    scheme_name: str
    department: Optional[str]
    official_url: Optional[str]
    last_verified_date: Optional[str]
    source_portal: Optional[str]

    def as_dict(self) -> dict:
        return {
            "scheme_name": self.scheme_name,
            "department": self.department,
            "official_url": self.official_url,
            "last_verified_date": self.last_verified_date,
            "source_portal": self.source_portal,
        }


@dataclass
class ConfidenceResult:
    score: float
    reason: str
    breakdown: dict = field(default_factory=dict)

    def as_dict(self) -> dict:
        return {"score": round(self.score, 2), "reason": self.reason}


@dataclass
class LLMResponse:
    text: str
    model: str
    finish_reason: str = "stop"
    usage: dict = field(default_factory=dict)


@dataclass
class WorkflowTrace:
    """Accumulates per-step timing/metadata for logging & debugging."""
    steps: list[dict] = field(default_factory=list)

    def log(self, step: str, **data: Any) -> None:
        self.steps.append({"step": step, **data})
