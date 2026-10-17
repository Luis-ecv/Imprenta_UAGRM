"""
Repositorio de Predicciones de Demanda.
"""
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.consumo_real import ConsumoReal
from app.models.prediccion_demanda import PrediccionDemanda
from app.repositories.base_repository import BaseRepository


class PrediccionRepository(BaseRepository[PrediccionDemanda]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, PrediccionDemanda)

    async def obtener_historial_consumos(self) -> list[ConsumoReal]:
        resultado = await self.db.execute(
            select(ConsumoReal).order_by(ConsumoReal.created_at.asc())
        )
        return list(resultado.scalars().all())

    async def listar_por_insumo(self, insumo_id: int) -> list[PrediccionDemanda]:
        resultado = await self.db.execute(
            select(PrediccionDemanda)
            .options(selectinload(PrediccionDemanda.periodo))
            .where(PrediccionDemanda.insumo_id == insumo_id)
            .order_by(PrediccionDemanda.fecha_generacion.desc())
        )
        return list(resultado.scalars().all())

    async def contar_registros_consumo(self) -> int:
        resultado = await self.db.execute(
            select(func.count()).select_from(ConsumoReal)
        )
        return resultado.scalar_one()
