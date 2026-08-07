import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "AI Citizen OS"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/citizen_db"

    # JWT Security
    SECRET_KEY: str = "default_super_secret_key_change_me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # AI Service Keys
    GOOGLE_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # Debug Flag
    DEBUG: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )


settings = Settings()
