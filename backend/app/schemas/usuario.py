"""
Schemas Pydantic para el módulo de Usuarios y Roles.
"""
from typing import Optional

from pydantic import BaseModel, EmailStr


# --- Rol ---

class RolBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None


class RolCreate(RolBase):
    """Datos para crear un rol."""
    pass


class RolResponse(RolBase):
    """Datos de un rol retornado por la API."""

    id: int
    activo: bool

    model_config = {"from_attributes": True}


# --- Usuario ---

class UsuarioBase(BaseModel):
    nombre_usuario: str
    correo: EmailStr
    nombre_completo: str
    rol_id: int


class UsuarioCreate(UsuarioBase):
    """Datos para crear un usuario. Incluye contraseña en texto plano."""

    contrasena: str


class UsuarioUpdate(BaseModel):
    """Datos opcionales para actualizar un usuario."""

    nombre_completo: Optional[str] = None
    correo: Optional[EmailStr] = None
    rol_id: Optional[int] = None
    activo: Optional[bool] = None


class UsuarioResponse(UsuarioBase):
    """Datos de un usuario retornado por la API. Nunca incluye la contraseña."""

    id: int
    activo: bool
    rol: RolResponse

    model_config = {"from_attributes": True}
