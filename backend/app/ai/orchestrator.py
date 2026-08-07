"""
AI Orchestrator
================
The central pipeline controller. Coordinates the full AI workflow:

    Citizen Query
       -> Query Understanding (language, intent, entities, rewrite)
       -> Citizen Context Builder
       -> Retrieval Engine (existing hybrid search)
       -> Eligibility Engine
       -> Prompt Builder
       -> LLM
       -> Citation Generator
       -> Confidence Engine
       -> Response Formatter
    -> Citizen Response

Responsibilities: manage request lifecycle, execute steps in order, handle
errors/fallbacks per step, pass data between modules, and log execution via
a WorkflowTrace for observability/debugging.
"""

from __future__ import annotations

import logging
import time

from app.ai.context.profile_builder import build_context
from app.ai.data.scheme_requirements import get_requirements
from app.ai.eligibility import matcher
from app.ai.llm.base import LLMError
from app.ai.llm.factory import get_fallback_chain
from app.ai.prompts.prompt_builder import build_prompt
from app.ai.response.citation_service import generate_citations
from app.ai.response.confidence_engine import calculate as calculate_confidence
from app.ai.response.formatter import format_response
from app.ai.retrieval.retrieval_adapter import retrieve
from app.ai.schemas import CitizenProfile, ConversationTurn, LLMResponse, WorkflowTrace
from app.ai.understanding import entity_extractor, intent_detector, language_detector
from app.ai.understanding.query_rewriter import rewrite as rewrite_query
from app.ai.workflow import WORKFLOW_STEPS

logger = logging.getLogger(__name__)


class AIOrchestrator:
    """Runs the full citizen-query -> citizen-response AI workflow."""

    def __init__(self, top_k_retrieval: int = 5, max_tokens: int = 1024):
        self.top_k_retrieval = top_k_retrieval
        self.max_tokens = max_tokens

    def handle_query(
        self,
        raw_query: str,
        profile: CitizenProfile | None = None,
        conversation_history: list[ConversationTurn] | None = None,
        preferences: dict | None = None,
    ) -> dict:
        """
        Run the full pipeline for a single citizen query and return the
        standard structured response dict. Never raises for expected
        pipeline failures -- degrades gracefully and reports the issue in
        the response instead, since this is a citizen-facing endpoint.
        """
        trace = WorkflowTrace()
        profile = profile or CitizenProfile()
        conversation_history = conversation_history or []

        try:
            # -- 1. Query Understanding ------------------------------------
            t0 = time.monotonic()
            language = language_detector.detect(raw_query)
            intent = intent_detector.detect_intent(raw_query)
            entities = entity_extractor.extract(raw_query)
            trace.log("query_understanding", ms=self._ms(t0), language=language.value,
                      intent=intent.value, entities=entities.as_dict())

            # -- 2. Citizen Context Builder ---------------------------------
            t0 = time.monotonic()
            context = build_context(
                profile=profile,
                query_entities=entities,
                detected_language=language,
                conversation_history=conversation_history,
                preferences=preferences,
            )
            rewritten_query = rewrite_query(raw_query, intent, entities, profile.as_dict())
            trace.log("context_building", ms=self._ms(t0), merged_context=context.merged,
                      rewritten_query=rewritten_query)

            # -- 3. Retrieval (existing hybrid search + metadata filter) ----
            t0 = time.monotonic()
            filters = {k: v for k, v in context.merged.items() if k in ("state", "category")}
            try:
                documents = retrieve(rewritten_query, filters=filters, top_k=self.top_k_retrieval)
            except Exception as exc:  # noqa: BLE001
                logger.error("Retrieval failed: %s", exc)
                documents = []
            trace.log("retrieval", ms=self._ms(t0), num_docs=len(documents))

            # -- 4. Eligibility Engine ---------------------------------------
            t0 = time.monotonic()
            eligibility_results = matcher.match_all(documents, context.merged)
            relevant_results = matcher.filter_relevant(eligibility_results)
            trace.log("eligibility", ms=self._ms(t0),
                      results=[r.as_dict() for r in eligibility_results])

            # -- 5. Prompt Builder --------------------------------------------
            t0 = time.monotonic()
            prompt = build_prompt(
                query=raw_query,
                context=context,
                eligibility_results=relevant_results,
                retrieved_docs=documents,
                conversation_history=conversation_history,
            )
            trace.log("prompt_building", ms=self._ms(t0), prompt_length=len(prompt))

            # -- 6. LLM (with provider fallback) -------------------------------
            t0 = time.monotonic()
            llm_response = self._generate_with_fallback(prompt)
            trace.log("llm_generation", ms=self._ms(t0), model=llm_response.model)

            # -- 7. Citation Generator ------------------------------------------
            t0 = time.monotonic()
            citations = generate_citations(documents)
            trace.log("citation_generation", ms=self._ms(t0), num_citations=len(citations))

            # -- 8. Enhanced Confidence Engine -----------------------------------
            t0 = time.monotonic()
            confidence = calculate_confidence(documents, relevant_results, context.merged)
            trace.log("confidence_calculation", ms=self._ms(t0), score=confidence.score)

            # -- 9. Response Formatter ---------------------------------------------
            t0 = time.monotonic()
            required_documents: list[str] = []
            application_steps: list[str] = []
            if relevant_results:
                top_scheme_id = relevant_results[0].scheme_id
                reqs = get_requirements(top_scheme_id)
                required_documents = reqs["required_documents"]
                application_steps = reqs["application_steps"]

            response = format_response(
                llm_response=llm_response,
                eligibility_results=relevant_results,
                citations=citations,
                confidence=confidence,
                documents=documents,
                required_documents=required_documents,
                application_steps=application_steps,
            )
            trace.log("response_formatting", ms=self._ms(t0))

            response["trace"] = trace.steps
            return response

        except Exception as exc:  # noqa: BLE001 - top-level safety net
            logger.exception("AI workflow failed unexpectedly")
            return self._fallback_response(str(exc), trace)

    # -- helpers -----------------------------------------------------------

    def _generate_with_fallback(self, prompt: str) -> LLMResponse:
        last_error: Exception | None = None
        for service in get_fallback_chain():
            try:
                return service.generate(prompt, max_tokens=self.max_tokens)
            except LLMError as exc:
                logger.warning("LLM provider '%s' failed, trying next: %s", service.provider_name, exc)
                last_error = exc
        raise LLMError(f"All LLM providers failed. Last error: {last_error}")

    @staticmethod
    def _ms(start: float) -> int:
        return int((time.monotonic() - start) * 1000)

    @staticmethod
    def _fallback_response(error_message: str, trace: WorkflowTrace) -> dict:
        return {
            "answer": (
                "I'm sorry, I wasn't able to process this request right now. "
                "Please try again in a moment, or visit myscheme.gov.in / your "
                "nearest Common Service Centre for assistance."
            ),
            "matching_schemes": [],
            "eligibility_summary": [],
            "required_documents": [],
            "application_steps": [],
            "citations": [],
            "confidence": {"score": 0.0, "reason": "Workflow error -- no data available."},
            "meta": {"error": error_message},
            "trace": trace.steps,
        }


# WORKFLOW_STEPS is imported for reference/documentation/logging purposes;
# the orchestrator's execution order above must stay in sync with it.
assert len(WORKFLOW_STEPS) == 12
