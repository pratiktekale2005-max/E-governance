from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field


class UserRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr = Field(...)
    password: str = Field(..., min_length=6, max_length=100)
    phone_number: Optional[str] = Field(None)
    preferred_language: Optional[str] = Field("en")
    state: Optional[str] = Field(None)
    district: Optional[str] = Field(None)
    role: Optional[str] = Field("Citizen")  # Citizen, Admin, Moderator


class UserLoginRequest(BaseModel):
    email: EmailStr = Field(...)
    password: str = Field(..., min_length=6)


class TokenRefreshRequest(BaseModel):
    refresh_token: str = Field(..., description="Valid JWT refresh token")


class LogoutRequest(BaseModel):
    refresh_token: str = Field(..., description="JWT refresh token to revoke")


class ChatRequest(BaseModel):
    message: str = Field(..., description="User query or message content", min_length=1)
    conversation_id: Optional[str] = Field(None, description="Optional conversation UUID")
    language: Optional[str] = Field("en", description="Preferred response language")


class SchemeFilterRequest(BaseModel):
    category: Optional[str] = Field(None)
    state: Optional[str] = Field(None)
    search_query: Optional[str] = Field(None)
