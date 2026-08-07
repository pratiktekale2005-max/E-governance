"""
RAG Pipeline Orchestrator Component

Main end-to-end RAG orchestrator integrating all 10 intelligence modules.
"""
from __future__ import annotations
from typing import Dict, Any, Optional, List
from app.rag.language_detector import detect_language
from app.rag.intent_detector import detect_intent
from app.rag.entity_extractor import extract_entities
from app.rag.query_rewriter import rewrite_query
from app.vector_db.chroma import ChromaVectorStore
from app.vector_db.reranker import HybridReranker
from app.rag.context_builder import build_context
from app.rag.prompt_builder import PromptBuilder
from app.rag.llm_service import LLMService
from app.rag.confidence_engine import evaluate_confidence
from app.rag.citation_service import generate_citations
from app.rag.response_builder import build_response_envelope
from app.utils.logger import logger


class RAGPipeline:

    def __init__(self):
        self.vector_store = ChromaVectorStore()
        self.reranker = HybridReranker()
        self.prompt_builder = PromptBuilder()
        self.llm_service = LLMService()

    def process_query(
        self,
        query: str,
        profile_dict: Optional[dict] = None,
        history: Optional[List[dict]] = None,
    ) -> Dict[str, Any]:
        """
        Executes end-to-end RAG pipeline for a citizen query.
        """
        logger.info(f"RAGPipeline processing query: '{query}'")

        # Step 1: Language Detection
        lang_data = detect_language(query)

        # Step 2: Intent Detection
        intent_data = detect_intent(query)

        # Step 3: Entity Extraction
        entities = extract_entities(query, profile_dict)

        # Step 4: Query Rewriting & Expansion
        rewritten_query = rewrite_query(query, entities)

        # Step 5: Candidate Vector Retrieval (Top 50 candidates from ChromaDB)
        candidates = self.vector_store.fetch_candidates(
            query=rewritten_query,
            candidate_k=50,
            state=entities.get("state"),
            category=entities.get("category"),
        )

        # Step 6: Hybrid Reranking (Top 50 -> Top 5 high-relevance evidence chunks)
        top_chunks = self.reranker.rerank(
            query=rewritten_query,
            candidates=candidates,
            top_k=5,
            state=entities.get("state"),
        )

        # Step 7: Context Building & Token Control
        context_data = build_context(top_chunks, max_tokens=2500)

        # Step 8: Multi-Stage Prompt Building
        full_prompt = self.prompt_builder.build_prompt(
            query=query,
            rewritten_query=rewritten_query,
            entities=entities,
            intent_data=intent_data,
            language_data=lang_data,
            context_text=context_data["context_text"],
            history=history,
        )

        # Step 9: LLM Response Generation (Google Gemini)
        ai_response = self.llm_service.generate_response(full_prompt)

        # Step 10: Multi-Factor Confidence Evaluation & Citation Generation
        confidence_data = evaluate_confidence(top_chunks, user_state=entities.get("state"))
        citations = generate_citations(top_chunks)

        # Step 11: Build Response Envelope
        envelope = build_response_envelope(
            query=query,
            ai_response=ai_response,
            entities=entities,
            intent_data=intent_data,
            language_data=lang_data,
            confidence_data=confidence_data,
            citations=citations,
            context_data=context_data,
        )

        return envelope
