from pydantic_settings import BaseSettings
from pathlib import Path
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "ChennaiHome AI"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "chennai-home-ai-super-secret-jwt-key-2026-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    DATABASE_URL: str = f"sqlite:///{Path(__file__).resolve().parent.parent.parent.parent / 'chennaihome.db'}"

    class Config:
        case_sensitive = True

settings = Settings()
