from typing import Optional, Dict, Any, List
from app.ai.orchestrator import AIOrchestrator
from app.ai.schemas import CitizenProfile, ConversationTurn
from app.utils.logger import logger


class ChatService:
    """
    Handles citizen chat sessions, message history, rule matching, RAG retrieval, and Gemini LLM synthesis.
    """

    def __init__(self):
        self.orchestrator = AIOrchestrator()

    def process_chat_message(
        self,
        message: str,
        user_id: Optional[str] = None,
        state: Optional[str] = None,
        category: Optional[str] = None,
        occupation: Optional[str] = None,
        income: Optional[str] = None,
        age: Optional[int] = None,
        gender: Optional[str] = None,
        language: str = "en",
        history: Optional[List[dict]] = None,
    ) -> Dict[str, Any]:
        logger.info(f"Processing chat message: '{message[:50]}...' for user {user_id or 'anonymous'}")

        income_val: Optional[float] = None
        if income is not None:
            try:
                income_val = float(income)
            except (ValueError, TypeError):
                income_val = None

        # Build CitizenProfile object
        profile = CitizenProfile(
            state=state,
            category=category,
            occupation=occupation,
            income=income_val,
            age=age,
            gender=gender,
            language=language,
        )

        conv_history = []
        if history:
            for turn in history:
                conv_history.append(ConversationTurn(role=turn.get("sender", "user"), content=turn.get("text", "")))

        # Execute AI Orchestrator workflow
        result = self.orchestrator.handle_query(
            raw_query=message,
            profile=profile,
            conversation_history=conv_history,
        )

        response_text = result.get("answer", "")
        matching_schemes = result.get("matching_schemes", [])
        citations = result.get("citations", [])
        confidence = result.get("confidence", {})

        return {
            "user_id": user_id,
            "query": message,
            "response": response_text,
            "confidence": confidence,
            "citations": citations,
            "matching_schemes": matching_schemes,
            "eligibility_summary": result.get("eligibility_summary", []),
            "required_documents": result.get("required_documents", []),
            "application_steps": result.get("application_steps", []),
            "trace": result.get("trace", []),
            "evidence": {
                "matched_schemes": matching_schemes,
                "scheme_count": len(matching_schemes),
            },
            "disclaimer": (
                "This guidance is generated from official government scheme guidelines for informational purposes. "
                "Please verify final eligibility and details on the official portal(s) linked above before submitting applications."
            ),
        }


chat_service_instance = ChatService()
