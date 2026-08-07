from typing import Optional, Dict, Any
from app.utils.logger import logger


class UserService:
    """
    Manages user profile, preferences, and state.
    """

    @staticmethod
    def get_user_profile(user_id: int) -> Optional[Dict[str, Any]]:
        logger.info(f"Retrieving profile for user_id {user_id}")
        return {
            "id": user_id,
            "full_name": "Citizen User",
            "email": "user@example.com",
            "state": "Maharashtra",
            "occupation": "Farmer",
        }
