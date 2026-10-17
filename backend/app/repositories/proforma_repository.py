"""
Repositorio de Proformas.
Queries SQLAlchemy para proforma y detalle_proforma.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.detalle_proforma import DetalleProforma
from app.models.proforma import Proforma
from app.repositories.base_repository import BaseRepository


class ProformaRepository(BaseRepository[Proforma]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Proforma)

    async def obtener_con_detalles(self, id_proforma: int) -> Proforma | None:
        resultado = await self.db.execute(
            select(Proforma)
            .options(
                selectinload(Proforma.detalles),
                selectinload(Proforma.cliente),
                selectinload(Proforma.usuario),
            )
            .where(Proforma.id_proforma == id_proforma)
        )
        return resultado.scalar_one_or_none()

    async def obtener_por_codigo(self, codigo_proforma: str) -> Proforma | None:
        resultado = await self.db.execute(
            select(Proforma)
            .options(selectinload(Proforma.detalles))
            .where(Proforma.codigo_proforma == codigo_proforma)
        )
        return resultado.scalar_one_or_none()
