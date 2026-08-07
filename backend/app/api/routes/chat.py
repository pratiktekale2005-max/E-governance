from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field
from app.rag.rag_pipeline import RAGPipeline
from app.utils.limiter import limiter

router = APIRouter(prefix="/chat", tags=["AI Citizen Chat & RAG Pipeline"])
pipeline_instance = RAGPipeline()

# In-memory session history store
SESSION_HISTORY: Dict[str, List[dict]] = {}


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, json_schema_extra={"example": "What financial assistance is available for pregnant women in Maharashtra?"})
    session_id: Optional[str] = Field("default_session", json_schema_extra={"example": "sess_12345"})
    state: Optional[str] = Field(None, json_schema_extra={"example": "Maharashtra"})
    district: Optional[str] = Field(None)
    occupation: Optional[str] = Field(None)
    income: Optional[str] = Field(None)
    age: Optional[int] = Field(None)
    gender: Optional[str] = Field(None)
    category: Optional[str] = Field(None)
    language: Optional[str] = Field("en")


@router.post(
    "",
    summary="Process Citizen Chat Query",
    description="Executes end-to-end RAG pipeline (Language, Intent, Entities, Query Rewriting, ChromaDB Vector & Hybrid Reranking, Gemini LLM completion, Citations, and Multi-Factor Confidence Evaluation).",
)
@limiter.limit("20/minute")
def chat_endpoint(
    request: Request,
    payload: ChatRequest,
):
    session_id = payload.session_id or "default_session"
    history = SESSION_HISTORY.get(session_id, [])

    profile_dict = {
        "state": payload.state,
        "district": payload.district,
        "occupation": payload.occupation,
        "income": payload.income,
        "age": payload.age,
        "gender": payload.gender,
        "category": payload.category,
        "language": payload.language or "en",
    }

    # Process query via RAG pipeline
    result = pipeline_instance.process_query(
        query=payload.message,
        profile_dict=profile_dict,
        history=history,
    )

    # Append to session history
    if session_id not in SESSION_HISTORY:
        SESSION_HISTORY[session_id] = []

    SESSION_HISTORY[session_id].append({"sender": "User", "text": payload.message})
    SESSION_HISTORY[session_id].append({"sender": "AI Assistant", "text": result.get("response", "")})

    return {
        "session_id": session_id,
        **result,
    }


@router.get(
    "/history",
    summary="Get Chat History",
    description="Retrieves session chat history by session_id.",
)
def get_chat_history(session_id: str = "default_session"):
    return {
        "session_id": session_id,
        "messages": SESSION_HISTORY.get(session_id, []),
    }
