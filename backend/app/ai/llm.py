from typing import Optional
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)
import google.generativeai as genai
from app.utils.config import settings
from app.utils.logger import logger

MODEL_NAMES = [
    "gemini-2.0-flash",
    "gemini-2.5-pro",
    "gemini-flash-latest",
    "gemini-pro-latest",
]


class LLMService:
    """
    LLM Interface supporting Google Gemini models.
    """

    def __init__(self):
        self.google_key = settings.GOOGLE_API_KEY
        self.model = None
        self.active_model_name = None

        if self.google_key and self.google_key != "YOUR_GEMINI_KEY":
            try:
                genai.configure(api_key=self.google_key)
                for model_name in MODEL_NAMES:
                    try:
                        m = genai.GenerativeModel(model_name)
                        self.model = m
                        self.active_model_name = model_name
                        logger.info(f"Initialized Google Gemini model '{model_name}' successfully.")
                        break
                    except Exception:
                        continue
            except Exception as e:
                logger.warning(f"Failed to configure Gemini model: {e}")
                self.model = None
        else:
            logger.warning("No valid Google Gemini API Key configured in .env.")

    def generate_response(self, prompt: str) -> str:
        """
        Generates text completion using Google Gemini LLM.
        """
        logger.info("Calling Gemini LLM service for response generation.")
        if self.model:
            try:
                response = self.model.generate_content(prompt)
                if response and hasattr(response, "text") and response.text:
                    return response.text.strip()
            except Exception as e:
                logger.error(f"Gemini generation error with model {self.active_model_name}: {e}")
                for alt_name in MODEL_NAMES:
                    if alt_name != self.active_model_name:
                        try:
                            alt_m = genai.GenerativeModel(alt_name)
                            res = alt_m.generate_content(prompt)
                            if res and hasattr(res, "text") and res.text:
                                self.model = alt_m
                                self.active_model_name = alt_name
                                return res.text.strip()
                        except Exception as ex:
                            logger.error(f"Fallback model '{alt_name}' error: {ex}")

        return "Gemini LLM generation unavailable. (Retrieved scheme evidence is available below)."
