"""
Schemas Pydantic para Proveedores.
"""
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict


class ProveedorBase(BaseModel):
    razon_social: str
    nit: str
    contacto: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[EmailStr] = None
    direccion: Optional[str] = None


class ProveedorCreate(ProveedorBase):
    pass


class ProveedorUpdate(BaseModel):
    razon_social: Optional[str] = None
    nit: Optional[str] = None
    contacto: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[EmailStr] = None
    direccion: Optional[str] = None


class ProveedorResponse(ProveedorBase):
    id_proveedor: int

    model_config = ConfigDict(from_attributes=True)
