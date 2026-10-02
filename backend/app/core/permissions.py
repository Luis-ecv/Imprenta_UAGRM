"""
Control de acceso basado en roles (RBAC).
Define dependencias de FastAPI para proteger endpoints por rol o combinación de roles.
"""
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.exceptions import AccesoDenegado, TokenInvalido
from app.core.security import decode_access_token

# Esquema de autenticación Bearer para el header Authorization
security = HTTPBearer()

# =============================================================================
# Roles disponibles en el sistema
# =============================================================================
ROLES = {
    "SUPERADMIN": "Superadministrador",
    "ADMIN": "Administrador",
    "MOSTRADOR": "Operador Mostrador",
    "TALLER": "Operador Taller",
}


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Dependencia base de autenticación.
    Extrae el token JWT del header 'Authorization: Bearer <token>',
    lo decodifica y retorna el payload con los datos del usuario.

    Lanza TokenInvalido si el token es inválido o está expirado.

    Uso:
        current_user: dict = Depends(get_current_user)
    """
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise TokenInvalido()
    return payload


def require_roles(*roles: str):
    """
    Fábrica de dependencias para control de acceso por rol.
    Retorna una dependencia de FastAPI que verifica que el usuario
    autenticado tenga uno de los roles indicados.

    Lanza AccesoDenegado (HTTP 403) si el rol del usuario no coincide.

    Uso:
        @router.get("/admin")
        async def endpoint_admin(
            current_user: dict = Depends(require_roles("ADMIN", "SUPERADMIN"))
        ):
            ...
    """
    async def role_checker(
        current_user: dict = Depends(get_current_user),
    ) -> dict:
        if current_user.get("rol") not in roles:
            raise AccesoDenegado(
                f"Acción restringida. Roles requeridos: {', '.join(roles)}."
            )
        return current_user

    return role_checker
