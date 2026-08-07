"""
Module 7 — Chunking & Metadata Attachment

Splits canonical SchemeRecord objects into section-level blocks (Overview, Benefits,
Eligibility, Documents, Application, Metadata) with rich metadata attached to each chunk.
"""
from __future__ import annotations
from dataclasses import dataclass
from app.schemas.scheme_schema import SchemeRecord


@dataclass
class Chunk:
    chunk_id: str
    scheme_id: str
    scheme_name: str
    category: str
    jurisdiction: str
    state: str | None
    section: str
    text: str
    official_url: str
    last_verified_date: str
    status: str
    language: str

    def to_dict(self) -> dict:
        return {
            "chunk_id": self.chunk_id,
            "scheme_id": self.scheme_id,
            "scheme_name": self.scheme_name,
            "category": self.category,
            "jurisdiction": self.jurisdiction,
            "state": self.state,
            "section": self.section,
            "text": self.text,
            "official_url": self.official_url,
            "last_verified_date": self.last_verified_date,
            "status": self.status,
            "language": self.language,
        }


def chunk_scheme(scheme: SchemeRecord) -> list[Chunk]:
    chunks: list[Chunk] = []
    base_meta = {
        "scheme_id": scheme.scheme_id,
        "scheme_name": scheme.scheme_name,
        "category": scheme.category.value,
        "jurisdiction": scheme.jurisdiction.value,
        "state": scheme.state,
        "official_url": scheme.official_urls[0] if scheme.official_urls else "",
        "last_verified_date": str(scheme.last_verified_date),
        "status": scheme.status.value,
        "language": scheme.language,
    }

    # Section 1: Overview & Summary
    if scheme.summary:
        chunks.append(
            Chunk(
                chunk_id=f"{scheme.scheme_id}#overview",
                section="overview",
                text=f"{scheme.scheme_name}. {scheme.summary}",
                **base_meta,
            )
        )

    # Section 2: Benefits
    if scheme.benefits:
        chunks.append(
            Chunk(
                chunk_id=f"{scheme.scheme_id}#benefits",
                section="benefits",
                text=f"Benefits of {scheme.scheme_name}: {scheme.benefits}",
                **base_meta,
            )
        )

    # Section 3: Eligibility
    if scheme.eligibility:
        elig_str = " ; ".join(scheme.eligibility)
        chunks.append(
            Chunk(
                chunk_id=f"{scheme.scheme_id}#eligibility",
                section="eligibility",
                text=f"Eligibility criteria for {scheme.scheme_name}: {elig_str}",
                **base_meta,
            )
        )

    # Section 4: Required Documents
    if scheme.required_documents:
        docs_str = ", ".join(scheme.required_documents)
        chunks.append(
            Chunk(
                chunk_id=f"{scheme.scheme_id}#documents",
                section="documents",
                text=f"Required documents for {scheme.scheme_name}: {docs_str}",
                **base_meta,
            )
        )

    # Section 5: Application Steps
    if scheme.application_steps:
        steps_str = " -> ".join(scheme.application_steps)
        chunks.append(
            Chunk(
                chunk_id=f"{scheme.scheme_id}#application",
                section="application",
                text=f"How to apply for {scheme.scheme_name} ({scheme.application_mode.value}): {steps_str}",
                **base_meta,
            )
        )

    return chunks
