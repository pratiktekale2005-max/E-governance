"""
Module 4 — Canonical Scheme Schema

Every government scheme, regardless of source, is normalized into this
shape before it can move further down the pipeline (validate -> version ->
chunk -> embed).
"""
from __future__ import annotations
from datetime import date
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


class Category(str, Enum):
    FARMER = "farmer"
    STUDENT = "student"
    WOMEN = "women"
    HEALTH = "health"
    HOUSING = "housing"
    SOCIAL_WELFARE = "social_welfare"
    OTHER = "other"


class Jurisdiction(str, Enum):
    CENTRAL = "central"
    STATE = "state"


class ApplicationMode(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    BOTH = "both"
    UNKNOWN = "unknown"


class Status(str, Enum):
    DRAFT = "draft"
    EXTRACTED = "extracted"
    VALIDATED = "validated"
    REVIEW_REQUIRED = "review_required"
    PUBLISHED = "published"
    STALE = "stale"


class SchemeRecord(BaseModel):
    scheme_id: str
    scheme_name: str
    department: Optional[str] = None
    ministry: Optional[str] = None
    category: Category
    jurisdiction: Jurisdiction
    state: Optional[str] = None  # must be null for central schemes

    summary: str
    benefits: str
    eligibility: List[str] = Field(default_factory=list)
    required_documents: List[str] = Field(default_factory=list)
    application_steps: List[str] = Field(default_factory=list)
    application_mode: ApplicationMode = ApplicationMode.UNKNOWN

    official_urls: List[str] = Field(default_factory=list)
    language: str = "en"

    retrieved_date: date
    last_verified_date: date
    status: Status = Status.DRAFT

    source_id: str
    content_hash: Optional[str] = None
    version: int = 1
    related_scheme_ids: List[str] = Field(default_factory=list)

    @field_validator("state")
    @classmethod
    def state_matches_jurisdiction(cls, v, info):
        jurisdiction = info.data.get("jurisdiction")
        if jurisdiction == Jurisdiction.CENTRAL and v is not None:
            raise ValueError("central schemes must have state=null")
        if jurisdiction == Jurisdiction.STATE and not v:
            raise ValueError("state schemes must specify a state")
        return v

    @field_validator("official_urls")
    @classmethod
    def must_have_at_least_one_url(cls, v):
        if not v:
            raise ValueError("official_urls must contain at least one URL")
        return v

    def to_manifest_row(self) -> dict:
        return {
            "scheme_id": self.scheme_id,
            "scheme_name": self.scheme_name,
            "category": self.category.value,
            "jurisdiction": self.jurisdiction.value,
            "state": self.state,
            "status": self.status.value,
            "version": self.version,
            "last_verified_date": str(self.last_verified_date),
        }
