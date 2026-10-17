"""
Schemas Pydantic para el módulo de Clientes y Facultades.
"""
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict


class ClienteBase(BaseModel):
    tipo_cliente: str
    razon_social: str
    telefono: Optional[str] = None
    email: Optional[EmailStr] = None
    direccion: Optional[str] = None
    codigo_facultad: Optional[str] = None
    dependencia: Optional[str] = None
    ci_nit: Optional[str] = None


class ClienteCreate(ClienteBase):
    pass


class ClienteUpdate(BaseModel):
    tipo_cliente: Optional[str] = None
    razon_social: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[EmailStr] = None
    direccion: Optional[str] = None
    codigo_facultad: Optional[str] = None
    dependencia: Optional[str] = None
    ci_nit: Optional[str] = None


class ClienteResponse(ClienteBase):
    id_cliente: int

    model_config = ConfigDict(from_attributes=True)
