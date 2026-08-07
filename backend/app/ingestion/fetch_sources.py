"""
Module 2 — Scheme Collection & Source Fetching

Fetches raw HTML/PDF/JSON documents from official portals in the registry,
enforcing domain allowlisting, rate limits, user-agent headers, and raw
snapshot caching into data/raw/<source_id>/.
"""
from __future__ import annotations
import hashlib
import time
from pathlib import Path
from urllib.parse import urlparse
import requests
from app.ingestion.source_registry import SourceRegistry, Source, ROOT_DIR

DATA_RAW = ROOT_DIR / "data" / "raw"

DEFAULT_HEADERS = {
    "User-Agent": "AICitizenOS-DataPipeline/1.0 (+https://citizenos.gov.in; scheme-ingestion)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf;q=0.8,*/*;q=0.7",
}


def _url_to_filename(url: str) -> str:
    parsed = urlparse(url)
    stem = Path(parsed.path).name or "index"
    h = hashlib.sha256(url.encode("utf-8")).hexdigest()[:8]
    return f"{stem}_{h}"


class SourceFetcher:

    def __init__(self, registry: SourceRegistry | None = None):
        self.registry = registry or SourceRegistry()
        self._last_fetch_time: dict[str, float] = {}

    def fetch_url(self, url: str, source_id: str, force: bool = False) -> tuple[Path, dict]:
        src = self.registry.get(source_id)
        if not src:
            raise ValueError(f"Unknown source_id: {source_id}")

        if not self.registry.is_url_allowed(url):
            raise PermissionError(f"URL domain not allowlisted for source {source_id}: {url}")

        out_dir = DATA_RAW / source_id
        out_dir.mkdir(parents=True, exist_ok=True)
        fname = _url_to_filename(url)

        # Rate limiting per source
        min_interval = 60.0 / float(src.rate_limit_rpm or 30)
        elapsed = time.time() - self._last_fetch_time.get(source_id, 0.0)
        if elapsed < min_interval:
            time.sleep(min_interval - elapsed)

        resp = requests.get(url, headers=DEFAULT_HEADERS, timeout=20)
        self._last_fetch_time[source_id] = time.time()
        resp.raise_for_status()

        content_type = resp.headers.get("content-type", "").lower()
        ext = ".html"
        if "pdf" in content_type or url.lower().endswith(".pdf"):
            ext = ".pdf"
        elif "json" in content_type or url.lower().endswith(".json"):
            ext = ".json"

        target_file = out_dir / f"{fname}{ext}"
        if ext in (".html", ".json"):
            target_file.write_text(resp.text, encoding="utf-8")
        else:
            target_file.write_bytes(resp.content)

        metadata = {
            "source_id": source_id,
            "url": url,
            "saved_file": str(target_file.relative_to(ROOT_DIR)),
            "status_code": resp.status_code,
            "content_type": content_type,
            "bytes": len(resp.content),
            "fetched_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        return target_file, metadata
