"""
Citizen Profile REST API Router (Module 10 / Module 1)
"""
from __future__ import annotations

from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Request
from app.models.citizen_profile import CitizenProfileInput, normalize_profile, NormalizedCitizenProfile
from app.utils.limiter import limiter

router = APIRouter(prefix="/profile", tags=["Citizen Profile Management"])

# In-memory storage for user profiles (keyed by user_id or "default")
PROFILE_STORE: Dict[str, Dict[str, Any]] = {}


@router.post(
    "",
    summary="Create or Save Citizen Profile",
    description="Validates and normalizes citizen demographic profile fields.",
)
@limiter.limit("30/minute")
def create_profile(request: Request, payload: CitizenProfileInput):
    user_id = payload.user_id or "default_citizen"
    norm = normalize_profile(payload)
    PROFILE_STORE[user_id] = norm.as_dict()
    return {
        "status": "success",
        "message": "Citizen profile successfully normalized and saved.",
        "user_id": user_id,
        "profile": PROFILE_STORE[user_id],
    }


@router.get(
    "",
    summary="Get Citizen Profile",
    description="Retrieves current citizen profile by user_id.",
)
def get_profile(user_id: str = "default_citizen"):
    if user_id not in PROFILE_STORE:
        raise HTTPException(status_code=404, detail=f"Profile for user_id '{user_id}' not found.")
    return {
        "user_id": user_id,
        "profile": PROFILE_STORE[user_id],
    }


@router.put(
    "",
    summary="Update Citizen Profile",
    description="Updates existing citizen profile attributes.",
)
def update_profile(payload: CitizenProfileInput):
    user_id = payload.user_id or "default_citizen"
    existing = PROFILE_STORE.get(user_id, {})
    new_input = payload.dict(exclude_unset=True)
    merged_input = {**existing, **new_input}

    parsed = CitizenProfileInput(**merged_input)
    norm = normalize_profile(parsed)
    PROFILE_STORE[user_id] = norm.as_dict()

    return {
        "status": "success",
        "message": "Citizen profile successfully updated.",
        "user_id": user_id,
        "profile": PROFILE_STORE[user_id],
    }
