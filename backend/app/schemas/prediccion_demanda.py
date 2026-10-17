"""
Schemas Pydantic para Predicción de Demanda (Machine Learning).
"""
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict


class InferenciaMLRequest(BaseModel):
    insumo_id: int
    periodo_id: int


class PrediccionDemandaResponse(BaseModel):
    id_prediccion: int
    insumo_id: int
    periodo_id: int
    cantidad_proyectada: Decimal
    margen_variabilidad: Decimal
    stock_sugerido_compra: Decimal
    fecha_generacion: datetime
    es_referencial: bool = False

    model_config = ConfigDict(from_attributes=True)

class EntrenamientoResponse(BaseModel):
    mensaje: str
    registros_entrenamiento: int
    r2_score: float | None = None
    mae: float | None = None
    fecha_entrenamiento: datetime

PrediccionRequest = InferenciaMLRequest
PrediccionResponse = PrediccionDemandaResponse
