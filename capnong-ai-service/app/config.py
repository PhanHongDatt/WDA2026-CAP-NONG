from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    gemini_api_key: str
    gemini_model: str = "gemini-2.5-flash"
    gemini_image_model: str = "gemini-2.5-flash-image"
    xai_api_key: str = ""  # Grok image generation (xAI)
    app_env: str = "development"
    log_level: str = "INFO"
    allowed_origins: str = "http://localhost:3000"

    # Clipdrop (deprecated — dùng rembg thay thế)
    clipdrop_api_key: str = ""

    # AI service internal settings
    ai_service_base_url: str = "http://localhost:8000"

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    @property
    def has_clipdrop(self) -> bool:
        return bool(self.clipdrop_api_key)

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()