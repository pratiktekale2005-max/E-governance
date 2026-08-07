import sys
import time
from pathlib import Path
from loguru import logger
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

# Ensure logs directory exists
LOGS_DIR = Path("logs")
LOGS_DIR.mkdir(parents=True, exist_ok=True)
LOG_FILE_PATH = LOGS_DIR / "app.log"

def setup_logging():
    """
    Configures Loguru loggers for console output and rotating file log.
    """
    logger.remove()  # Remove default logger handlers

    # Console logging format
    log_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
        "<level>{message}</level>"
    )

    # Add stdout handler
    logger.add(
        sys.stdout,
        format=log_format,
        level="INFO",
        colorize=True,
    )

    # Add rotating file handler
    logger.add(
        LOG_FILE_PATH,
        format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {name}:{function}:{line} - {message}",
        level="DEBUG",
        rotation="10 MB",
        retention="10 days",
        compression="zip",
        enqueue=True,
    )

    logger.info("Structured Loguru logging initialized successfully.")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to record HTTP requests, response statuses, and execution times.
    """
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        client_ip = request.client.host if request.client else "unknown"

        logger.info(f"Incoming Request: {request.method} {request.url.path} from {client_ip}")

        try:
            response = await call_next(request)
            process_time = (time.time() - start_time) * 1000
            logger.info(
                f"Completed Response: {request.method} {request.url.path} - "
                f"Status {response.status_code} in {process_time:.2f}ms"
            )
            return response
        except Exception as exc:
            process_time = (time.time() - start_time) * 1000
            logger.error(
                f"Request Failed: {request.method} {request.url.path} - "
                f"Error: {str(exc)} in {process_time:.2f}ms"
            )
            raise exc
