from fastapi import APIRouter
from app.api.routes.health import router as health_router
from app.api.routes.auth import router as auth_router
from app.api.routes.users import router as users_router
from app.api.routes.schemes import router as schemes_router
from app.api.routes.rag import router as rag_router
from app.api.routes.chat import router as chat_router
from app.api.routes.sources import router as sources_router
from app.api.routes.pipeline import router as pipeline_router

api_router = APIRouter()

api_router.include_router(health_router, tags=["Health Checks"])
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(schemes_router)
api_router.include_router(chat_router)
api_router.include_router(rag_router)
api_router.include_router(sources_router)
api_router.include_router(pipeline_router)
