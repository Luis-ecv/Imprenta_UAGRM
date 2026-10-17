"""
Configuración centralizada del backend.
Lee todas las variables desde el archivo .env mediante Pydantic Settings.
"""
import json
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Clase de configuración que mapea las variables de entorno del sistema.
    Pydantic Settings lee automáticamente desde el archivo .env en la raíz del proceso.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # =========================================================================
    # Entorno de ejecución
    # =========================================================================
    ENVIRONMENT: str = "development"

    # =========================================================================
    # Base de datos
    # =========================================================================
    DATABASE_URL: str

    # =========================================================================
    # Seguridad JWT
    # =========================================================================
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # =========================================================================
    # CORS — orígenes permitidos
    # =========================================================================
    ALLOWED_ORIGINS: Union[List[str], str] = ["http://localhost:5173", "http://localhost:80"]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v_clean = v.strip()
            if (v_clean.startswith('"') and v_clean.endswith('"')) or (v_clean.startswith("'") and v_clean.endswith("'")):
                v_clean = v_clean[1:-1].strip()
            if v_clean.startswith("[") and v_clean.endswith("]"):
                try:
                    return json.loads(v_clean)
                except Exception:
                    pass
            return [i.strip().strip("'").strip('"') for i in v_clean.split(",") if i.strip()]
        return v

    # =========================================================================
    # Machine Learning
    # =========================================================================
    ML_MODEL_PATH: str = "./ml_models/"
    ML_MIN_RECORDS_FOR_TRAINING: int = 50


# Instancia global de configuración
settings = Settings()
