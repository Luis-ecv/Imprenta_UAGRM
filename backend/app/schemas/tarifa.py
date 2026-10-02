"""
Schemas Pydantic para el módulo de Tarifas de servicios de impresión.
"""
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class TarifaBase(BaseModel):
    nombre_servicio: str
    descripcion: Optional[str] = None
    precio_unitario: Decimal = Field(gt=0)
    unidad: str  # ej: "hoja A4", "copia", "documento"


class TarifaCreate(TarifaBase):
    """Datos para registrar una nueva tarifa de servicio."""
    pass


class TarifaUpdate(BaseModel):
    """Campos actualizables de una tarifa."""

    nombre_servicio: Optional[str] = None
    descripcion: Optional[str] = None
    precio_unitario: Optional[Decimal] = None
    unidad: Optional[str] = None
    activo: Optional[bool] = None


class TarifaResponse(TarifaBase):
    """Tarifa de servicio retornada por la API."""

    id: int
    activo: bool

    model_config = {"from_attributes": True}
