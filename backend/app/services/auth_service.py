"""
Servicio de Autenticación.
Lógica de negocio para login y generación de tokens JWT.
No conoce HTTP — lanza excepciones del dominio definidas en core/exceptions.py.
"""
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import CredencialesInvalidas
from app.core.security import create_access_token, verify_password
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.auth import LoginRequest, TokenResponse


async def autenticar(db: AsyncSession, datos: LoginRequest) -> TokenResponse:
    """
    Verifica las credenciales del usuario y genera un token JWT.

    Args:
        db: Sesión de base de datos.
        datos: Nombre de usuario y contraseña en texto plano.

    Returns:
        TokenResponse con el token JWT y su tiempo de expiración.

    Raises:
        CredencialesInvalidas: Si el usuario no existe o la contraseña no coincide.
    """
    # TODO: implementar
    # 1. Buscar usuario por nombre_usuario usando UsuarioRepository
    # 2. Verificar que esté activo
    # 3. Verificar contraseña con verify_password
    # 4. Construir payload JWT con {sub, rol, id}
    # 5. Retornar TokenResponse con create_access_token
    pass
