from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import jwt, JWTError
from app.utils.config import settings
from app.utils.logger import logger


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates a short-lived JWT access token.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates a long-lived JWT refresh token (defaults to 7 days).
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=7)

    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes and validates a JWT token. Returns payload dict if valid, else None.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError as e:
        logger.warning(f"JWT Verification failed: {e}")
        return None


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Alias wrapper for token verification."""
    return decode_token(token)
