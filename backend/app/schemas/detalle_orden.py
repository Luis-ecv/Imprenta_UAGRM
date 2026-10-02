"""
Schemas Pydantic para los detalles (ítems) de una orden de trabajo.
"""
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class DetalleOrdenBase(BaseModel):
    tarifa_id: int
    cantidad: Decimal = Field(gt=0)
    descripcion: Optional[str] = None


class DetalleOrdenCreate(DetalleOrdenBase):
    """Datos para agregar un ítem a una orden de trabajo."""
    pass


class DetalleOrdenResponse(DetalleOrdenBase):
    """Ítem de orden de trabajo retornado por la API."""

    id: int
    precio_unit: Decimal
    subtotal: Decimal

    model_config = {"from_attributes": True}
