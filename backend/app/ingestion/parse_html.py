"""
Module 3 — Extraction & Cleaning (HTML)

Strips navigation, footers, scripts, styles, and extracts structured headings
+ body text from raw HTML scheme pages.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from bs4 import BeautifulSoup, Comment


@dataclass
class ExtractedSection:
    heading: str
    content: str


@dataclass
class ExtractedDocument:
    title: str
    sections: list[ExtractedSection] = field(default_factory=list)
    raw_text: str = ""
    links: list[str] = field(default_factory=list)


NOISE_TAGS = ["nav", "header", "footer", "script", "style", "iframe", "noscript", "aside"]


def parse_scheme_html(html: str, base_url: str = "") -> ExtractedDocument:
    soup = BeautifulSoup(html, "html.parser")

    # Strip comments and noise tags
    for element in soup.find_all(string=lambda text: isinstance(text, Comment)):
        element.extract()
    for tag in NOISE_TAGS:
        for match in soup.find_all(tag):
            match.decompose()

    # Find page title
    title = ""
    title_tag = soup.find("h1") or soup.find("title")
    if title_tag:
        title = title_tag.get_text(strip=True)

    # Extract headings and sections
    sections: list[ExtractedSection] = []
    current_heading = "Overview"
    current_lines: list[str] = []

    body = soup.body or soup
    for elem in body.find_all(["h1", "h2", "h3", "h4", "p", "ul", "ol", "div", "table"]):
        if elem.name in ("h1", "h2", "h3", "h4"):
            if current_lines:
                sections.append(ExtractedSection(heading=current_heading, content="\n".join(current_lines).strip()))
                current_lines = []
            txt = elem.get_text(strip=True)
            if txt:
                current_heading = txt
        else:
            txt = elem.get_text(separator=" ", strip=True)
            if txt and len(txt) > 10 and txt not in current_lines:
                current_lines.append(txt)

    if current_lines:
        sections.append(ExtractedSection(heading=current_heading, content="\n".join(current_lines).strip()))

    links = []
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        if href.startswith("http://") or href.startswith("https://"):
            links.append(href)

    raw_text = "\n\n".join(f"=== {s.heading} ===\n{s.content}" for s in sections)
    return ExtractedDocument(title=title, sections=sections, raw_text=raw_text, links=links)
