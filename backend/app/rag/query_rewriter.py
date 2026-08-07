"""
Query Rewriter Component

Expands ambiguous, short, or conversational user queries into rich search vectors.
e.g. "Help me with money" -> "Government financial assistance schemes for low income households"
"""
from __future__ import annotations
from typing import Dict, Any

REWRITE_RULES = {
    "help me": "government scheme financial assistance programs",
    "money": "financial aid cash subsidy direct benefit transfer",
    "farmer accident": "farmer accident insurance financial compensation schemes",
    "pregnant": "pregnant mother healthcare maternal cash assistance schemes",
    "scholarship": "student post-matric higher education scholarship schemes",
    "dialysis": "free kidney dialysis medical health coverage schemes",
    "house": "housing construction credit linked subsidy housing scheme",
}


def rewrite_query(query: str, entities: Dict[str, Any]) -> str:
    """
    Rewrites and expands query incorporating extracted state and occupation context.
    """
    q_lower = query.strip().lower()

    expanded_terms = []
    for trigger, expansion in REWRITE_RULES.items():
        if trigger in q_lower:
            expanded_terms.append(expansion)

    state = entities.get("state")
    state_str = f" in {state}" if state and state != "Central" else ""

    if expanded_terms:
        rewritten = f"{query} ({' '.join(expanded_terms)}{state_str})"
    else:
        rewritten = f"{query}{state_str}"

    return rewritten.strip()
