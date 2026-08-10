"""
Configuration centralisée de l'application POSTrack.
Toutes les valeurs sensibles/variables viennent du fichier .env — jamais en dur ici.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --- Base de données ---
    DATABASE_URL: str = "mysql+pymysql://postrack:changeme@localhost:3306/postrack_db"

    # --- JWT ---
    JWT_SECRET_KEY: str = "change-me-in-env"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # --- Application ---
    APP_NAME: str = "POSTrack API"
    APP_VERSION: str = "3.1"
    DEBUG: bool = True

    # --- CORS (pour le frontend Vite en dev) ---
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
