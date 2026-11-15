"""
Schemas Pydantic para el módulo de Usuarios y Roles.
"""
import re
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

PASSWORD_REGEX = r"^[A-Za-z0-9áéíóúÁÉÍÓÚñÑ@$!%*?&_#.\-+]+$"
PASSWORD_ERROR_MSG = (
    "La contraseña solo puede contener letras (incluyendo ñ/Ñ y acentos), "
    "números y los caracteres especiales permitidos: @ $ ! % * ? & _ # . - +"
)


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
    password: str = Field(
        ...,
        min_length=8,
        max_length=25,
        description="Contraseña de 8 a 25 caracteres, admite letras con ñ/Ñ, números y símbolos permitidos",
    )

    @field_validator("password")
    @classmethod
    def validar_password(cls, v: str) -> str:
        if not re.match(PASSWORD_REGEX, v):
            raise ValueError(PASSWORD_ERROR_MSG)
        return v


class UsuarioUpdate(BaseModel):
    nombre_completo: Optional[str] = None
    email: Optional[EmailStr] = None
    rol_id: Optional[int] = None
    activo: Optional[bool] = None
    password: Optional[str] = Field(
        default=None,
        min_length=8,
        max_length=25,
        description="Nueva contraseña (opcional) de 8 a 25 caracteres",
    )

    @field_validator("password")
    @classmethod
    def validar_password_update(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if not re.match(PASSWORD_REGEX, v):
                raise ValueError(PASSWORD_ERROR_MSG)
        return v


class UsuarioResponse(UsuarioBase):
    id_usuario: int
    ultimo_acceso: Optional[datetime] = None
    rol: Optional[RolResponse] = None

    model_config = ConfigDict(from_attributes=True)
