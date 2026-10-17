"""
Schemas de autenticación: login, tokens y datos del usuario autenticado.
"""
from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    """Credenciales para inicio de sesión en mostrador/sistema."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Respuesta del endpoint de autenticación con el token JWT."""
    access_token: str
    token_type: str = "bearer"
    expira_en_minutos: int


class UsuarioAutenticado(BaseModel):
    """Payload decodificado del JWT."""
    id_usuario: int
    email: str
    nombre_completo: str
    rol: str
