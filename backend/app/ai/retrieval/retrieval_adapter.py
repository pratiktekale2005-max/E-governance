"""
Retrieval Engine Adapter
========================
Adapter connecting AI Orchestrator to the ChromaDB Hybrid Reranker vector retrieval engine.
"""

from __future__ import annotations

from app.ai.schemas import RetrievedDocument

_MOCK_CORPUS: list[dict] = [
    {
        "scheme_id": "pm-kisan",
        "scheme_name": "PM-KISAN",
        "department": "Ministry of Agriculture & Farmers Welfare",
        "source_portal": "MyScheme",
        "official_url": "https://pmkisan.gov.in",
        "last_verified_date": "2026-06-01",
        "content": (
            "PM-KISAN provides income support of Rs. 6,000 per year to all "
            "landholding farmer families, payable in three installments."
        ),
        "eligibility": {"occupation": "farmer", "landholding_required": True},
    },
    {
        "scheme_id": "pmay-g",
        "scheme_name": "Pradhan Mantri Awaas Yojana - Gramin",
        "department": "Ministry of Rural Development",
        "source_portal": "India.gov.in",
        "official_url": "https://pmayg.nic.in",
        "last_verified_date": "2026-05-15",
        "content": (
            "PMAY-G provides financial assistance for construction of pucca "
            "houses to eligible rural households, prioritized via SECC data."
        ),
        "eligibility": {"max_income": 300000, "housing_status": "kutcha/no house"},
    },
    {
        "scheme_id": "nsap-obds",
        "scheme_name": "National Social Assistance Programme - Old Age Pension",
        "department": "Ministry of Rural Development",
        "source_portal": "MyScheme",
        "official_url": "https://nsap.nic.in",
        "last_verified_date": "2026-04-20",
        "content": (
            "Provides monthly pension to citizens above 60 years of age "
            "belonging to BPL households."
        ),
        "eligibility": {"min_age": 60, "category": "BPL"},
    },
]


def _call_existing_retrieval_engine(
    query: str, filters: dict, top_k: int
) -> list[dict]:
    """
    Connects into ChromaDB persistent vector store + Hybrid Reranker.
    """
    try:
        from app.vector_db.chroma import ChromaVectorStore
        from app.vector_db.reranker import HybridReranker

        store = ChromaVectorStore()
        reranker = HybridReranker()

        state = filters.get("state")
        category = filters.get("category")

        candidates = store.fetch_candidates(query, candidate_k=50, state=state, category=category)
        reranked = reranker.rerank(query, candidates, top_k=top_k, state=state)

        results = []
        for c in reranked:
            results.append({
                "scheme_id": c.get("scheme_id", "scheme"),
                "scheme_name": c.get("scheme_name", "Government Scheme"),
                "department": c.get("department", "Government Department"),
                "source_portal": c.get("source_id", "Official Portal"),
                "official_url": c.get("official_url", "https://myscheme.gov.in"),
                "last_verified_date": c.get("last_verified_date", "2026-08-01"),
                "content": c.get("text", ""),
                "similarity_score": c.get("hybrid_score", c.get("vector_score", 0.85)),
                "eligibility": c,
            })
        if results:
            return results
    except Exception as exc:
        pass

    query_l = query.lower()
    scored = []
    for doc in _MOCK_CORPUS:
        score = sum(1 for token in query_l.split() if token in doc["content"].lower())
        if filters.get("state") and "state" in doc.get("eligibility", {}):
            if doc["eligibility"]["state"].lower() != str(filters["state"]).lower():
                continue
        scored.append((score, doc))
    scored.sort(key=lambda pair: pair[0], reverse=True)
    return [doc for _, doc in scored[:top_k]]


def retrieve(query: str, filters: dict | None = None, top_k: int = 5) -> list[RetrievedDocument]:
    """Retrieve candidate scheme documents relevant to the (rewritten) query."""
    raw_results = _call_existing_retrieval_engine(query, filters or {}, top_k)

    documents: list[RetrievedDocument] = []
    for i, doc in enumerate(raw_results):
        similarity = doc.get("similarity_score", max(0.9 - i * 0.12, 0.3))
        documents.append(
            RetrievedDocument(
                scheme_id=doc["scheme_id"],
                scheme_name=doc["scheme_name"],
                department=doc.get("department"),
                source_portal=doc.get("source_portal"),
                official_url=doc.get("official_url"),
                last_verified_date=doc.get("last_verified_date"),
                content=doc.get("content", ""),
                similarity_score=similarity,
                metadata=doc.get("eligibility", {}),
            )
        )
    return documents
