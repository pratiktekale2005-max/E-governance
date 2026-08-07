from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session as DBSession
from app.database.models import User, Session, GovernmentScheme, AuditLog
from app.auth.hashing import hash_password
from app.utils.logger import logger


def get_user_by_id(db: DBSession, user_id: str) -> Optional[User]:
    """Retrieve user by UUID."""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: DBSession, email: str) -> Optional[User]:
    """Retrieve user by email address."""
    return db.query(User).filter(User.email == email.lower().strip()).first()


def create_user(
    db: DBSession,
    full_name: str,
    email: str,
    password: str,
    role: str = "Citizen",
    phone_number: Optional[str] = None,
    preferred_language: str = "en",
    state: Optional[str] = None,
    district: Optional[str] = None,
) -> User:
    """Create a new user account."""
    hashed_pwd = hash_password(password)
    user = User(
        full_name=full_name.strip(),
        email=email.lower().strip(),
        password_hash=hashed_pwd,
        role=role,
        phone_number=phone_number,
        preferred_language=preferred_language,
        state=state,
        district=district,
        is_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info(f"User created in DB: {user.email} (Role: {user.role})")
    return user


def create_session(
    db: DBSession,
    user_id: str,
    access_token: str,
    refresh_token: str,
    expires_at: datetime,
    ip_address: Optional[str] = None,
    device_info: Optional[str] = None,
) -> Session:
    """Create a new active session record."""
    session = Session(
        user_id=user_id,
        access_token=access_token,
        refresh_token=refresh_token,
        expires_at=expires_at,
        ip_address=ip_address,
        device_info=device_info,
        is_revoked=False,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def get_active_session_by_refresh_token(db: DBSession, refresh_token: str) -> Optional[Session]:
    """Find valid non-revoked session by refresh token."""
    return (
        db.query(Session)
        .filter(
            Session.refresh_token == refresh_token,
            Session.is_revoked == False,
            Session.expires_at > datetime.utcnow(),
        )
        .first()
    )


def revoke_session(db: DBSession, session_id: str) -> bool:
    """Revoke active login session."""
    session = db.query(Session).filter(Session.session_id == session_id).first()
    if session:
        session.is_revoked = True
        db.commit()
        return True
    return False


def get_all_schemes(
    db: DBSession,
    category: Optional[str] = None,
    state: Optional[str] = None,
    limit: int = 50,
) -> List[GovernmentScheme]:
    """Retrieve government schemes with optional filtering."""
    query = db.query(GovernmentScheme).filter(GovernmentScheme.status == "Active")
    if category:
        query = query.filter(GovernmentScheme.category.ilike(f"%{category}%"))
    if state:
        query = query.filter(
            (GovernmentScheme.state.ilike(f"%{state}%")) | (GovernmentScheme.state == "Central")
        )
    return query.limit(limit).all()


def log_audit(
    db: DBSession,
    action: str,
    resource: str,
    status: str,
    user_id: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> AuditLog:
    """Create audit record for system actions."""
    audit = AuditLog(
        user_id=user_id,
        action=action,
        resource=resource,
        status=status,
        ip_address=ip_address,
    )
    db.add(audit)
    db.commit()
    return audit
