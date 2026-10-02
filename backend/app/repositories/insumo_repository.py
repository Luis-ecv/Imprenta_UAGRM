"""
Repositorio de Insumos e Inventario.
Queries SQLAlchemy para insumos, categorías y movimientos de inventario.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.categoria_insumo import CategoriaInsumo
from app.models.insumo import Insumo
from app.models.movimiento_inventario import MovimientoInventario
from app.repositories.base_repository import BaseRepository


class InsumoRepository(BaseRepository[Insumo]):
    """Repositorio para operaciones de base de datos sobre la entidad Insumo."""

    def __init__(self, db: AsyncSession):
        super().__init__(db, Insumo)

    async def obtener_por_codigo(self, codigo: str) -> Insumo | None:
        """Busca un insumo por su código único."""
        resultado = await self.db.execute(
            select(Insumo).where(Insumo.codigo == codigo)
        )
        return resultado.scalar_one_or_none()

    async def listar_stock_bajo(self) -> list[Insumo]:
        """Retorna insumos cuyo stock_actual está por debajo del stock_minimo."""
        resultado = await self.db.execute(
            select(Insumo).where(
                Insumo.stock_actual < Insumo.stock_minimo,
                Insumo.activo == True,
            )
        )
        return list(resultado.scalars().all())

    async def actualizar_stock(self, insumo: Insumo, nuevo_stock: float) -> Insumo:
        """Actualiza el stock_actual de un insumo."""
        # TODO: implementar
        pass

    async def registrar_movimiento(
        self, movimiento: MovimientoInventario
    ) -> MovimientoInventario:
        """Persiste un movimiento de inventario."""
        # TODO: implementar usando self.db.add + flush
        pass

    async def listar_categorias(self) -> list[CategoriaInsumo]:
        """Retorna todas las categorías de insumos activas."""
        resultado = await self.db.execute(
            select(CategoriaInsumo).where(CategoriaInsumo.activo == True)
        )
        return list(resultado.scalars().all())

    async def crear_categoria(self, categoria: CategoriaInsumo) -> CategoriaInsumo:
        """Persiste una nueva categoría de insumo."""
        # TODO: implementar
        pass
