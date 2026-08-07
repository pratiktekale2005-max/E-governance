from datetime import datetime
from fastapi import APIRouter, Request
from app.models.response import HealthResponse
from app.database.db import check_db_connection
from app.utils.config import settings
from app.utils.limiter import limiter

router = APIRouter()


@router.get(
    "/",
    summary="Root Endpoint",
    description="Returns backend identification message.",
)
@limiter.limit("60/minute")
def root(request: Request):
    return {"message": "AI Citizen OS Backend Running"}


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Service Health Status",
    description="Detailed operational health status including DB connection and environment information.",
)
@limiter.limit("60/minute")
def health(request: Request):
    db_ok = check_db_connection()
    return HealthResponse(
        status="healthy" if db_ok else "degraded",
        app_name=settings.APP_NAME,
        environment="development" if settings.DEBUG else "production",
        database_connected=db_ok,
        timestamp=datetime.utcnow().isoformat(),
    )
