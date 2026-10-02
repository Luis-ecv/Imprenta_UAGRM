"""
Router de Proformas de impresión.
Gestión de proformas, sus ítems de detalle y cambio de estado.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import get_current_user, require_roles
from app.database import get_db
from app.schemas.common import RespuestaExito, RespuestaPaginada
from app.schemas.detalle_proforma import DetalleProformaCreate, DetalleProformaResponse
from app.schemas.proforma import ProformaCreate, ProformaResponse, ProformaUpdate

router = APIRouter(prefix="/proformas")


@router.get("", response_model=RespuestaPaginada[ProformaResponse], summary="Listar proformas")
async def listar_proformas(
    pagina: int = 1,
    por_pagina: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Retorna la lista paginada de proformas."""
    # TODO: implementar llamada a proforma_service.listar(db, pagina, por_pagina)
    pass


@router.post("", response_model=ProformaResponse, status_code=201, summary="Crear proforma")
async def crear_proforma(
    datos: ProformaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Crea una nueva proforma en estado BORRADOR."""
    # TODO: implementar llamada a proforma_service.crear(db, datos, current_user)
    pass


@router.get("/{proforma_id}", response_model=ProformaResponse, summary="Obtener proforma")
async def obtener_proforma(
    proforma_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Retorna los datos completos de una proforma, incluidos sus ítems."""
    # TODO: implementar llamada a proforma_service.obtener(db, proforma_id)
    pass


@router.put("/{proforma_id}", response_model=ProformaResponse, summary="Actualizar proforma")
async def actualizar_proforma(
    proforma_id: int,
    datos: ProformaUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Actualiza una proforma. Solo es posible si está en estado BORRADOR."""
    # TODO: implementar llamada a proforma_service.actualizar(db, proforma_id, datos)
    pass


@router.post(
    "/{proforma_id}/detalles",
    response_model=DetalleProformaResponse,
    status_code=201,
    summary="Agregar ítem a proforma",
)
async def agregar_detalle(
    proforma_id: int,
    datos: DetalleProformaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Agrega un ítem de servicio a una proforma existente."""
    # TODO: implementar llamada a proforma_service.agregar_detalle(db, proforma_id, datos)
    pass


@router.delete(
    "/{proforma_id}/detalles/{detalle_id}",
    response_model=RespuestaExito,
    summary="Eliminar ítem de proforma",
)
async def eliminar_detalle(
    proforma_id: int,
    detalle_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Elimina un ítem de una proforma en estado BORRADOR."""
    # TODO: implementar llamada a proforma_service.eliminar_detalle(db, proforma_id, detalle_id)
    pass
