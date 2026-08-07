"""
Module 6 — Versioning & Freshness Subsystem

Tracks scheme content hashes, computes version numbers, and flags stale records.
"""
from __future__ import annotations
import hashlib
import json
from datetime import date
from pathlib import Path
from app.ingestion.normalize import load_all_normalized
from app.schemas.scheme_schema import SchemeRecord, Status
from app.ingestion.source_registry import ROOT_DIR

VERSIONS_DIR = ROOT_DIR / "data" / "manifests" / "versions"


def compute_content_hash(scheme: SchemeRecord) -> str:
    payload = f"{scheme.scheme_name}|{scheme.summary}|{scheme.benefits}|{sorted(scheme.eligibility)}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:16]


def update_version_history(scheme: SchemeRecord):
    VERSIONS_DIR.mkdir(parents=True, exist_ok=True)
    manifest_path = VERSIONS_DIR / f"{scheme.scheme_id}.jsonl"

    c_hash = compute_content_hash(scheme)
    row = {
        "version": scheme.version,
        "content_hash": c_hash,
        "last_verified_date": str(scheme.last_verified_date),
        "status": scheme.status.value,
    }

    with open(manifest_path, "a", encoding="utf-8") as f:
        f.write(json.dumps(row) + "\n")


def check_staleness(max_age_days: int = 180):
    records = load_all_normalized()
    today = date.today()
    stale_count = 0

    for r in records:
        delta = (today - r.last_verified_date).days
        if delta > max_age_days:
            r.status = Status.STALE
            stale_count += 1
    return stale_count
