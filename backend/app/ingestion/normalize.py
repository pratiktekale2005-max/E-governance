"""
Module 4 — Normalization Engine

Normalizes raw scheme dictionaries or JSON files into canonical SchemeRecord objects.
Reads and writes to data/normalized/<scheme_id>.json.
"""
from __future__ import annotations
import json
from pathlib import Path
from typing import List
from app.schemas.scheme_schema import SchemeRecord
from app.ingestion.source_registry import ROOT_DIR

DATA_NORMALIZED = ROOT_DIR / "data" / "normalized"


def load_normalized_scheme(path_or_id: str | Path) -> SchemeRecord:
    path = Path(path_or_id)
    if not path.is_file():
        path = DATA_NORMALIZED / f"{path_or_id}.json"
    if not path.exists():
        raise FileNotFoundError(f"Normalized scheme JSON not found: {path}")

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return SchemeRecord.model_validate(data)


def save_normalized_scheme(scheme: SchemeRecord, out_dir: Path = DATA_NORMALIZED) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    target_path = out_dir / f"{scheme.scheme_id}.json"

    # Use model_dump for clean json serialization
    json_data = scheme.model_dump(mode="json")
    with open(target_path, "w", encoding="utf-8") as f:
        json.dump(json_data, f, indent=2, ensure_ascii=False)
    return target_path


def load_all_normalized(normalized_dir: Path = DATA_NORMALIZED) -> List[SchemeRecord]:
    if not normalized_dir.exists():
        return []
    records = []
    for path in sorted(normalized_dir.glob("*.json")):
        try:
            records.append(load_normalized_scheme(path))
        except Exception as e:
            print(f"Warning: Failed to load normalized scheme {path.name}: {e}")
    return records
