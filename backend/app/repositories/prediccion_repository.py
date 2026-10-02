"""
Repositorio de Predicciones de Demanda.
Queries SQLAlchemy para el módulo de Machine Learning.
Provee el historial de consumo para el entrenamiento y persiste predicciones.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.consumo_real import ConsumoReal
from app.models.prediccion_demanda import PrediccionDemanda
from app.repositories.base_repository import BaseRepository


class PrediccionRepository(BaseRepository[PrediccionDemanda]):
    """Repositorio para predicciones y consultas de historial de consumo."""

    def __init__(self, db: AsyncSession):
        super().__init__(db, PrediccionDemanda)

    async def obtener_historial_consumo(self) -> list[ConsumoReal]:
        """
        Retorna todos los registros de consumo_real para el entrenamiento del modelo.
        Incluye insumo_id, cantidad_usada, y la fecha del registro.
        """
        resultado = await self.db.execute(select(ConsumoReal))
        return list(resultado.scalars().all())

    async def listar_por_insumo(self, insumo_id: int) -> list[PrediccionDemanda]:
        """Retorna el historial de predicciones para un insumo específico."""
        resultado = await self.db.execute(
            select(PrediccionDemanda)
            .where(PrediccionDemanda.insumo_id == insumo_id)
            .order_by(PrediccionDemanda.generado_en.desc())
        )
        return list(resultado.scalars().all())

    async def contar_registros_consumo(self) -> int:
        """Cuenta los registros de consumo disponibles para verificar el mínimo de ML."""
        from sqlalchemy import func
        resultado = await self.db.execute(
            select(func.count()).select_from(ConsumoReal)
        )
        return resultado.scalar_one()
