"""
Schemas Pydantic para Órdenes de Compra.
"""
from datetime import date
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict


class OrdenCompraBase(BaseModel):
    proveedor_id: int
    prediccion_id: Optional[int] = None
    total_estimado: Decimal
    estado: str = "SUGERIDA"


class OrdenCompraCreate(OrdenCompraBase):
    pass


class OrdenCompraUpdate(BaseModel):
    estado: Optional[str] = None
    total_estimado: Optional[Decimal] = None


class OrdenCompraResponse(OrdenCompraBase):
    id_orden_compra: int
    fecha_generacion: date

    model_config = ConfigDict(from_attributes=True)
