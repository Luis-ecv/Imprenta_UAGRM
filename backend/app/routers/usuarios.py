"""
Router de Usuarios y Roles.
CRUD de usuarios del sistema y gestión de roles (RBAC).
Acceso restringido a ADMIN y SUPERADMIN.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_roles
from app.database import get_db
from app.schemas.common import RespuestaExito, RespuestaPaginada
from app.schemas.usuario import UsuarioCreate, UsuarioResponse, UsuarioUpdate

router = APIRouter(prefix="/usuarios")


@router.get("", response_model=RespuestaPaginada[UsuarioResponse], summary="Listar usuarios")
async def listar_usuarios(
    pagina: int = 1,
    por_pagina: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("ADMIN", "SUPERADMIN")),
):
    """Retorna la lista paginada de usuarios del sistema."""
    # TODO: implementar llamada a usuario_service.listar(db, pagina, por_pagina)
    pass


@router.post("", response_model=UsuarioResponse, status_code=201, summary="Crear usuario")
async def crear_usuario(
    datos: UsuarioCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("ADMIN", "SUPERADMIN")),
):
    """Crea un nuevo usuario del sistema con el rol indicado."""
    # TODO: implementar llamada a usuario_service.crear(db, datos)
    pass


@router.get("/{usuario_id}", response_model=UsuarioResponse, summary="Obtener usuario")
async def obtener_usuario(
    usuario_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("ADMIN", "SUPERADMIN")),
):
    """Retorna los datos de un usuario específico por su ID."""
    # TODO: implementar llamada a usuario_service.obtener(db, usuario_id)
    pass


@router.put("/{usuario_id}", response_model=UsuarioResponse, summary="Actualizar usuario")
async def actualizar_usuario(
    usuario_id: int,
    datos: UsuarioUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("ADMIN", "SUPERADMIN")),
):
    """Actualiza los datos de un usuario existente."""
    # TODO: implementar llamada a usuario_service.actualizar(db, usuario_id, datos)
    pass


@router.delete("/{usuario_id}", response_model=RespuestaExito, summary="Desactivar usuario")
async def desactivar_usuario(
    usuario_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("SUPERADMIN")),
):
    """Desactiva (baja lógica) un usuario del sistema."""
    # TODO: implementar llamada a usuario_service.desactivar(db, usuario_id)
    pass
