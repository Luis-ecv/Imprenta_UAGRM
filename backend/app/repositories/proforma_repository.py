"""
Repositorio de Proformas.
Queries SQLAlchemy para proformas y sus ítems de detalle.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.detalle_proforma import DetalleProforma
from app.models.proforma import Proforma
from app.repositories.base_repository import BaseRepository


class ProformaRepository(BaseRepository[Proforma]):
    """Repositorio para operaciones de base de datos sobre la entidad Proforma."""

    def __init__(self, db: AsyncSession):
        super().__init__(db, Proforma)

    async def obtener_con_detalles(self, proforma_id: int) -> Proforma | None:
        """Carga una proforma con sus ítems de detalle en una sola query (eager load)."""
        resultado = await self.db.execute(
            select(Proforma)
            .options(selectinload(Proforma.detalles))
            .where(Proforma.id == proforma_id)
        )
        return resultado.scalar_one_or_none()

    async def obtener_ultimo_numero(self, anio: int) -> int:
        """
        Retorna el último número correlativo de proforma para el año indicado.
        Usado para generar el próximo número (PROF-YYYY-NNNN).
        """
        # TODO: implementar query con MAX sobre el número del año
        pass

    async def agregar_detalle(self, detalle: DetalleProforma) -> DetalleProforma:
        """Persiste un ítem de detalle y recalcula el total de la proforma."""
        # TODO: implementar
        pass

    async def eliminar_detalle(self, detalle_id: int) -> None:
        """Elimina un ítem de la proforma por su ID."""
        # TODO: implementar
        pass
