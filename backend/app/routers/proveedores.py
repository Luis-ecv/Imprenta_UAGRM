"""
Router de Proveedores.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.permissions import get_current_user, require_roles
from app.core.roles import RolEnum
from app.database import get_db
from app.schemas.common import RespuestaPaginada
from app.schemas.proveedor import ProveedorCreate, ProveedorResponse, ProveedorUpdate
from app.services import proveedor_service

router = APIRouter(prefix="/proveedores")


@router.get("", response_model=RespuestaPaginada[ProveedorResponse], summary="Listar proveedores")
async def listar_proveedores(
    pagina: int = 1,
    por_pagina: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await proveedor_service.listar(db, pagina, por_pagina)


@router.post("", response_model=ProveedorResponse, status_code=201, summary="Crear proveedor")
async def crear_proveedor(
    datos: ProveedorCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.ADMIN, RolEnum.SUPERADMIN)),
):
    usuario_id = current_user.get("id_usuario", 1)
    return await proveedor_service.crear(db, datos, usuario_id)


@router.get("/{proveedor_id}", response_model=ProveedorResponse, summary="Obtener proveedor")
async def obtener_proveedor(
    proveedor_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await proveedor_service.obtener(db, proveedor_id)


@router.put("/{proveedor_id}", response_model=ProveedorResponse, summary="Actualizar proveedor")
async def actualizar_proveedor(
    proveedor_id: int,
    datos: ProveedorUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.ADMIN, RolEnum.SUPERADMIN)),
):
    usuario_id = current_user.get("id_usuario", 1)
    return await proveedor_service.actualizar(db, proveedor_id, datos, usuario_id)
