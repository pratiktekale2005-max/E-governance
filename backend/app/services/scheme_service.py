from typing import List, Dict, Any
from app.utils.logger import logger


class SchemeService:
    """
    Handles scheme discovery, filtering, and eligibility matching.
    """

    @staticmethod
    def get_schemes(category: str = None) -> List[Dict[str, Any]]:
        logger.info(f"Fetching schemes for category: {category or 'All'}")
        return [
            {
                "id": 1,
                "name": "PM Kisan Samman Nidhi",
                "category": "Agriculture",
                "description": "Financial assistance to farmer families across the country.",
            },
            {
                "id": 2,
                "name": "Ayushman Bharat PM-JAY",
                "category": "Healthcare",
                "description": "Health coverage up to Rs. 5 lakhs per family per year.",
            },
        ]
