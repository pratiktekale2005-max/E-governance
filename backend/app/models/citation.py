"""
Citation Metadata Models (Module 3)
"""
from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field


class CitationItem(BaseModel):
    source_name: str = Field(..., description="Official portal or document name")
    department: Optional[str] = Field("Government Department / Ministry", description="Issuing government department")
    official_url: str = Field(..., description="Direct link to official government portal")
    section: Optional[str] = Field(None, description="Specific section name")
    page_number: Optional[int] = Field(None, description="Page number reference")
    last_verified: str = Field("2026-08-07", description="Last human verification date (YYYY-MM-DD)")


Citation = CitationItem
