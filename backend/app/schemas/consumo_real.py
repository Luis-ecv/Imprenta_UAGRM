"""
Schemas Pydantic para Consumo Real y Mermas de Producción.
"""
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict


class ConsumoRealCreate(BaseModel):
    orden_id: int
    insumo_id: int
    cantidad_utilizada: Decimal = Field(gt=0)
    cantidad_merma: Decimal = Field(default=Decimal("0.00"), ge=0)


class ConsumoRealResponse(BaseModel):
    id_consumo: int
    orden_id: int
    insumo_id: int
    cantidad_utilizada: Decimal
    cantidad_merma: Decimal
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
