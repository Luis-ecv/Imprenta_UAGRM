"""
Servicio de Autenticación.
Lógica de negocio para login y generación de tokens JWT.
"""
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.core.exceptions import CredencialesInvalidas
from app.core.security import create_access_token, verify_password
from app.models.usuario import Usuario
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.auth import LoginRequest, TokenResponse


async def autenticar(db: AsyncSession, datos: LoginRequest) -> TokenResponse:
    repo = UsuarioRepository(db)
    usuario = await repo.obtener_por_email(datos.email)
    if not usuario or not usuario.activo:
        raise CredencialesInvalidas()

    if not verify_password(datos.password, usuario.password_hash):
        raise CredencialesInvalidas()

    # Actualizar timestamp de último acceso
    usuario.ultimo_acceso = datetime.now(timezone.utc)
    await db.flush()

    # Payload para el JWT
    payload = {
        "sub": usuario.email,
        "id_usuario": usuario.id_usuario,
        "rol": usuario.rol.nombre if usuario.rol else "Cliente",
        "nombre_completo": usuario.nombre_completo,
    }

    token = create_access_token(payload)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expira_en_minutos=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
    )
