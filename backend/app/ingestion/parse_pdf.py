"""
Module 3 — Extraction & Cleaning (PDF)

Parses PDF guidelines and scheme circulars into structured sections using pdfplumber.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from pathlib import Path
import pdfplumber


@dataclass
class PDFPageText:
    page_number: int
    text: str


@dataclass
class ExtractedPDF:
    num_pages: int
    pages: list[PDFPageText] = field(default_factory=list)
    full_text: str = ""


def parse_scheme_pdf(pdf_path: str | Path) -> ExtractedPDF:
    pdf_path = Path(pdf_path)
    pages: list[PDFPageText] = []
    full_lines: list[str] = []

    with pdfplumber.open(pdf_path) as pdf:
        num_pages = len(pdf.pages)
        for idx, page in enumerate(pdf.pages, start=1):
            text = page.extract_text() or ""
            clean_text = text.strip()
            pages.append(PDFPageText(page_number=idx, text=clean_text))
            if clean_text:
                full_lines.append(f"--- Page {idx} ---\n{clean_text}")

    return ExtractedPDF(num_pages=num_pages, pages=pages, full_text="\n\n".join(full_lines))
