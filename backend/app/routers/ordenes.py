"""
Router de Órdenes de Trabajo (CU08, CU09, CU10).
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.permissions import get_current_user, require_roles
from app.core.roles import RolEnum
from app.database import get_db
from app.schemas.common import RespuestaPaginada
from app.schemas.consumo_real import ConsumoRealCreate, ConsumoRealResponse
from app.schemas.orden_trabajo import CambioEstadoOrden, OrdenTrabajoCreate, OrdenTrabajoResponse
from app.services import orden_service

router = APIRouter(prefix="/ordenes")


@router.get("", response_model=RespuestaPaginada[OrdenTrabajoResponse], summary="Listar órdenes de trabajo")
async def listar_ordenes(
    pagina: int = 1,
    por_pagina: int = 20,
    estado: str | None = Query(default=None, description="Filtrar por estado actual"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await orden_service.listar(db, pagina, por_pagina, estado)


@router.post("", response_model=OrdenTrabajoResponse, status_code=201, summary="Generar orden de trabajo")
async def crear_orden(
    datos: OrdenTrabajoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.ADMIN, RolEnum.SUPERADMIN, RolEnum.MOSTRADOR)),
):
    usuario_id = current_user.get("id_usuario", 1)
    return await orden_service.crear_desde_proforma(db, usuario_id, datos)


@router.get("/{orden_id}", response_model=OrdenTrabajoResponse, summary="Obtener orden de trabajo")
async def obtener_orden(
    orden_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await orden_service.obtener(db, orden_id)


@router.patch("/{orden_id}/estado", response_model=OrdenTrabajoResponse, summary="Avanzar estado de producción")
async def cambiar_estado(
    orden_id: int,
    datos: CambioEstadoOrden,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.ADMIN, RolEnum.SUPERADMIN, RolEnum.TALLER)),
):
    usuario_id = current_user.get("id_usuario", 1)
    return await orden_service.cambiar_estado(db, usuario_id, orden_id, datos)


@router.post("/{orden_id}/consumos", response_model=ConsumoRealResponse, status_code=201, summary="Registrar consumo real y mermas")
async def registrar_consumo(
    orden_id: int,
    datos: ConsumoRealCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.ADMIN, RolEnum.SUPERADMIN, RolEnum.TALLER)),
):
    usuario_id = current_user.get("id_usuario", 1)
    datos.orden_id = orden_id
    return await orden_service.registrar_consumo_real(db, usuario_id, datos)
