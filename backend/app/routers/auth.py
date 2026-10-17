"""
Router de Autenticación.
Endpoints públicos para login y perfil.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.auth import LoginRequest, TokenResponse, UsuarioAutenticado
from app.services import auth_service
from app.core.permissions import get_current_user

router = APIRouter(prefix="/auth")


@router.post("/login", response_model=TokenResponse, summary="Iniciar sesión")
async def login(
    datos: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Autentica al usuario con email y contraseña. Retorna un JWT válido."""
    return await auth_service.autenticar(db, datos)


@router.get("/me", response_model=UsuarioAutenticado, summary="Obtener usuario autenticado")
async def obtener_perfil_actual(
    current_user: dict = Depends(get_current_user),
):
    """Retorna los datos del usuario extraídos del payload del JWT."""
    return UsuarioAutenticado(
        id_usuario=current_user.get("id_usuario", 1),
        email=current_user.get("sub") or current_user.get("email", ""),
        nombre_completo=current_user.get("nombre_completo", ""),
        rol=current_user.get("rol", ""),
    )
