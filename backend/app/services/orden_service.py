"""
Servicio de Órdenes de Trabajo.
Lógica de negocio para el ciclo de vida de las órdenes y el registro de consumos reales.
El registro de consumo descuenta automáticamente el stock del insumo.
"""
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import OperacionNoPermitida, RecursoNoEncontrado, TransicionEstadoInvalida
from app.repositories.insumo_repository import InsumoRepository
from app.repositories.orden_repository import OrdenRepository
from app.schemas.common import RespuestaPaginada
from app.schemas.consumo_real import ConsumoRealCreate, ConsumoRealResponse
from app.schemas.orden_trabajo import (
    CambioEstadoOrden,
    OrdenTrabajoCreate,
    OrdenTrabajoResponse,
    OrdenTrabajoUpdate,
)

# Flujo de estados permitido para las órdenes de trabajo
TRANSICIONES_ORDEN = {
    "PENDIENTE":   ["EN_PROCESO", "CANCELADA"],
    "EN_PROCESO":  ["COMPLETADA", "CANCELADA"],
    "COMPLETADA":  [],  # estado final positivo
    "CANCELADA":   [],  # estado final negativo
}


async def listar(
    db: AsyncSession, pagina: int, por_pagina: int
) -> RespuestaPaginada[OrdenTrabajoResponse]:
    """Retorna la lista paginada de órdenes de trabajo."""
    # TODO: implementar usando OrdenRepository.listar_paginado
    pass


async def crear(
    db: AsyncSession, datos: OrdenTrabajoCreate, usuario_id: int
) -> OrdenTrabajoResponse:
    """
    Crea una nueva orden de trabajo en estado PENDIENTE.
    Genera el número correlativo (OT-YYYY-NNNN).
    """
    # TODO: implementar usando OrdenRepository.crear
    pass


async def obtener(db: AsyncSession, orden_id: int) -> OrdenTrabajoResponse:
    """Retorna una orden con sus detalles. Lanza RecursoNoEncontrado si no existe."""
    # TODO: implementar usando OrdenRepository.obtener_con_detalles
    pass


async def cambiar_estado(
    db: AsyncSession, orden_id: int, datos: CambioEstadoOrden, usuario_id: int
) -> OrdenTrabajoResponse:
    """
    Avanza el estado de una orden siguiendo TRANSICIONES_ORDEN.
    Registra el cambio en historial_estado_orden y en bitácora.
    Lanza TransicionEstadoInvalida si el cambio no está permitido.
    """
    # TODO: implementar
    # 1. Obtener orden actual
    # 2. Validar transición en TRANSICIONES_ORDEN
    # 3. Actualizar estado en la BD
    # 4. Insertar registro en historial_estado_orden
    # 5. Registrar en bitácora
    pass


async def registrar_consumo(
    db: AsyncSession, orden_id: int, datos: ConsumoRealCreate, usuario_id: int
) -> ConsumoRealResponse:
    """
    Registra el consumo real de un insumo en una orden EN_PROCESO.
    Descuenta el stock del insumo y registra el movimiento de inventario.
    Lanza StockInsuficiente si el stock no alcanza.
    """
    # TODO: implementar
    # 1. Verificar que la orden esté EN_PROCESO
    # 2. Obtener insumo y verificar stock (StockInsuficiente si no alcanza)
    # 3. Persistir consumo_real
    # 4. Registrar movimiento de inventario SALIDA
    # 5. Actualizar stock del insumo
    pass
