"""
Schemas Pydantic para el módulo de Bitácora (Auditoría del sistema).
"""
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel


class BitacoraResponse(BaseModel):
    """Registro de auditoría retornado por la API."""

    id: int
    usuario_id: Optional[int] = None
    accion: str
    tabla_afec: Optional[str] = None
    registro_id: Optional[int] = None
    detalle: Optional[Any] = None  # JSON libre con datos del evento
    ip_origen: Optional[str] = None
    fecha_hora: datetime

    model_config = {"from_attributes": True}
