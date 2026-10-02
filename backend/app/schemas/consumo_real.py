"""
Schemas Pydantic para el registro de consumo real de insumos por orden de trabajo.
"""
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class ConsumoRealBase(BaseModel):
    orden_id: int
    insumo_id: int
    cantidad_usada: Decimal = Field(gt=0)


class ConsumoRealCreate(ConsumoRealBase):
    """Datos para registrar el consumo real de un insumo en una orden."""
    pass


class ConsumoRealResponse(ConsumoRealBase):
    """Registro de consumo retornado por la API."""

    id: int
    costo_unitario: Decimal
    costo_total: Decimal

    model_config = {"from_attributes": True}
