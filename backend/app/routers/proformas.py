"""
Router de Proformas de Impresión (CU06, CU07).
"""
from fastapi import APIRouter, Depends, Query
from fastapi.responses import HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import RecursoNoEncontrado
from app.core.permissions import get_current_user, require_roles
from app.core.roles import RolEnum
from app.database import get_db
from app.repositories.proforma_repository import ProformaRepository
from app.schemas.common import RespuestaPaginada
from app.schemas.proforma import ProformaCreate, ProformaResponse
from app.services import pdf_service, proforma_service

router = APIRouter(prefix="/proformas")


@router.get("", response_model=RespuestaPaginada[ProformaResponse], summary="Listar proformas")
async def listar_proformas(
    pagina: int = 1,
    por_pagina: int = 20,
    cliente_id: int | None = Query(default=None, description="Filtrar por cliente"),
    estado: str | None = Query(default=None, description="Filtrar por estado"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await proforma_service.listar(db, pagina, por_pagina, cliente_id, estado)


@router.post("", response_model=ProformaResponse, status_code=201, summary="Emitir proforma")
async def crear_proforma(
    datos: ProformaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.ADMIN, RolEnum.SUPERADMIN, RolEnum.MOSTRADOR)),
):
    usuario_id = current_user.get("id_usuario", 1)
    return await proforma_service.crear(db, usuario_id, datos)


@router.get("/{proforma_id}", response_model=ProformaResponse, summary="Obtener proforma")
async def obtener_proforma(
    proforma_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await proforma_service.obtener(db, proforma_id)


@router.get("/{proforma_id}/imprimir", response_class=HTMLResponse, summary="Generar documento imprimible / PDF")
async def imprimir_proforma(
    proforma_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    repo = ProformaRepository(db)
    proforma = await repo.obtener_con_detalles(proforma_id)
    if not proforma:
        raise RecursoNoEncontrado("Proforma", proforma_id)
    return HTMLResponse(content=pdf_service.generar_html_proforma(proforma))


@router.patch("/{proforma_id}/estado", response_model=ProformaResponse, summary="Cambiar estado proforma")
async def cambiar_estado_proforma(
    proforma_id: int,
    nuevo_estado: str = Query(..., description="Nuevo estado: APROBADA, RECHAZADA, VENCIDA"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.ADMIN, RolEnum.SUPERADMIN, RolEnum.MOSTRADOR)),
):
    usuario_id = current_user.get("id_usuario", 1)
    return await proforma_service.cambiar_estado(db, proforma_id, nuevo_estado, usuario_id)
