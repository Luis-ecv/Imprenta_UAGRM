"""
Schemas Pydantic para el módulo de Proveedores.
"""
from typing import Optional

from pydantic import BaseModel, EmailStr


class ProveedorBase(BaseModel):
    nombre: str
    nit: Optional[str] = None
    telefono: Optional[str] = None
    correo: Optional[EmailStr] = None
    direccion: Optional[str] = None


class ProveedorCreate(ProveedorBase):
    """Datos para registrar un nuevo proveedor."""
    pass


class ProveedorUpdate(BaseModel):
    """Campos actualizables de un proveedor."""

    nombre: Optional[str] = None
    nit: Optional[str] = None
    telefono: Optional[str] = None
    correo: Optional[EmailStr] = None
    direccion: Optional[str] = None
    activo: Optional[bool] = None


class ProveedorResponse(ProveedorBase):
    """Datos de un proveedor retornado por la API."""

    id: int
    activo: bool

    model_config = {"from_attributes": True}
