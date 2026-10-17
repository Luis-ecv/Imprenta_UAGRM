"""
Router de Órdenes de Compra (CU12).
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.permissions import get_current_user, require_roles
from app.core.roles import RolEnum
from app.database import get_db
from app.schemas.common import RespuestaPaginada
from app.schemas.orden_compra import OrdenCompraCreate, OrdenCompraResponse, OrdenCompraUpdate
from app.services import compra_service

router = APIRouter(prefix="/compras")


@router.get("", response_model=RespuestaPaginada[OrdenCompraResponse], summary="Listar órdenes de compra")
async def listar_compras(
    pagina: int = 1,
    por_pagina: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.ADMIN, RolEnum.SUPERADMIN)),
):
    return await compra_service.listar(db, pagina, por_pagina)


@router.post("", response_model=OrdenCompraResponse, status_code=201, summary="Crear orden de compra")
async def crear_compra(
    datos: OrdenCompraCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.ADMIN, RolEnum.SUPERADMIN)),
):
    usuario_id = current_user.get("id_usuario", 1)
    return await compra_service.crear(db, datos, usuario_id)


@router.get("/{compra_id}", response_model=OrdenCompraResponse, summary="Obtener orden de compra")
async def obtener_compra(
    compra_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.ADMIN, RolEnum.SUPERADMIN)),
):
    return await compra_service.obtener(db, compra_id)


@router.patch("/{compra_id}", response_model=OrdenCompraResponse, summary="Actualizar orden de compra")
async def actualizar_compra(
    compra_id: int,
    datos: OrdenCompraUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.ADMIN, RolEnum.SUPERADMIN)),
):
    usuario_id = current_user.get("id_usuario", 1)
    return await compra_service.actualizar(db, compra_id, datos, usuario_id)
