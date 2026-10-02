"""
Schemas Pydantic para el módulo de Predicción de Demanda (Machine Learning).
"""
from datetime import date
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel


class PrediccionRequest(BaseModel):
    """Solicitud de predicción para un insumo en un período determinado."""

    insumo_id: int
    meses_a_predecir: int = 3  # horizonte de predicción en meses


class PrediccionResponse(BaseModel):
    """Resultado de predicción para un insumo retornado por la API."""

    id: int
    insumo_id: int
    periodo_inicio: date
    periodo_fin: date
    cantidad_predicha: Decimal
    confianza_pct: Optional[Decimal] = None
    version_modelo: Optional[str] = None

    model_config = {"from_attributes": True}


class EntrenamientoResponse(BaseModel):
    """Resultado del proceso de entrenamiento del modelo ML."""

    exitoso: bool
    mensaje: str
    version_modelo: Optional[str] = None
    registros_usados: Optional[int] = None
    score_r2: Optional[float] = None  # coeficiente de determinación del modelo
