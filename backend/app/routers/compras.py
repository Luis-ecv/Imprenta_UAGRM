"""
Router de Compras.
Gestión de órdenes de compra de insumos y su proceso de recepción.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import get_current_user, require_roles
from app.database import get_db
from app.schemas.common import RespuestaPaginada
from app.schemas.compra import CompraCreate, CompraResponse, CompraUpdate

router = APIRouter(prefix="/compras")


@router.get("", response_model=RespuestaPaginada[CompraResponse], summary="Listar compras")
async def listar_compras(
    pagina: int = 1,
    por_pagina: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Retorna la lista paginada de órdenes de compra."""
    # TODO: implementar llamada a compra_service.listar(db, pagina, por_pagina)
    pass


@router.post("", response_model=CompraResponse, status_code=201, summary="Crear orden de compra")
async def crear_compra(
    datos: CompraCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("ADMIN", "SUPERADMIN", "COMPRAS")),
):
    """Crea una nueva orden de compra con sus ítems de detalle."""
    # TODO: implementar llamada a compra_service.crear(db, datos, current_user)
    pass


@router.get("/{compra_id}", response_model=CompraResponse, summary="Obtener compra")
async def obtener_compra(
    compra_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Retorna los datos completos de una orden de compra."""
    # TODO: implementar llamada a compra_service.obtener(db, compra_id)
    pass


@router.patch("/{compra_id}", response_model=CompraResponse, summary="Actualizar estado de compra")
async def actualizar_compra(
    compra_id: int,
    datos: CompraUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("ADMIN", "SUPERADMIN", "COMPRAS")),
):
    """
    Actualiza el estado de una compra. Al recibir (estado=RECIBIDA),
    actualiza automáticamente el stock de los insumos comprados.
    """
    # TODO: implementar llamada a compra_service.actualizar(db, compra_id, datos, current_user)
    pass
