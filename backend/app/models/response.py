from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class HealthResponse(BaseModel):
    status: str = Field("healthy", json_schema_extra={"example": "healthy"})
    app_name: str
    environment: str
    database_connected: bool
    timestamp: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    full_name: str
    email: str
    role: str
    phone_number: Optional[str] = None
    preferred_language: str
    state: Optional[str] = None
    district: Optional[str] = None
    is_verified: bool
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class TokenRefreshResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class SchemeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    scheme_id: str
    scheme_name: str
    department: str
    category: str
    state: str
    summary: str
    official_url: Optional[str] = None
    status: str
    last_verified: datetime


class ChatResponse(BaseModel):
    query: str
    response: str
    conversation_id: Optional[str] = None
    confidence_score: Optional[float] = None
    citations: Optional[List[str]] = Field(default_factory=list)


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    log_id: str
    user_id: Optional[str] = None
    action: str
    resource: str
    status: str
    ip_address: Optional[str] = None
    timestamp: datetime
