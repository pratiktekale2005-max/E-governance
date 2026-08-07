"""
Context Builder Component

Merges chunks from multiple schemes, deduplicates identical content, preserves
logical section ordering (Overview -> Benefits -> Eligibility -> Documents -> Application),
caps token length, and compresses context for optimal LLM generation.
"""
from __future__ import annotations
from typing import List, Dict, Any

SECTION_ORDER = ["overview", "benefits", "eligibility", "documents", "application"]


def build_context(reranked_chunks: List[dict], max_tokens: int = 2500) -> Dict[str, Any]:
    """
    Merges, deduplicates, and structures reranked chunks into clean evidence text.
    """
    if not reranked_chunks:
        return {"context_text": "No matching government schemes found.", "scheme_count": 0, "compressed_chunks": []}

    # Group by scheme_id
    by_scheme: Dict[str, dict] = {}
    seen_texts = set()

    for chunk in reranked_chunks:
        sid = chunk.get("scheme_id") or chunk.get("scheme_name")
        text = (chunk.get("text") or "").strip()
        section = (chunk.get("section") or "overview").lower()

        # Deduplicate identical text snippets
        if text in seen_texts:
            continue
        seen_texts.add(text)

        if sid not in by_scheme:
            by_scheme[sid] = {
                "scheme_id": sid,
                "scheme_name": chunk.get("scheme_name", "Government Scheme"),
                "category": chunk.get("category", "other"),
                "jurisdiction": chunk.get("jurisdiction", "central"),
                "state": chunk.get("state"),
                "official_url": chunk.get("official_url", ""),
                "last_verified_date": chunk.get("last_verified_date", ""),
                "sections": {},
            }

        if section not in by_scheme[sid]["sections"]:
            by_scheme[sid]["sections"][section] = text

    # Assemble ordered context blocks
    context_blocks = []
    compressed_chunks = []
    estimated_chars = 0
    char_limit = max_tokens * 4  # ~4 chars per token approximation

    for sid, scheme in by_scheme.items():
        block_lines = [
            f"=== SCHEME: {scheme['scheme_name']} ({scheme['jurisdiction'].title()} / {scheme['state'] or 'All India'}) ===",
            f"Official Portal: {scheme['official_url']}",
            f"Last Verified: {scheme['last_verified_date']}",
        ]

        # Order sections logically
        sections_map = scheme["sections"]
        for sec_name in SECTION_ORDER:
            if sec_name in sections_map:
                block_lines.append(f"[{sec_name.upper()}]: {sections_map[sec_name]}")

        # Any remaining sections
        for sec_name, sec_text in sections_map.items():
            if sec_name not in SECTION_ORDER:
                block_lines.append(f"[{sec_name.upper()}]: {sec_text}")

        block_text = "\n".join(block_lines)
        if estimated_chars + len(block_text) > char_limit and context_blocks:
            break

        context_blocks.append(block_text)
        estimated_chars += len(block_text) + 2
        compressed_chunks.append(scheme)

    final_context_text = "\n\n".join(context_blocks)
    return {
        "context_text": final_context_text,
        "scheme_count": len(compressed_chunks),
        "compressed_chunks": compressed_chunks,
    }
