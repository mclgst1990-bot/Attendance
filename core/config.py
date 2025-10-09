from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    PORT: int = 10000
    HOST: str = "0.0.0.0"
    DATABASE_URL: str
    REDIS_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ENVIRONMENT: str = "production"
    
    # Payroll Settings
    PF_PERCENTAGE: float = 12.0
    ESIC_PERCENTAGE: float = 3.25
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
