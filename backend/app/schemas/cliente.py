"""
Schemas Pydantic para el módulo de Clientes y Solicitantes.
"""
from typing import Optional

from pydantic import BaseModel, EmailStr


class ClienteBase(BaseModel):
    nombre: str
    unidad_academica: Optional[str] = None
    nit: Optional[str] = None
    telefono: Optional[str] = None
    correo: Optional[EmailStr] = None
    direccion: Optional[str] = None


class ClienteCreate(ClienteBase):
    """Datos para registrar un nuevo cliente institucional."""
    pass


class ClienteUpdate(BaseModel):
    """Campos actualizables de un cliente."""

    nombre: Optional[str] = None
    unidad_academica: Optional[str] = None
    nit: Optional[str] = None
    telefono: Optional[str] = None
    correo: Optional[EmailStr] = None
    direccion: Optional[str] = None
    activo: Optional[bool] = None


class ClienteResponse(ClienteBase):
    """Datos de un cliente retornado por la API."""

    id: int
    activo: bool

    model_config = {"from_attributes": True}
