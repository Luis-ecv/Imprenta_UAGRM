"""
Router de Autenticación.
Endpoints públicos para login y refresh de token JWT.
No requieren autenticación previa.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.auth import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth")


@router.post("/login", response_model=TokenResponse, summary="Iniciar sesión")
async def login(
    datos: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Autentica al usuario con nombre de usuario y contraseña.
    Retorna un token JWT válido por ACCESS_TOKEN_EXPIRE_MINUTES minutos.
    """
    # TODO: implementar llamada a auth_service.autenticar(db, datos)
    pass
