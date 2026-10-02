"""
Repositorio de Compras.
Queries SQLAlchemy para órdenes de compra y sus ítems de detalle.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.compra import Compra
from app.repositories.base_repository import BaseRepository


class CompraRepository(BaseRepository[Compra]):
    """Repositorio para operaciones de base de datos sobre la entidad Compra."""

    def __init__(self, db: AsyncSession):
        super().__init__(db, Compra)

    async def obtener_con_detalles(self, compra_id: int) -> Compra | None:
        """Carga una compra con sus ítems de detalle (eager load)."""
        resultado = await self.db.execute(
            select(Compra)
            .options(selectinload(Compra.detalles))
            .where(Compra.id == compra_id)
        )
        return resultado.scalar_one_or_none()

    async def obtener_ultimo_numero(self, anio: int) -> int:
        """Retorna el último número correlativo de compra para el año dado."""
        # TODO: implementar
        pass
