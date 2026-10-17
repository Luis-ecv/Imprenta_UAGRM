"""
Repositorio de Órdenes de Compra.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.orden_compra import OrdenCompra
from app.repositories.base_repository import BaseRepository


class OrdenCompraRepository(BaseRepository[OrdenCompra]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, OrdenCompra)

    async def obtener_con_relaciones(self, id_orden_compra: int) -> OrdenCompra | None:
        resultado = await self.db.execute(
            select(OrdenCompra)
            .options(selectinload(OrdenCompra.proveedor), selectinload(OrdenCompra.prediccion))
            .where(OrdenCompra.id_orden_compra == id_orden_compra)
        )
        return resultado.scalar_one_or_none()

CompraRepository = OrdenCompraRepository
