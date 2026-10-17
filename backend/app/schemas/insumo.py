"""
Schemas Pydantic para Insumos, Alertas de Stock y Movimientos de Inventario.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.categoria_insumo import (
    CategoriaInsumoBase,
    CategoriaInsumoCreate,
    CategoriaInsumoResponse,
    CategoriaInsumoUpdate,
)


class InsumoBase(BaseModel):
    categoria_id: int
    codigo: str
    descripcion: str
    stock_actual: Decimal = Field(default=Decimal("0.00"), ge=0)
    stock_minimo: Decimal = Field(default=Decimal("0.00"), ge=0)
    costo_reposicion: Decimal = Field(default=Decimal("0.00"), ge=0)
    unidad_medida: str


class InsumoCreate(InsumoBase):
    pass


class InsumoUpdate(BaseModel):
    categoria_id: Optional[int] = None
    codigo: Optional[str] = None
    descripcion: Optional[str] = None
    stock_minimo: Optional[Decimal] = None
    costo_reposicion: Optional[Decimal] = None
    unidad_medida: Optional[str] = None


class InsumoResponse(InsumoBase):
    id_insumo: int
    alerta_stock: bool = False
    categoria: Optional[CategoriaInsumoResponse] = None

    model_config = ConfigDict(from_attributes=True)


class MovimientoInventarioCreate(BaseModel):
    insumo_id: int
    tipo_movimiento: str  # INGRESO_COMPRA | DEDUCCION_ORDEN | AJUSTE | MERMA
    cantidad: Decimal = Field(gt=0)
    referencia: Optional[str] = None


class MovimientoInventarioResponse(BaseModel):
    id_movimiento: int
    insumo_id: int
    usuario_id: int
    tipo_movimiento: str
    cantidad: Decimal
    saldo_resultante: Decimal
    referencia: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
