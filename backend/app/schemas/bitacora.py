"""
Schemas Pydantic para Bitácora de Auditoría.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class BitacoraCreate(BaseModel):
    usuario_id: int
    accion: str
    modulo: str
    detalle: Optional[str] = None
    ip_origen: str


class BitacoraResponse(BaseModel):
    id_bitacora: int
    usuario_id: int
    accion: str
    modulo: str
    detalle: Optional[str] = None
    ip_origen: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
