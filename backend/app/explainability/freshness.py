"""
Module 6 — Freshness Checker & Stale Data Validator
Validates evidence freshness and generates stale data warnings when sources exceed threshold limits.
"""
from __future__ import annotations

from typing import List, Optional
from datetime import datetime, date
from app.models.evidence import EvidenceItem


STALE_WARNING = (
    "This information has not been verified recently. "
    "Please check the official portal before applying."
)


def validate_freshness(evidence_items: List[EvidenceItem], max_days_old: int = 180) -> tuple[bool, Optional[str], Optional[str]]:
    """
    Validates freshness of evidence items.
    Returns (is_fresh, latest_verified_date, freshness_warning).
    """
    if not evidence_items:
        return True, "2026-08-07", None

    today = date.today()
    latest_date_str = "2026-08-07"
    stale_found = False

    for item in evidence_items:
        v_date_str = item.last_verified_date or "2026-08-07"
        if v_date_str > latest_date_str:
            latest_date_str = v_date_str

        try:
            v_dt = datetime.strptime(v_date_str, "%Y-%m-%d").date()
            if (today - v_dt).days > max_days_old:
                stale_found = True
        except ValueError:
            pass

        if item.review_status != "human_verified":
            stale_found = True

    warning = None
    if stale_found:
        warning = f"This information was last verified on {latest_date_str} and may require re-verification on the official portal before applying."

    return not stale_found, latest_date_str, warning


def is_stale(item: EvidenceItem, today: date | None = None) -> bool:
    today_dt = today or date.today()
    v_date_str = item.last_verified_date
    if not v_date_str:
        return True
    try:
        v_dt = datetime.strptime(v_date_str, "%Y-%m-%d").date()
        return (today_dt - v_dt).days > 180
    except ValueError:
        return True


def check_freshness(evidence_items: List[EvidenceItem], today: date | None = None) -> tuple[bool, Optional[str]]:
    is_fresh, latest_date, warning = validate_freshness(evidence_items)
    if not is_fresh:
        return True, STALE_WARNING
    return False, None


def most_recent_verification(evidence_items: List[EvidenceItem]) -> Optional[str]:
    _, latest_date, _ = validate_freshness(evidence_items)
    return latest_date
