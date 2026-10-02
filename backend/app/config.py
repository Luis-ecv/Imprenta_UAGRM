"""
Configuración centralizada del backend.
Lee todas las variables desde el archivo .env mediante Pydantic Settings.
NUNCA hardcodear valores de configuración en este archivo.
"""
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Clase de configuración que mapea las variables de entorno del sistema.
    Pydantic Settings lee automáticamente desde el archivo .env en la raíz del proceso.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        # Permite variables adicionales sin lanzar error
        extra="ignore",
    )

    # =========================================================================
    # Entorno de ejecución
    # =========================================================================
    ENVIRONMENT: str = "development"

    # =========================================================================
    # Base de datos
    # =========================================================================
    DATABASE_URL: str  # Requerida — no tiene valor por defecto

    # =========================================================================
    # Seguridad JWT
    # =========================================================================
    SECRET_KEY: str  # Requerida — generar con: openssl rand -hex 32
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 horas de jornada laboral

    # =========================================================================
    # CORS — orígenes permitidos
    # =========================================================================
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:80"]

    # =========================================================================
    # Machine Learning
    # =========================================================================
    ML_MODEL_PATH: str = "./ml_models/"
    ML_MIN_RECORDS_FOR_TRAINING: int = 50


# Instancia global de configuración — importar desde aquí en todo el proyecto
settings = Settings()
