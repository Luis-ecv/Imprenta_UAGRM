"""
Schemas Pydantic para Tarifas de taller y servicios.
"""
from datetime import date
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict


class TarifaBase(BaseModel):
    concepto: str
    precio_unitario: Decimal
    tipo_tarifa: str
    vigencia_hasta: date


class TarifaCreate(TarifaBase):
    pass


class TarifaUpdate(BaseModel):
    concepto: Optional[str] = None
    precio_unitario: Optional[Decimal] = None
    tipo_tarifa: Optional[str] = None
    vigencia_hasta: Optional[date] = None


class TarifaResponse(TarifaBase):
    id_tarifa: int

    model_config = ConfigDict(from_attributes=True)
