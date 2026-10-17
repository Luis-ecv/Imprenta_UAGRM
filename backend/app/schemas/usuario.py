"""
Schemas Pydantic para el módulo de Usuarios y Roles.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict


class RolResponse(BaseModel):
    id_rol: int
    nombre: str
    descripcion: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class UsuarioBase(BaseModel):
    nombre_completo: str
    email: EmailStr
    rol_id: int
    activo: bool = True


class UsuarioCreate(UsuarioBase):
    password: str


class UsuarioUpdate(BaseModel):
    nombre_completo: Optional[str] = None
    email: Optional[EmailStr] = None
    rol_id: Optional[int] = None
    activo: Optional[bool] = None
    password: Optional[str] = None


class UsuarioResponse(UsuarioBase):
    id_usuario: int
    ultimo_acceso: Optional[datetime] = None
    rol: Optional[RolResponse] = None

    model_config = ConfigDict(from_attributes=True)
