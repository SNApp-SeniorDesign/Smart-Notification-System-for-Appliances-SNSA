from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
from pydantic import Field

# Resolve path for .env file
BASE_DIR = Path(__file__).resolve().parents[4]
ENV_FILE = BASE_DIR / ".env"


class Settings(BaseSettings):
    app_name: str = "Smart Notification System Appliance"
    app_version: str = "1.0.0"

    secret_key: str = Field(
        default="dev_secret",
        description="The secret key for JWT",
    )

    # Config for .env file
    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding="utf-8",
        populate_by_name=True,
    )


settings = Settings()
