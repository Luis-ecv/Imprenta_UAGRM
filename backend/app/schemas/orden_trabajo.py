"""
Schemas Pydantic para el módulo de Órdenes de Trabajo.
Incluye schemas para la orden, cambio de estado e historial.
"""
from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class OrdenTrabajoBase(BaseModel):
    cliente_id: int
    descripcion: str
    fecha_entrega: Optional[date] = None
    observaciones: Optional[str] = None
    proforma_id: Optional[int] = None


class OrdenTrabajoCreate(OrdenTrabajoBase):
    """Datos para crear una nueva orden de trabajo."""
    pass


class OrdenTrabajoUpdate(BaseModel):
    """Campos actualizables de una orden de trabajo."""

    descripcion: Optional[str] = None
    fecha_entrega: Optional[date] = None
    observaciones: Optional[str] = None


class CambioEstadoOrden(BaseModel):
    """Solicitud de cambio de estado de una orden de trabajo."""

    nuevo_estado: str
    observacion: Optional[str] = None


class OrdenTrabajoResponse(OrdenTrabajoBase):
    """Orden de trabajo completa retornada por la API."""

    id: int
    numero: str
    estado: str
    total: Decimal
    fecha_inicio: Optional[date] = None

    model_config = {"from_attributes": True}
