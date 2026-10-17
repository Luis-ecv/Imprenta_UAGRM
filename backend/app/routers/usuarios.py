"""
Router de Usuarios y Roles.
CRUD de usuarios del sistema y gestión de roles (RBAC).
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.permissions import require_roles
from app.core.roles import RolEnum
from app.database import get_db
from app.schemas.common import MensajeRespuesta, RespuestaPaginada
from app.schemas.usuario import UsuarioCreate, UsuarioResponse, UsuarioUpdate
from app.services import usuario_service

router = APIRouter(prefix="/usuarios")


@router.get("", response_model=RespuestaPaginada[UsuarioResponse], summary="Listar usuarios")
async def listar_usuarios(
    pagina: int = 1,
    por_pagina: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.ADMIN, RolEnum.SUPERADMIN)),
):
    return await usuario_service.listar(db, pagina, por_pagina)


@router.post("", response_model=UsuarioResponse, status_code=201, summary="Crear usuario")
async def crear_usuario(
    datos: UsuarioCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.SUPERADMIN)),
):
    return await usuario_service.crear(db, datos)


@router.get("/{id_usuario}", response_model=UsuarioResponse, summary="Obtener usuario")
async def obtener_usuario(
    id_usuario: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.ADMIN, RolEnum.SUPERADMIN)),
):
    return await usuario_service.obtener(db, id_usuario)


@router.put("/{id_usuario}", response_model=UsuarioResponse, summary="Actualizar usuario")
async def actualizar_usuario(
    id_usuario: int,
    datos: UsuarioUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.SUPERADMIN, RolEnum.ADMIN)),
):
    return await usuario_service.actualizar(db, id_usuario, datos)


@router.delete("/{id_usuario}", response_model=MensajeRespuesta, summary="Desactivar usuario")
async def desactivar_usuario(
    id_usuario: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.SUPERADMIN)),
):
    res = await usuario_service.desactivar(db, id_usuario)
    return MensajeRespuesta(mensaje=res["mensaje"])
