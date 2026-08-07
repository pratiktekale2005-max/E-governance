from typing import Generator, List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.database.crud import get_user_by_id
from app.database.models import User
from app.auth.jwt import decode_token

# HTTP Bearer Scheme
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """
    Decodes Bearer JWT token, validates subject, and retrieves user from database.
    """
    token = credentials.credentials
    payload = decode_token(token)

    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or token expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: str = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload.",
        )

    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with token no longer exists.",
        )

    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Ensures that the current user account is active/verified.
    """
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive or unverified user account.",
        )
    return current_user


def require_roles(allowed_roles: List[str]):
    """
    Role-Based Access Control (RBAC) dependency factory.
    Enforces that the current authenticated user has one of the allowed roles.
    """
    def role_checker(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: User role '{current_user.role}' lacks required permission.",
            )
        return current_user

    return role_checker
