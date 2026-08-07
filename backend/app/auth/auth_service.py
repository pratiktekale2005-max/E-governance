from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session as DBSession
from app.database import crud
from app.auth.hashing import verify_password
from app.auth.jwt import create_access_token, create_refresh_token, decode_token
from app.utils.config import settings
from app.utils.logger import logger
from app.utils.audit import record_audit_log


class AuthService:
    """
    Core service handling user registration, authentication, session management, and token refresh.
    """

    @staticmethod
    def register_user(
        db: DBSession,
        full_name: str,
        email: str,
        password: str,
        role: str = "Citizen",
        phone_number: Optional[str] = None,
        preferred_language: str = "en",
        state: Optional[str] = None,
        district: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Registers a new user account after checking for duplicate email.
        """
        existing_user = crud.get_user_by_email(db, email)
        if existing_user:
            record_audit_log(
                db,
                action="REGISTER",
                resource=f"/auth/register?email={email}",
                status="FAILED_DUPLICATE",
                ip_address=ip_address,
            )
            raise ValueError("An account with this email address already exists.")

        user = crud.create_user(
            db=db,
            full_name=full_name,
            email=email,
            password=password,
            role=role,
            phone_number=phone_number,
            preferred_language=preferred_language,
            state=state,
            district=district,
        )

        record_audit_log(
            db,
            action="REGISTER",
            resource="/auth/register",
            status="SUCCESS",
            user_id=user.id,
            ip_address=ip_address,
        )

        return user

    @staticmethod
    def authenticate_user(
        db: DBSession,
        email: str,
        password: str,
        ip_address: Optional[str] = None,
        device_info: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Validates user credentials and generates access + refresh tokens with an active session.
        """
        user = crud.get_user_by_email(db, email)
        if not user or not verify_password(password, user.password_hash):
            record_audit_log(
                db,
                action="LOGIN",
                resource="/auth/login",
                status="FAILED_CREDENTIALS",
                user_id=user.id if user else None,
                ip_address=ip_address,
            )
            raise ValueError("Invalid email or password.")

        # Create JWT Tokens
        token_data = {"sub": user.id, "email": user.email, "role": user.role}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        refresh_expires = datetime.utcnow() + timedelta(days=7)

        # Store Session in DB
        session = crud.create_session(
            db=db,
            user_id=user.id,
            access_token=access_token,
            refresh_token=refresh_token,
            expires_at=refresh_expires,
            ip_address=ip_address,
            device_info=device_info,
        )

        record_audit_log(
            db,
            action="LOGIN",
            resource="/auth/login",
            status="SUCCESS",
            user_id=user.id,
            ip_address=ip_address,
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": user,
            "session_id": session.session_id,
        }

    @staticmethod
    def refresh_access_token(
        db: DBSession,
        refresh_token: str,
        ip_address: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generates a new access token using a valid refresh token.
        """
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise ValueError("Invalid or expired refresh token.")

        session = crud.get_active_session_by_refresh_token(db, refresh_token)
        if not session:
            raise ValueError("Session is expired or revoked. Please log in again.")

        user = crud.get_user_by_id(db, session.user_id)
        if not user:
            raise ValueError("User account no longer exists.")

        # Issue new access token
        token_data = {"sub": user.id, "email": user.email, "role": user.role}
        new_access_token = create_access_token(token_data)

        # Update active session with new access token
        session.access_token = new_access_token
        db.commit()

        record_audit_log(
            db,
            action="REFRESH_TOKEN",
            resource="/auth/refresh",
            status="SUCCESS",
            user_id=user.id,
            ip_address=ip_address,
        )

        return {
            "access_token": new_access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }

    @staticmethod
    def logout_user(
        db: DBSession,
        refresh_token: str,
        ip_address: Optional[str] = None,
    ) -> bool:
        """
        Revokes active session by refresh token.
        """
        session = crud.get_active_session_by_refresh_token(db, refresh_token)
        if session:
            crud.revoke_session(db, session.session_id)
            record_audit_log(
                db,
                action="LOGOUT",
                resource="/auth/logout",
                status="SUCCESS",
                user_id=session.user_id,
                ip_address=ip_address,
            )
            return True
        return False
