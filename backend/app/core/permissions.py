"""
Control de acceso basado en roles (RBAC).
Define dependencias de FastAPI para proteger endpoints por rol o combinación de roles.
"""
from typing import Union
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.exceptions import AccesoDenegado, TokenInvalido
from app.core.roles import RolEnum, normalizar_rol
from app.core.security import decode_access_token

# Esquema de autenticación Bearer para el header Authorization
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Dependencia base de autenticación.
    Extrae el token JWT del header 'Authorization: Bearer <token>',
    lo decodifica y retorna el payload con los datos del usuario.

    Lanza TokenInvalido si el token es inválido o está expirado.
    """
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise TokenInvalido()
    return payload


def require_roles(*roles: Union[str, RolEnum]):
    """
    Fábrica de dependencias para control de acceso por rol.
    Verifica que el usuario autenticado tenga uno de los roles autorizados.
    Acepta tanto instancias de RolEnum como strings (incluidos alias como 'ADMIN' o 'SUPERADMIN').
    """
    roles_normalizados = {normalizar_rol(r) for r in roles}

    async def role_checker(
        current_user: dict = Depends(get_current_user),
    ) -> dict:
        user_rol = normalizar_rol(current_user.get("rol", ""))
        if user_rol not in roles_normalizados:
            raise AccesoDenegado(
                f"Acción restringida. Roles requeridos: {', '.join(sorted(roles_normalizados))}."
            )
        return current_user

    return role_checker
