"""
Schemas Pydantic para el módulo de Insumos y Categorías.
Incluye schemas para el catálogo de insumos, control de stock y movimientos.
"""
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


# --- Categoría de Insumo ---

class CategoriaInsumoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None


class CategoriaInsumoCreate(CategoriaInsumoBase):
    """Datos para crear una categoría de insumo."""
    pass


class CategoriaInsumoResponse(CategoriaInsumoBase):
    """Categoría de insumo retornada por la API."""

    id: int
    activo: bool

    model_config = {"from_attributes": True}


# --- Insumo ---

class InsumoBase(BaseModel):
    codigo: str
    nombre: str
    descripcion: Optional[str] = None
    unidad_medida: str
    categoria_id: int
    stock_minimo: Decimal = Field(default=Decimal("0"), ge=0)
    stock_maximo: Optional[Decimal] = None
    precio_unitario: Decimal = Field(default=Decimal("0"), ge=0)


class InsumoCreate(InsumoBase):
    """Datos para registrar un nuevo insumo."""

    stock_actual: Decimal = Field(default=Decimal("0"), ge=0)


class InsumoUpdate(BaseModel):
    """Campos actualizables de un insumo."""

    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    unidad_medida: Optional[str] = None
    categoria_id: Optional[int] = None
    stock_minimo: Optional[Decimal] = None
    stock_maximo: Optional[Decimal] = None
    precio_unitario: Optional[Decimal] = None
    activo: Optional[bool] = None


class InsumoResponse(InsumoBase):
    """Datos completos de un insumo retornado por la API."""

    id: int
    stock_actual: Decimal
    activo: bool
    categoria: CategoriaInsumoResponse

    model_config = {"from_attributes": True}


# --- Movimiento de Inventario ---

class MovimientoInventarioCreate(BaseModel):
    """Datos para registrar un movimiento de inventario (entrada, salida, ajuste)."""

    insumo_id: int
    tipo_movim: str  # ENTRADA | SALIDA | AJUSTE
    cantidad: Decimal = Field(gt=0)
    motivo: Optional[str] = None


class MovimientoInventarioResponse(MovimientoInventarioCreate):
    """Movimiento de inventario retornado por la API."""

    id: int
    stock_anterior: Decimal
    stock_nuevo: Decimal

    model_config = {"from_attributes": True}
