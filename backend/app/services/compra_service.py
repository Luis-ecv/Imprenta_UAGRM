"""
Servicio de Compras.
Lógica de negocio para la gestión de órdenes de compra.
Al recibir una compra (estado=RECIBIDA), actualiza el stock de los insumos.
"""
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import OperacionNoPermitida, RecursoNoEncontrado
from app.repositories.compra_repository import CompraRepository
from app.schemas.common import RespuestaPaginada
from app.schemas.compra import CompraCreate, CompraResponse, CompraUpdate


async def listar(
    db: AsyncSession, pagina: int, por_pagina: int
) -> RespuestaPaginada[CompraResponse]:
    """Retorna la lista paginada de órdenes de compra."""
    # TODO: implementar usando CompraRepository.listar_paginado
    pass


async def crear(
    db: AsyncSession, datos: CompraCreate, usuario_id: int
) -> CompraResponse:
    """
    Crea una nueva orden de compra con sus ítems de detalle.
    Genera el número correlativo (OC-YYYY-NNNN) y calcula el total.
    """
    # TODO: implementar usando CompraRepository.crear
    pass


async def obtener(db: AsyncSession, compra_id: int) -> CompraResponse:
    """Retorna una compra con sus detalles. Lanza RecursoNoEncontrado si no existe."""
    # TODO: implementar usando CompraRepository.obtener_con_detalles
    pass


async def actualizar(
    db: AsyncSession, compra_id: int, datos: CompraUpdate, usuario_id: int
) -> CompraResponse:
    """
    Actualiza el estado de una compra.
    Si el nuevo estado es RECIBIDA:
      - Registra movimientos de inventario ENTRADA por cada ítem.
      - Actualiza el stock_actual de cada insumo.
      - Registra en bitácora.
    """
    # TODO: implementar
    pass
