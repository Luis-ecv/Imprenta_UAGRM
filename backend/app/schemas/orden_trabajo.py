"""
Schemas Pydantic para Órdenes de Trabajo y Estados.
"""
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class DetalleOrdenCreate(BaseModel):
    formato_corte: str
    tipo_encuadernacion: str
    especificaciones_taller: Optional[str] = None


class DetalleOrdenResponse(DetalleOrdenCreate):
    id_detalle_orden: int
    orden_id: int

    model_config = ConfigDict(from_attributes=True)


class HistorialEstadoResponse(BaseModel):
    id_historial: int
    orden_id: int
    usuario_id: int
    estado_anterior: str
    estado_nuevo: str
    fecha_cambio: datetime

    model_config = ConfigDict(from_attributes=True)


class OrdenTrabajoCreate(BaseModel):
    proforma_id: int
    fecha_compromiso: date
    prioridad: str = "NORMAL"  # NORMAL | URGENTE
    observaciones: Optional[str] = None
    detalle_orden: DetalleOrdenCreate


class OrdenTrabajoUpdate(BaseModel):
    fecha_compromiso: Optional[date] = None
    prioridad: Optional[str] = None
    observaciones: Optional[str] = None


class CambioEstadoOrden(BaseModel):
    estado_nuevo: str
    observaciones: Optional[str] = None


class OrdenTrabajoResponse(BaseModel):
    id_orden: int
    proforma_id: int
    usuario_id: int
    codigo_ot: str
    fecha_compromiso: date
    prioridad: str
    estado_actual: str
    observaciones: Optional[str] = None
    created_at: datetime
    detalles_orden: List[DetalleOrdenResponse] = []
    historial: List[HistorialEstadoResponse] = []

    model_config = ConfigDict(from_attributes=True)
