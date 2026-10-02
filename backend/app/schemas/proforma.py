"""
Schemas Pydantic para el módulo de Proformas de impresión.
"""
from datetime import date
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field


class ProformaBase(BaseModel):
    cliente_id: int
    descripcion: Optional[str] = None
    fecha_validez: Optional[date] = None
    observaciones: Optional[str] = None


class ProformaCreate(ProformaBase):
    """Datos para crear una nueva proforma."""
    pass


class ProformaUpdate(BaseModel):
    """Campos actualizables de una proforma (solo en estado BORRADOR)."""

    descripcion: Optional[str] = None
    fecha_validez: Optional[date] = None
    observaciones: Optional[str] = None
    estado: Optional[str] = None


class ProformaResponse(ProformaBase):
    """Proforma completa retornada por la API."""

    id: int
    numero: str
    total: Decimal
    estado: str
    fecha_emision: date

    model_config = {"from_attributes": True}
