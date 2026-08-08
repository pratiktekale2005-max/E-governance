from typing import Optional
from fastapi import APIRouter, Request
from pydantic import BaseModel, Field, conint
from app.utils.logger import logger

router = APIRouter(prefix="/feedback", tags=["Citizen Feedback API"])

FEEDBACK_LOGS = []


class FeedbackRequest(BaseModel):
    message_id: Optional[str] = Field("msg_123", json_schema_extra={"example": "msg_456"})
    rating: conint(ge=1, le=5) = Field(..., description="1=Very Poor, 2=Poor, 3=Average, 4=Good, 5=Excellent", json_schema_extra={"example": 5})
    helpful: bool = Field(True, json_schema_extra={"example": True})
    feedback: Optional[str] = Field(None, json_schema_extra={"example": "The explanation was clear and helpful."})


@router.post(
    "",
    summary="Submit Citizen AI Feedback",
    description="Submits rating and feedback evaluation for an AI response.",
)
def submit_feedback(payload: FeedbackRequest):
    entry = {
        "message_id": payload.message_id,
        "rating": payload.rating,
        "helpful": payload.helpful,
        "feedback": payload.feedback,
    }
    FEEDBACK_LOGS.append(entry)
    logger.info(f"Citizen Feedback Logged: Rating={payload.rating}, Helpful={payload.helpful}")

    return {
        "success": True,
        "message": "Thank you for your feedback.",
        "feedback_id": f"fb_{len(FEEDBACK_LOGS)}",
    }
