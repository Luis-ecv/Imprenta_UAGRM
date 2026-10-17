"""
Repositorio de Órdenes de Trabajo.
Queries SQLAlchemy para orden_trabajo, detalle_orden, historial_estado y consumo_real.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.consumo_real import ConsumoReal
from app.models.detalle_orden import DetalleOrden
from app.models.historial_estado import HistorialEstado
from app.models.orden_trabajo import OrdenTrabajo
from app.repositories.base_repository import BaseRepository


class OrdenRepository(BaseRepository[OrdenTrabajo]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, OrdenTrabajo)

    async def obtener_con_detalles(self, id_orden: int) -> OrdenTrabajo | None:
        resultado = await self.db.execute(
            select(OrdenTrabajo)
            .options(
                selectinload(OrdenTrabajo.detalles_orden),
                selectinload(OrdenTrabajo.historial),
                selectinload(OrdenTrabajo.consumos),
                selectinload(OrdenTrabajo.proforma),
            )
            .where(OrdenTrabajo.id_orden == id_orden)
        )
        return resultado.scalar_one_or_none()

    async def obtener_por_codigo(self, codigo_ot: str) -> OrdenTrabajo | None:
        resultado = await self.db.execute(
            select(OrdenTrabajo)
            .options(selectinload(OrdenTrabajo.detalles_orden), selectinload(OrdenTrabajo.historial))
            .where(OrdenTrabajo.codigo_ot == codigo_ot)
        )
        return resultado.scalar_one_or_none()

    async def listar_por_estado(self, estado: str) -> list[OrdenTrabajo]:
        resultado = await self.db.execute(
            select(OrdenTrabajo)
            .options(selectinload(OrdenTrabajo.detalles_orden))
            .where(OrdenTrabajo.estado_actual == estado)
            .order_by(OrdenTrabajo.fecha_compromiso.asc())
        )
        return list(resultado.scalars().all())

    async def registrar_historial(self, historial: HistorialEstado) -> HistorialEstado:
        self.db.add(historial)
        await self.db.flush()
        await self.db.refresh(historial)
        return historial

    async def registrar_consumo(self, consumo: ConsumoReal) -> ConsumoReal:
        self.db.add(consumo)
        await self.db.flush()
        await self.db.refresh(consumo)
        return consumo
