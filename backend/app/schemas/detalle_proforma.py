"""
Schemas Pydantic para los detalles (ítems) de una proforma.
"""
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class DetalleProformaBase(BaseModel):
    tarifa_id: int
    cantidad: Decimal = Field(gt=0)
    descripcion: Optional[str] = None


class DetalleProformaCreate(DetalleProformaBase):
    """Datos para agregar un ítem a una proforma."""
    pass


class DetalleProformaResponse(DetalleProformaBase):
    """Ítem de proforma retornado por la API."""

    id: int
    precio_unit: Decimal
    subtotal: Decimal

    model_config = {"from_attributes": True}
