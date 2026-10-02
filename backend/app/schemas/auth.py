"""
Schemas de autenticación: login, tokens y datos del usuario autenticado.
"""
from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    """Datos requeridos para iniciar sesión."""

    nombre_usuario: str
    contrasena: str


class TokenResponse(BaseModel):
    """Respuesta del endpoint de login con el token JWT."""

    access_token: str
    token_type: str = "bearer"
    expira_en: int  # minutos hasta expiración


class UsuarioAutenticado(BaseModel):
    """Datos del usuario contenidos en el payload del JWT."""

    id: int
    nombre_usuario: str
    correo: str
    nombre_completo: str
    rol: str
