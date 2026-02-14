import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./rig.db")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "rig-dev-secret-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    CORS_ORIGINS: list[str] = os.getenv(
        "CORS_ORIGINS", "http://localhost:3000"
    ).split(",")
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@rig.ai")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "admin123")
    ADMIN_NAME: str = os.getenv("ADMIN_NAME", "Admin")


settings = Settings()
