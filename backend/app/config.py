from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with Pydantic v2 validation."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Database
    DATABASE_URL: str = Field(
        default="sqlite:///./rig.db",
        description="Database connection URL"
    )

    # JWT Authentication
    JWT_SECRET: str = Field(
        default="rig-dev-secret-change-in-production",
        min_length=32,
        description="JWT secret key (minimum 32 characters for security)"
    )
    JWT_ALGORITHM: str = Field(
        default="HS256",
        description="JWT signing algorithm"
    )
    JWT_EXPIRATION_HOURS: int = Field(
        default=24,
        gt=0,
        description="JWT token expiration time in hours"
    )

    # CORS
    CORS_ORIGINS: str = Field(
        default="http://localhost:3000",
        description="Comma-separated list of allowed CORS origins"
    )

    # Admin User
    ADMIN_EMAIL: str = Field(
        default="admin@rig.ai",
        description="Default admin email"
    )
    ADMIN_PASSWORD: str = Field(
        default="admin123",
        min_length=8,
        description="Default admin password (minimum 8 characters)"
    )
    ADMIN_NAME: str = Field(
        default="Admin",
        description="Default admin name"
    )

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS_ORIGINS string into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


settings = Settings()
