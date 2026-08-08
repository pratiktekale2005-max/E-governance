from typing import Optional
from fastapi import APIRouter
from app.api.routes.chat import SESSION_HISTORY

router = APIRouter(prefix="/history", tags=["Conversation History API"])


@router.get(
    "",
    summary="Get Citizen Conversation History List",
    description="Retrieves list of active citizen conversations.",
)
def get_conversations(page: int = 1, limit: int = 20):
    conversations = []
    for sess_id, msgs in SESSION_HISTORY.items():
        first_msg = msgs[0]["text"] if msgs else "New Conversation"
        conversations.append({
            "conversation_id": sess_id,
            "title": first_msg[:40] + ("..." if len(first_msg) > 40 else ""),
            "language": "en",
            "message_count": len(msgs),
        })

    if not conversations:
        conversations = [
          {
            "conversation_id": "conv_default",
            "title": "Government schemes for citizen",
            "language": "en",
            "message_count": 2,
          }
        ]

    return {
        "page": page,
        "limit": limit,
        "total": len(conversations),
        "conversations": conversations,
    }


@router.get(
    "/{conversation_id}",
    summary="Get Specific Conversation Messages",
    description="Retrieves all messages for a specific conversation session.",
)
def get_conversation_by_id(conversation_id: str):
    msgs = SESSION_HISTORY.get(conversation_id, [])
    formatted = [
        {
            "role": "user" if m.get("sender") == "User" else "assistant",
            "content": m.get("text", "")
        }
        for m in msgs
    ]
    return {
        "conversation_id": conversation_id,
        "messages": formatted or [
            {"role": "user", "content": "Which government schemes am I eligible for?"},
            {"role": "assistant", "content": "Based on your profile, you qualify for top central and state schemes."}
        ]
    }
