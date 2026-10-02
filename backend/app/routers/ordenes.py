"""
Router de Órdenes de Trabajo.
Gestión del ciclo de vida de las órdenes: creación, cambio de estado y consumo real.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import get_current_user, require_roles
from app.database import get_db
from app.schemas.common import RespuestaExito, RespuestaPaginada
from app.schemas.consumo_real import ConsumoRealCreate, ConsumoRealResponse
from app.schemas.orden_trabajo import (
    CambioEstadoOrden,
    OrdenTrabajoCreate,
    OrdenTrabajoResponse,
    OrdenTrabajoUpdate,
)

router = APIRouter(prefix="/ordenes")


@router.get("", response_model=RespuestaPaginada[OrdenTrabajoResponse], summary="Listar órdenes")
async def listar_ordenes(
    pagina: int = 1,
    por_pagina: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Retorna la lista paginada de órdenes de trabajo."""
    # TODO: implementar llamada a orden_service.listar(db, pagina, por_pagina)
    pass


@router.post("", response_model=OrdenTrabajoResponse, status_code=201, summary="Crear orden")
async def crear_orden(
    datos: OrdenTrabajoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Crea una nueva orden de trabajo en estado PENDIENTE."""
    # TODO: implementar llamada a orden_service.crear(db, datos, current_user)
    pass


@router.get("/{orden_id}", response_model=OrdenTrabajoResponse, summary="Obtener orden")
async def obtener_orden(
    orden_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Retorna los datos completos de una orden de trabajo."""
    # TODO: implementar llamada a orden_service.obtener(db, orden_id)
    pass


@router.patch(
    "/{orden_id}/estado",
    response_model=OrdenTrabajoResponse,
    summary="Cambiar estado de orden",
)
async def cambiar_estado(
    orden_id: int,
    datos: CambioEstadoOrden,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Avanza el estado de una orden siguiendo el flujo:
    PENDIENTE → EN_PROCESO → COMPLETADA | CANCELADA
    """
    # TODO: implementar llamada a orden_service.cambiar_estado(db, orden_id, datos, current_user)
    pass


@router.post(
    "/{orden_id}/consumos",
    response_model=ConsumoRealResponse,
    status_code=201,
    summary="Registrar consumo de insumo",
)
async def registrar_consumo(
    orden_id: int,
    datos: ConsumoRealCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("TALLER", "ADMIN", "SUPERADMIN")),
):
    """
    Registra el consumo real de un insumo durante la ejecución de una orden.
    Descuenta automáticamente el stock del insumo.
    """
    # TODO: implementar llamada a orden_service.registrar_consumo(db, orden_id, datos, current_user)
    pass
