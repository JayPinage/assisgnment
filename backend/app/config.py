"""Application configuration and environment variable loading."""

from __future__ import annotations

import os


class Settings:
    """Simple environment-backed application settings."""

    def __init__(self) -> None:
        self.database_url = os.getenv("DATABASE_URL", "")
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")
        self.groq_api_key = os.getenv("GROQ_API_KEY", "")


settings = Settings()
