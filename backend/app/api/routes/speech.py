"""
api/routes/speech.py
Endpoints for speech transcription, multilingual speech chat, and text-to-speech.

  POST /speech/transcribe -> voice in, text+language+confidence out
  POST /speech/chat       -> voice OR text in, full pipeline, voice+text out
  POST /speech/speak      -> text in, voice out (gTTS Indian accent MP3)
  POST /speech/tts        -> text in, voice out (gTTS Indian accent MP3)
"""

from __future__ import annotations

import io
import logging
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel

from app.memory.session_manager import session_manager
from app.multilingual.ai_processor import generate_response
from app.multilingual.language_manager import language_manager
from app.speech.language_detector import detect_text_language
from app.speech.transcription import TranscriptionError, run_stt_pipeline

try:
    from gtts import gTTS
    GTTS_AVAILABLE = True
except ImportError:
    GTTS_AVAILABLE = False

logger = logging.getLogger("app.api.routes.speech")
router = APIRouter(prefix="/speech", tags=["Speech & Multilingual Voice"])


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

    return ChatResponse(
        session_id=session_id,
        query_text=query_text,
        response_text=ai_result["text"],
        language=language,
        audio_base64="",
        audio_sample_rate=24000,
    )


class TTSRequest(BaseModel):
    text: str
    language: str = "en"


@router.post("/tts", summary="Generate Authentic Indian Accent MP3 Voice Response using gTTS")
@router.post("/speak", summary="Generate Authentic Indian Accent MP3 Voice Response using gTTS")
def generate_speech_audio(payload: TTSRequest):
    """
    Generates authentic Indian accent voice responses for English, Hindi, Marathi, Tamil, Telugu, and Kannada.
    """
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text payload cannot be empty.")

    clean_text = payload.text.replace("*", "").replace("#", "").replace("_", "").strip()
    
    # Map language codes
    lang_map = {
        "English": "en",
        "Hindi": "hi",
        "Marathi": "mr",
        "Tamil": "ta",
        "Telugu": "te",
        "Kannada": "kn",
        "en": "en",
        "hi": "hi",
        "mr": "mr",
        "ta": "ta",
        "te": "te",
        "kn": "kn",
    }
    target_lang = lang_map.get(payload.language, lang_map.get(payload.language.lower(), "en"))

    if GTTS_AVAILABLE:
        try:
            # Use Indian top-level domain (co.in) for authentic Indian English accent
            tld_domain = "co.in" if target_lang == "en" else "com"
            tts = gTTS(text=clean_text[:300], lang=target_lang, tld=tld_domain, slow=False)
            mp3_fp = io.BytesIO()
            tts.write_to_fp(mp3_fp)
            mp3_fp.seek(0)
            return StreamingResponse(mp3_fp, media_type="audio/mp3")
        except Exception as e:
            logger.warning(f"gTTS generation error for lang '{target_lang}': {e}")
            try:
                # Fallback to Indian English (en co.in)
                tts = gTTS(text=clean_text[:300], lang="en", tld="co.in", slow=False)
                mp3_fp = io.BytesIO()
                tts.write_to_fp(mp3_fp)
                mp3_fp.seek(0)
                return StreamingResponse(mp3_fp, media_type="audio/mp3")
            except Exception as ex:
                raise HTTPException(status_code=500, detail=f"TTS generation failed: {ex}")

    raise HTTPException(status_code=500, detail="gTTS engine is not installed on server.")
