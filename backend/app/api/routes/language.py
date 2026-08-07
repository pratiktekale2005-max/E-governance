"""
api/routes/language.py
Endpoints for checking and overriding session language.

  GET  /language  -> current language for a session (+ supported languages list)
  PUT  /language  -> explicitly set session language
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.multilingual.language_manager import language_manager

router = APIRouter(prefix="/language", tags=["Language Settings"])


class LanguageResponse(BaseModel):
    session_id: str
    language: str
    supported_languages: dict[str, str]


class SetLanguageRequest(BaseModel):
    session_id: str
    language: str


@router.get("", response_model=LanguageResponse)
async def get_language(session_id: str = Query(...)):
    return LanguageResponse(
        session_id=session_id,
        language=language_manager.get_language(session_id),
        supported_languages=language_manager.list_supported(),
    )


@router.put("", response_model=LanguageResponse)
async def set_language(body: SetLanguageRequest):
    try:
        language = language_manager.set_language(body.session_id, body.language, explicit=True)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return LanguageResponse(
        session_id=body.session_id,
        language=language,
        supported_languages=language_manager.list_supported(),
    )
