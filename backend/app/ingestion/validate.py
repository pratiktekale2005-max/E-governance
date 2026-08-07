"""
Module 5 — Validation & Quality Engine

Validates scheme JSON records for schema completeness, URL accessibility/allowlisting,
and duplicate scheme detection, emitting a quality_report.json report.
"""
from __future__ import annotations
import json
from pathlib import Path
from app.ingestion.normalize import load_all_normalized
from app.ingestion.source_registry import SourceRegistry, ROOT_DIR

MANIFESTS_DIR = ROOT_DIR / "data" / "manifests"


def validate_all_schemes() -> dict:
    registry = SourceRegistry()
    records = load_all_normalized()
    total = len(records)
    valid_count = 0
    issues: list[dict] = []

    seen_ids = set()
    seen_names = set()

    for r in records:
        r_issues = []
        if r.scheme_id in seen_ids:
            r_issues.append("Duplicate scheme_id")
        seen_ids.add(r.scheme_id)

        if r.scheme_name in seen_names:
            r_issues.append("Duplicate scheme_name")
        seen_names.add(r.scheme_name)

        if not r.summary or len(r.summary) < 20:
            r_issues.append("Summary too short or missing")

        if not r.official_urls:
            r_issues.append("Missing official_urls")
        else:
            for url in r.official_urls:
                if not registry.is_url_allowed(url):
                    r_issues.append(f"Official URL domain not in allowlist: {url}")

        if not r_issues:
            valid_count += 1
        else:
            issues.append({"scheme_id": r.scheme_id, "scheme_name": r.scheme_name, "issues": r_issues})

    report = {
        "total_schemes": total,
        "valid_schemes": valid_count,
        "invalid_schemes": len(issues),
        "quality_score": round((valid_count / total * 100) if total else 0.0, 2),
        "issues": issues,
    }

    MANIFESTS_DIR.mkdir(parents=True, exist_ok=True)
    report_file = MANIFESTS_DIR / "quality_report.json"
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    return report
