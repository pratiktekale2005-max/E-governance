"""
api/routes/speech.py
Endpoints for speech transcription, multilingual speech chat, and text-to-speech.

  POST /speech/transcribe  -> voice in, text+language+confidence out
  POST /speech/chat        -> voice OR text in, full pipeline, voice+text out
  POST /speech/speak       -> text in, voice out (TTS only)
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel

from app.memory.session_manager import session_manager
from app.multilingual.ai_processor import generate_response
from app.multilingual.language_manager import language_manager
from app.speech.language_detector import detect_text_language
from app.speech.transcription import TranscriptionError, run_stt_pipeline
from app.tts.audio_output import encode_wav, encode_wav_base64
from app.tts.voice_generator import generate_voice_response

logger = logging.getLogger("app.api.routes.speech")
router = APIRouter(prefix="/speech", tags=["Speech & Multilingual Voice"])


# --------------------------------------------------------------------------
# POST /speech/transcribe
# --------------------------------------------------------------------------

class TranscribeResponse(BaseModel):
    text: str
    language: str
    confidence: float


@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe(
    audio: UploadFile = File(..., description="Audio file (wav/ogg/flac/etc.)"),
    session_id: str | None = Form(None),
):
    raw_bytes = await audio.read()
    hint_language = language_manager.get_language(session_id) if session_id else None

    try:
        result = run_stt_pipeline(raw_bytes, hint_language=hint_language)
    except TranscriptionError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    if session_id:
        language_manager.maybe_update_from_detection(session_id, result.language, result.confidence)

    return TranscribeResponse(**result.to_dict())


# --------------------------------------------------------------------------
# POST /speech/chat
# --------------------------------------------------------------------------

class ChatResponse(BaseModel):
    session_id: str
    query_text: str
    response_text: str
    language: str
    audio_base64: str
    audio_sample_rate: int


@router.post("/chat", response_model=ChatResponse)
async def chat(
    session_id: str | None = Form(None),
    text: str | None = Form(None, description="Text query, if not sending audio"),
    audio: UploadFile | None = File(None, description="Voice query, if not sending text"),
    voice_style: str | None = Form(None, description="Optional override for TTS voice description"),
):
    if not text and not audio:
        raise HTTPException(status_code=400, detail="Provide either 'text' or 'audio'.")

    state = session_manager.get_or_create(session_id)
    session_id = state.session_id

    # Stage 1: get query text + language, from voice or text input
    if audio is not None:
        raw_bytes = await audio.read()
        hint_language = language_manager.get_language(session_id)
        try:
            stt_result = run_stt_pipeline(raw_bytes, hint_language=hint_language)
        except TranscriptionError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc
        query_text = stt_result.text
        language = language_manager.maybe_update_from_detection(
            session_id, stt_result.language, stt_result.confidence
        )
    else:
        query_text = text.strip()
        detected_lang, confidence = detect_text_language(query_text, fallback=language_manager.get_language(session_id))
        language = language_manager.maybe_update_from_detection(session_id, detected_lang, confidence)

    if not query_text:
        raise HTTPException(status_code=422, detail="Empty query after processing input.")

    # Stage 2: AI processing
    try:
        ai_result = generate_response(
            query=query_text,
            language=language,
            conversation_history=session_manager.get_history(session_id),
            citizen_profile=state.citizen_profile,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    session_manager.add_turn(session_id, query_text, ai_result["text"])

    # Stage 3: voice response
    try:
        audio_array, sample_rate = generate_voice_response(
            ai_result["speech_text"], language, voice_style=voice_style
        )
        audio_b64 = encode_wav_base64(audio_array, sample_rate)
    except RuntimeError as exc:
        logger.warning("TTS unavailable, returning text-only response: %s", exc)
        audio_b64 = ""
        sample_rate = 0

    return ChatResponse(
        session_id=session_id,
        query_text=query_text,
        response_text=ai_result["text"],
        language=language,
        audio_base64=audio_b64,
        audio_sample_rate=sample_rate,
    )


# --------------------------------------------------------------------------
# POST /speech/speak
# --------------------------------------------------------------------------

@router.post("/speak")
async def speak(
    text: str = Form(...),
    language: str = Form("en"),
    voice_style: str | None = Form(None),
):
    if language not in language_manager.list_supported():
        raise HTTPException(status_code=400, detail=f"Unsupported language '{language}'.")

    try:
        audio_array, sample_rate = generate_voice_response(text, language, voice_style=voice_style)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    wav_bytes = encode_wav(audio_array, sample_rate)
    return Response(content=wav_bytes, media_type="audio/wav")
