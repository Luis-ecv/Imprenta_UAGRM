"""
Utilidades de seguridad: hashing de contraseñas y manejo de tokens JWT.
Toda la criptografía del sistema pasa por este módulo.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings

# =============================================================================
# Contexto de hashing con bcrypt
# =============================================================================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Genera el hash bcrypt de una contraseña en texto plano."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si una contraseña en texto plano coincide con su hash bcrypt."""
    return pwd_context.verify(plain_password, hashed_password)


# =============================================================================
# Manejo de tokens JWT
# =============================================================================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Genera un token JWT firmado con los datos del usuario.

    El payload incluye:
      - sub: identificador del usuario (correo o nombre de usuario)
      - rol: nombre del rol asignado
      - exp: timestamp de expiración

    Args:
        data: Diccionario con los datos a codificar en el token.
        expires_delta: Tiempo de vida del token. Si no se indica,
                       usa ACCESS_TOKEN_EXPIRE_MINUTES de la configuración.

    Returns:
        Token JWT firmado como string.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """
    Decodifica y verifica un token JWT.

    Args:
        token: Token JWT como string.

    Returns:
        Payload del token si es válido y no ha expirado.
        None si el token es inválido o expiró.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None
