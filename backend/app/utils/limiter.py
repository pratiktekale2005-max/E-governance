from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from fastapi.responses import JSONResponse
from app.utils.logger import logger

# Initialize SlowAPI Limiter using remote IP address
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])


def _rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """
    Custom exception handler for rate limit exceeded errors.
    """
    client_ip = request.client.host if request.client else "unknown"
    logger.warning(f"Rate limit exceeded for IP {client_ip} on path {request.url.path}: {exc.detail}")

    return JSONResponse(
        status_code=429,
        content={
            "error": "Rate limit exceeded",
            "message": f"Too many requests. Limit: {exc.detail}",
            "path": request.url.path,
        },
    )
