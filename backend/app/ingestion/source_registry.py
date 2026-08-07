"""
Module 1 — Source Registry

Maintains the authoritative registry of official government data sources
(sources.yaml) and enforces domain allowlisting so the pipeline only ingests
from trusted .gov.in / official portals.
"""
from __future__ import annotations
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlparse
import yaml

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
SOURCES_YAML = ROOT_DIR / "sources.yaml"


@dataclass
class Source:
    id: str
    name: str
    jurisdiction: str
    state: str | None
    base_url: str
    allowed_domains: list[str]
    rate_limit_rpm: int
    scrape_method: str
    trust_tier: int
    categories_covered: list[str]
    notes: str = ""


class SourceRegistry:

    def __init__(self, yaml_path: Path = SOURCES_YAML):
        self.yaml_path = yaml_path
        self.sources: dict[str, Source] = {}
        self.reload()

    def reload(self):
        if not self.yaml_path.exists():
            raise FileNotFoundError(f"Source registry missing: {self.yaml_path}")
        with open(self.yaml_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}

        self.sources.clear()
        for item in data.get("sources", []):
            base_url = item.get("base_url") or item.get("url") or ""
            parsed = urlparse(base_url)
            domain = parsed.netloc.split(":")[0].lower() if parsed.netloc else ""
            
            allowed = item.get("allowed_domains", [])
            if not allowed and domain:
                allowed = [domain]

            src = Source(
                id=item["id"],
                name=item["name"],
                jurisdiction=item["jurisdiction"],
                state=item.get("state"),
                base_url=base_url,
                allowed_domains=allowed,
                rate_limit_rpm=item.get("rate_limit_rpm", 30),
                scrape_method=item.get("scrape_method", "html"),
                trust_tier=1 if item.get("trust_tier") == "primary" else item.get("trust_tier", 2),
                categories_covered=item.get("categories_covered", []),
                notes=item.get("notes", ""),
            )
            self.sources[src.id] = src

    def get(self, source_id: str) -> Source | None:
        return self.sources.get(source_id)

    def is_url_allowed(self, url: str) -> bool:
        """Returns True if url's domain belongs to any registered source's allowed_domains list or ends in .gov.in."""
        parsed = urlparse(url)
        netloc = (parsed.netloc or "").split(":")[0].lower()
        if not netloc:
            return False
        
        # Allow any official government domain ending with .gov.in or .nic.in
        if netloc.endswith(".gov.in") or netloc.endswith(".nic.in") or netloc.endswith(".mahaonline.gov.in"):
            return True

        for src in self.sources.values():
            for domain in src.allowed_domains:
                domain_clean = domain.lower()
                if netloc == domain_clean or netloc.endswith("." + domain_clean):
                    return True
        return False

    def list_sources(self) -> list[Source]:
        return list(self.sources.values())
