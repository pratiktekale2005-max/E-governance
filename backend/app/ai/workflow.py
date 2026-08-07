"""
Workflow Manager
=================
Declares the ordered list of steps in the AI workflow. Keeping this as data
(rather than hard-coding the sequence inside the orchestrator) makes the
pipeline easy to inspect, log, and modify (e.g. to add a step or run steps
conditionally) without touching orchestration logic itself.
"""

from __future__ import annotations

WORKFLOW_STEPS: list[str] = [
    "language_detection",
    "intent_detection",
    "entity_extraction",
    "query_rewriting",
    "citizen_context_building",
    "retrieval",
    "eligibility_evaluation",
    "prompt_building",
    "llm_generation",
    "citation_generation",
    "confidence_calculation",
    "response_formatting",
]
