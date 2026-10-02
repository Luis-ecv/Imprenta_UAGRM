"""
Repositorio de Órdenes de Trabajo.
Queries SQLAlchemy para órdenes, detalles, historial de estados y consumos reales.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.consumo_real import ConsumoReal
from app.models.historial_estado_orden import HistorialEstadoOrden
from app.models.orden_trabajo import OrdenTrabajo
from app.repositories.base_repository import BaseRepository


class OrdenRepository(BaseRepository[OrdenTrabajo]):
    """Repositorio para operaciones de base de datos sobre la entidad OrdenTrabajo."""

    def __init__(self, db: AsyncSession):
        super().__init__(db, OrdenTrabajo)

    async def obtener_con_detalles(self, orden_id: int) -> OrdenTrabajo | None:
        """Carga una orden con sus ítems y consumos (eager load)."""
        resultado = await self.db.execute(
            select(OrdenTrabajo)
            .options(
                selectinload(OrdenTrabajo.detalles),
                selectinload(OrdenTrabajo.consumos),
            )
            .where(OrdenTrabajo.id == orden_id)
        )
        return resultado.scalar_one_or_none()

    async def listar_por_estado(self, estado: str) -> list[OrdenTrabajo]:
        """Retorna todas las órdenes en el estado indicado."""
        resultado = await self.db.execute(
            select(OrdenTrabajo).where(OrdenTrabajo.estado == estado)
        )
        return list(resultado.scalars().all())

    async def registrar_historial_estado(
        self, historial: HistorialEstadoOrden
    ) -> HistorialEstadoOrden:
        """Persiste un cambio de estado en el historial."""
        # TODO: implementar
        pass

    async def registrar_consumo(self, consumo: ConsumoReal) -> ConsumoReal:
        """Persiste un registro de consumo real de insumo."""
        # TODO: implementar
        pass
