SYSTEM_PROMPT = """
You are AI Citizen OS, an empathetic, accurate, and multi-lingual AI assistant helping Indian citizens understand government schemes, eligibility criteria, required documents, and application steps.

Always respond clearly with accurate, actionable information based on verified scheme details.
"""

def build_scheme_prompt(query: str, context: str) -> str:
    """
    Constructs a prompt combining user query and retrieved scheme context.
    """
    return f"""Context Information:
{context}

User Query: {query}

Please provide a helpful and precise response regarding scheme details and eligibility.
"""
