from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./walleter.db"
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    GROK_API_KEY: str = "your-groq-api-key-here"
    GROK_API_URL: str = "https://api.groq.com/openai/v1/chat/completions"
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()
