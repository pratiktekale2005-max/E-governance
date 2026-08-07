"""
Module 8 — Required Document Mapping Engine
Maps scheme document requirements to issuing authorities and official download links with alternative document support.
"""
from __future__ import annotations

from typing import List
from app.models.pre_screening_result import RequiredDocumentDetail

DOCUMENT_AUTHORITY_MAP = {
    "aadhaar": ("Aadhaar Card", "Unique Identification Authority of India (UIDAI)", "https://uidai.gov.in"),
    "income": ("Income Certificate", "Revenue Department / Tahsildar Office", "https://serviceonline.gov.in"),
    "bpl": ("BPL Ration Card", "Food & Civil Supplies Department", "https://nfsa.gov.in"),
    "caste": ("Caste / Category Certificate", "Sub-Divisional Magistrate (SDM) / Revenue Dept", "https://serviceonline.gov.in"),
    "land": ("Land Ownership Record (7/12 Extract / Khatauni)", "Revenue Department / Mahabhulekh", "https://mahabhulekh.maharashtra.gov.in"),
    "bank": ("Bank Account Passbook", "Scheduled Commercial Bank / Post Office", None),
    "bonafide": ("Bonafide Student Certificate", "Educational Institution / College Principal", None),
    "disability": ("Disability Certificate (UDID)", "Department of Empowerment of Persons with Disabilities", "https://www.swavlambancard.gov.in"),
    "ration": ("Ration Card", "Food & Civil Supplies Department", "https://nfsa.gov.in"),
    "photo": ("Passport Size Photograph", "Self-Provided", None),
}


def map_required_documents(raw_docs: List[str]) -> List[RequiredDocumentDetail]:
    """
    Maps raw document list into detailed structured document requirements.
    Supports alternative requirements ("Income Certificate OR BPL Card").
    """
    details: List[RequiredDocumentDetail] = []

    for item in raw_docs:
        raw_str = item.strip()
        lower_str = raw_str.lower()

        import re
        if re.search(r'\s+or\s+', lower_str, re.IGNORECASE):
            parts = re.split(r'\s+or\s+', raw_str, flags=re.IGNORECASE)
            group_id = f"alt_group_{hash(raw_str) & 0xffff}"
            for part in parts:
                p_clean = part.strip()
                p_lower = p_clean.lower()
                doc_name, authority, link = _match_doc_metadata(p_clean, p_lower)
                details.append(
                    RequiredDocumentDetail(
                        document_name=doc_name,
                        issuing_authority=authority,
                        official_download_link=link,
                        is_alternative=True,
                        alternative_group_id=group_id,
                    )
                )
        else:
            doc_name, authority, link = _match_doc_metadata(raw_str, lower_str)
            details.append(
                RequiredDocumentDetail(
                    document_name=doc_name,
                    issuing_authority=authority,
                    official_download_link=link,
                    is_alternative=False,
                    alternative_group_id=None,
                )
            )

    return details


def _match_doc_metadata(raw_name: str, lower_name: str) -> tuple[str, str, str | None]:
    for key, (std_name, authority, link) in DOCUMENT_AUTHORITY_MAP.items():
        if key in lower_name:
            return std_name, authority, link
    return raw_name, "Competent Government Authority", None
