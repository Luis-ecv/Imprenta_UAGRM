"""
Schemas Pydantic para el módulo de Solicitantes.
Un solicitante es la persona física que realiza el pedido en nombre del cliente.
"""
from typing import Optional

from pydantic import BaseModel, EmailStr


class SolicitanteBase(BaseModel):
    nombre_completo: str
    cargo: Optional[str] = None
    telefono: Optional[str] = None
    correo: Optional[EmailStr] = None
    cliente_id: int


class SolicitanteCreate(SolicitanteBase):
    """Datos para registrar un nuevo solicitante."""
    pass


class SolicitanteUpdate(BaseModel):
    """Campos actualizables de un solicitante."""

    nombre_completo: Optional[str] = None
    cargo: Optional[str] = None
    telefono: Optional[str] = None
    correo: Optional[EmailStr] = None
    activo: Optional[bool] = None


class SolicitanteResponse(SolicitanteBase):
    """Datos de un solicitante retornado por la API."""

    id: int
    activo: bool

    model_config = {"from_attributes": True}
