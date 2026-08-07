"""
session_manager.py
Conversation Memory: Tracks turn history, language, and citizen profile per session.
"""

from __future__ import annotations

import threading
import time
import uuid
from dataclasses import dataclass, field


@dataclass
class ConversationTurn:
    user: str
    assistant: str
    timestamp: float = field(default_factory=time.time)


@dataclass
class SessionState:
    session_id: str
    history: list[ConversationTurn] = field(default_factory=list)
    citizen_profile: dict = field(default_factory=dict)
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)

    @property
    def last_question(self) -> str | None:
        return self.history[-1].user if self.history else None

    @property
    def last_response(self) -> str | None:
        return self.history[-1].assistant if self.history else None

    def as_history_list(self) -> list[dict]:
        return [{"user": t.user, "assistant": t.assistant} for t in self.history]


class SessionManager:
    MAX_HISTORY_TURNS = 30

    def __init__(self) -> None:
        self._sessions: dict[str, SessionState] = {}
        self._lock = threading.Lock()

    def create_session(self) -> str:
        session_id = str(uuid.uuid4())
        with self._lock:
            self._sessions[session_id] = SessionState(session_id=session_id)
        return session_id

    def get_or_create(self, session_id: str | None) -> SessionState:
        with self._lock:
            if session_id and session_id in self._sessions:
                return self._sessions[session_id]
            new_id = session_id or str(uuid.uuid4())
            state = SessionState(session_id=new_id)
            self._sessions[new_id] = state
            return state

    def add_turn(self, session_id: str, user_text: str, assistant_text: str) -> None:
        with self._lock:
            state = self._sessions.setdefault(session_id, SessionState(session_id=session_id))
            state.history.append(ConversationTurn(user=user_text, assistant=assistant_text))
            if len(state.history) > self.MAX_HISTORY_TURNS:
                state.history = state.history[-self.MAX_HISTORY_TURNS:]
            state.updated_at = time.time()

    def update_profile(self, session_id: str, profile_updates: dict) -> dict:
        with self._lock:
            state = self._sessions.setdefault(session_id, SessionState(session_id=session_id))
            state.citizen_profile.update(profile_updates)
            state.updated_at = time.time()
            return dict(state.citizen_profile)

    def get_history(self, session_id: str) -> list[dict]:
        with self._lock:
            state = self._sessions.get(session_id)
            return state.as_history_list() if state else []

    def clear_session(self, session_id: str) -> None:
        with self._lock:
            self._sessions.pop(session_id, None)


# Module-level singleton
session_manager = SessionManager()
