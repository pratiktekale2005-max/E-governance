"""
response_formatter.py
Strips markdown symbols for clean display and TTS output.
"""

from __future__ import annotations

import re

_MARKDOWN_PATTERNS = [
    (re.compile(r"\*\*(.*?)\*\*"), r"\1"),   # **bold**
    (re.compile(r"\*(.*?)\*"), r"\1"),       # *italic*
    (re.compile(r"`(.*?)`"), r"\1"),         # `code`
    (re.compile(r"^[-*•]\s+", re.MULTILINE), ""),  # bullet markers
    (re.compile(r"#+\s*"), ""),              # headings
]


def format_for_display(raw_text: str) -> str:
    """Trims whitespace and collapses excessive blank lines."""
    text = raw_text.strip()
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text


def format_for_speech(raw_text: str) -> str:
    """Strips markdown and formatting characters for TTS engine."""
    text = raw_text
    for pattern, repl in _MARKDOWN_PATTERNS:
        text = pattern.sub(repl, text)

    text = re.sub(r"\s+", " ", text).strip()
    return text
