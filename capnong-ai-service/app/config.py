from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    gemini_image_model: str = "gemini-2.5-flash-image"
    xai_api_key: str = ""
    
    # Zalo AI keys
    zalo_api_key: str = ""
    
    app_env: str = "development"
    log_level: str = "INFO"
    allowed_origins: str = "http://localhost:3000"

    clipdrop_api_key: str = ""
    ai_service_base_url: str = "http://localhost:8000"

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    @property
    def has_clipdrop(self) -> bool:
        return bool(self.clipdrop_api_key)


@lru_cache()
def get_settings() -> Settings:
    return Settings()
