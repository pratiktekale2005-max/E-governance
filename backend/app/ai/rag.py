from typing import Dict, Any, Optional
from app.services.retrieval_service import RetrievalService, CitizenProfile
from app.utils.logger import logger


class RAGPipeline:
    """
    Retrieval-Augmented Generation (RAG) engine connecting FAISS VectorStore with LLM synthesis.
    """

    def __init__(self):
        self.retrieval_service = RetrievalService()

    def query(
        self,
        user_query: str,
        state: Optional[str] = None,
        category: Optional[str] = None,
        language: str = "en",
    ) -> Dict[str, Any]:
        """
        Executes hybrid semantic search and context synthesis for a citizen query.
        """
        profile = CitizenProfile(state=state, language=language)
        evidence = self.retrieval_service.retrieve(
            question=user_query,
            profile=profile,
            category=category,
        )
        return evidence
