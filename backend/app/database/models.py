import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    Text,
    ForeignKey,
    Integer,
    Float,
)
from sqlalchemy.orm import relationship
from app.database.db import Base


def generate_uuid() -> str:
    """Utility helper to generate string UUIDs."""
    return str(uuid.uuid4())


class User(Base):
    """
    User Account Table representing citizens, admins, and moderators.
    """
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone_number = Column(String(20), nullable=True)
    preferred_language = Column(String(10), default="en", nullable=False)
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    role = Column(String(20), default="Citizen", nullable=False)  # Citizen, Admin, Moderator
    is_verified = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")


class Session(Base):
    """
    Active user authentication sessions and JWT token management.
    """
    __tablename__ = "sessions"

    session_id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    access_token = Column(Text, nullable=False)
    refresh_token = Column(Text, nullable=False, index=True)
    device_info = Column(String(255), nullable=True)
    ip_address = Column(String(45), nullable=True)
    is_revoked = Column(Boolean, default=False, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="sessions")


class Conversation(Base):
    """
    User conversation threads for AI interaction history.
    """
    __tablename__ = "conversations"

    conversation_id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False, default="New Conversation")
    language = Column(String(10), default="en", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    """
    Individual chat messages exchanged between citizen and AI.
    """
    __tablename__ = "messages"

    message_id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    conversation_id = Column(String(36), ForeignKey("conversations.conversation_id", ondelete="CASCADE"), nullable=False, index=True)
    sender = Column(String(20), nullable=False)  # 'user' or 'assistant'
    message = Column(Text, nullable=False)
    translated_message = Column(Text, nullable=True)
    ai_response = Column(Text, nullable=True)
    confidence_score = Column(Float, nullable=True)
    response_time = Column(Float, nullable=True)  # in seconds/ms
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    citations = relationship("Citation", back_populates="message", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="message", cascade="all, delete-orphan")


class GovernmentScheme(Base):
    """
    Normalized government schemes database entity.
    """
    __tablename__ = "government_schemes"

    scheme_id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    scheme_name = Column(String(255), nullable=False, index=True)
    department = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    state = Column(String(100), default="Central", nullable=False, index=True)
    summary = Column(Text, nullable=False)
    official_url = Column(String(500), nullable=True)
    last_verified = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(String(20), default="Active", nullable=False)  # Active, Inactive, Draft

    # Relationships
    citations = relationship("Citation", back_populates="scheme", cascade="all, delete-orphan")


class Citation(Base):
    """
    Source citations backing AI-generated responses.
    """
    __tablename__ = "citations"

    citation_id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    message_id = Column(String(36), ForeignKey("messages.message_id", ondelete="CASCADE"), nullable=False, index=True)
    scheme_id = Column(String(36), ForeignKey("government_schemes.scheme_id", ondelete="CASCADE"), nullable=True, index=True)
    source_title = Column(String(255), nullable=False)
    source_url = Column(String(500), nullable=True)
    page_number = Column(Integer, nullable=True)
    retrieved_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    message = relationship("Message", back_populates="citations")
    scheme = relationship("GovernmentScheme", back_populates="citations")


class Feedback(Base):
    """
    Citizen ratings and feedback on AI scheme responses.
    """
    __tablename__ = "feedback"

    feedback_id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    message_id = Column(String(36), ForeignKey("messages.message_id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)  # 1 to 5 stars
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="feedback")
    message = relationship("Message", back_populates="feedback")


class AuditLog(Base):
    """
    Audit log tracking security, authentication, and sensitive user actions.
    """
    __tablename__ = "audit_logs"

    log_id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)  # LOGIN, REGISTER, LOGOUT, REFRESH_TOKEN, etc.
    resource = Column(String(100), nullable=False)
    status = Column(String(20), nullable=False)  # SUCCESS, FAILED, UNAUTHORIZED
    ip_address = Column(String(45), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="audit_logs")
