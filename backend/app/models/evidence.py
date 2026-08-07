"""
Evidence Collection Models (Module 1)
"""
from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field


class EvidenceItem(BaseModel):
    scheme_id: str = Field(..., description="Unique scheme identifier")
    chunk_id: Optional[str] = Field(None, description="Vector store chunk identifier")
    source_title: str = Field("Official Scheme Guidelines", description="Title of official document")
    source_url: str = Field(..., description="Official government domain URL")
    section: Optional[str] = Field("Eligibility", description="Document section reference")
    page: Optional[int] = Field(None, description="Page number reference")
    retrieved_at: str = Field("2026-08-08", description="Retrieval date YYYY-MM-DD")
    rule_ids: List[str] = Field(default_factory=list, description="Associated rule identifiers")
    content_snippet: Optional[str] = Field(None, description="Extracted supporting document text")
    review_status: str = Field("human_verified", description="human_verified | unverified | stale")
    last_verified_date: Optional[str] = Field("2026-08-07", description="Last human verification date")


class EvidenceCollection(BaseModel):
    query: str
    items: List[EvidenceItem] = Field(default_factory=list)


Evidence = EvidenceItem
