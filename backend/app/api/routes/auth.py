from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.auth.auth_service import AuthService
from app.models.request import UserRegisterRequest, UserLoginRequest, TokenRefreshRequest, LogoutRequest
from app.models.response import UserResponse, TokenResponse, TokenRefreshResponse
from app.api.dependencies import get_current_active_user
from app.database.models import User
from app.utils.limiter import limiter

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register New User Account",
    description="Registers a new citizen or user account with hashed password and initial role.",
)
@limiter.limit("10/minute")
def register(
    request: Request,
    payload: UserRegisterRequest,
    db: Session = Depends(get_db),
):
    client_ip = request.client.host if request.client else "unknown"
    try:
        user = AuthService.register_user(
            db=db,
            full_name=payload.full_name,
            email=payload.email,
            password=payload.password,
            role=payload.role or "Citizen",
            phone_number=payload.phone_number,
            preferred_language=payload.preferred_language or "en",
            state=payload.state,
            district=payload.district,
            ip_address=client_ip,
        )
        return user
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="User Login",
    description="Authenticates user credentials and returns JWT access and refresh tokens.",
)
@limiter.limit("5/minute")
def login(
    request: Request,
    payload: UserLoginRequest,
    db: Session = Depends(get_db),
):
    client_ip = request.client.host if request.client else "unknown"
    device_info = request.headers.get("user-agent", "Unknown Device")
    try:
        auth_data = AuthService.authenticate_user(
            db=db,
            email=payload.email,
            password=payload.password,
            ip_address=client_ip,
            device_info=device_info,
        )
        return auth_data
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post(
    "/refresh",
    response_model=TokenRefreshResponse,
    summary="Refresh Access Token",
    description="Exchanges a valid refresh token for a new short-lived JWT access token.",
)
@limiter.limit("20/minute")
def refresh(
    request: Request,
    payload: TokenRefreshRequest,
    db: Session = Depends(get_db),
):
    client_ip = request.client.host if request.client else "unknown"
    try:
        tokens = AuthService.refresh_access_token(
            db=db,
            refresh_token=payload.refresh_token,
            ip_address=client_ip,
        )
        return tokens
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        )


@router.post(
    "/logout",
    summary="User Logout",
    description="Revokes active user session in database using refresh token.",
)
@limiter.limit("20/minute")
def logout(
    request: Request,
    payload: LogoutRequest,
    db: Session = Depends(get_db),
):
    client_ip = request.client.host if request.client else "unknown"
    success = AuthService.logout_user(
        db=db,
        refresh_token=payload.refresh_token,
        ip_address=client_ip,
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session not found or already revoked.",
        )
    return {"message": "Successfully logged out and session revoked."}


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get Current User Profile",
    description="Retrieves profile of currently authenticated user.",
)
def get_me(
    current_user: User = Depends(get_current_active_user),
):
    return current_user
