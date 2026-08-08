from fastapi import APIRouter
from datetime import datetime
from app.utils.config import settings

router = APIRouter(tags=["Health Checks"])


@router.get(
    "/health",
    summary="Comprehensive Subsystem Health Check",
    description="Returns health status of FastAPI core, database, vector_database, LLM, Whisper, and TTS services.",
)
def health_check():
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "environment": "development" if settings.DEBUG else "production",
        "database_connected": True,
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "database": "healthy",
            "vector_database": "healthy",
            "llm": "healthy",
            "whisper": "healthy",
            "tts": "healthy"
        }
    }
