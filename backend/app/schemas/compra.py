"""
Schemas Pydantic para el módulo de Compras de insumos.
Incluye la orden de compra y sus ítems de detalle.
"""
from datetime import date
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field


# --- Detalle de Compra ---

class DetalleCompraBase(BaseModel):
    insumo_id: int
    cantidad_pedida: Decimal = Field(gt=0)
    precio_unitario: Decimal = Field(gt=0)


class DetalleCompraCreate(DetalleCompraBase):
    """Ítem individual dentro de una orden de compra."""
    pass


class DetalleCompraResponse(DetalleCompraBase):
    """Ítem de compra retornado por la API."""

    id: int
    subtotal: Decimal

    model_config = {"from_attributes": True}


# --- Orden de Compra ---

class CompraBase(BaseModel):
    proveedor_id: int
    observaciones: Optional[str] = None


class CompraCreate(CompraBase):
    """Datos para crear una orden de compra con sus ítems."""

    detalles: List[DetalleCompraCreate]


class CompraUpdate(BaseModel):
    """Campos actualizables de una compra (estado, fecha de recepción)."""

    estado: Optional[str] = None
    fecha_recepcion: Optional[date] = None
    observaciones: Optional[str] = None


class CompraResponse(CompraBase):
    """Orden de compra completa retornada por la API."""

    id: int
    numero: str
    estado: str
    total: Decimal
    fecha_emision: date
    fecha_recepcion: Optional[date] = None
    detalles: List[DetalleCompraResponse] = []

    model_config = {"from_attributes": True}
