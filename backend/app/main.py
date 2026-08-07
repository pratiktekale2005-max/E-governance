from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.utils.config import settings
from app.utils.logger import setup_logging, logger, RequestLoggingMiddleware
from app.utils.limiter import limiter, _rate_limit_exceeded_handler as custom_rate_limit_handler
from app.api.routes import api_router
from app.api.routes.health import router as health_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks
    setup_logging()
    logger.info(f"Starting {settings.APP_NAME} Backend on {settings.HOST}:{settings.PORT}")
    logger.info("Database URL configured: " + settings.DATABASE_URL.split("@")[-1])
    yield
    # Shutdown tasks
    logger.info(f"Shutting down {settings.APP_NAME} Backend")


# Instantiate FastAPI Application
app = FastAPI(
    title=settings.APP_NAME,
    description="Production-ready FastAPI backend for AI Citizen OS providing authentication, AI/RAG schemes matching, and government services.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Attach SlowAPI limiter state & error handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, custom_rate_limit_handler)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict origins in production environment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach HTTP Request Logging Middleware
app.add_middleware(RequestLoggingMiddleware)

# Include Router Endpoints
app.include_router(health_router)
app.include_router(api_router, prefix="/api/v1")
