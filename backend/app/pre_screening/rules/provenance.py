"""
Module 3 — Rule Provenance & Verification Validator
Ensures rules without source, verification, or human review status are safely rejected or marked stale.
"""
from __future__ import annotations

from datetime import datetime, date
from app.models.scheme_rule import RuleProvenance, ReviewStatusEnum


def is_provenance_valid(provenance: RuleProvenance, max_stale_days: int = 180) -> tuple[bool, str]:
    """
    Validates provenance status and staleness.
    Returns (is_valid, reason).
    """
    if provenance.review_status != ReviewStatusEnum.HUMAN_VERIFIED:
        return False, f"Rule review status is '{provenance.review_status.value}', requires 'human_verified'."

    if not provenance.source_url:
        return False, "Missing official source URL."

    if provenance.last_verified_at:
        try:
            verified_dt = datetime.strptime(provenance.last_verified_at, "%Y-%m-%d").date()
            days_diff = (date.today() - verified_dt).days
            if days_diff > max_stale_days:
                return False, f"Rule verification date {provenance.last_verified_at} is stale ({days_diff} days old)."
        except ValueError:
            pass

    return True, "Rule provenance is valid and verified."
