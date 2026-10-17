"""
Repositorio de Insumos e Inventario.
Queries SQLAlchemy para insumo, categoria_insumo y movimiento_inventario.
"""
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.categoria_insumo import CategoriaInsumo
from app.models.insumo import Insumo
from app.models.movimiento_inventario import MovimientoInventario
from app.repositories.base_repository import BaseRepository


class InsumoRepository(BaseRepository[Insumo]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Insumo)

    async def obtener_por_codigo(self, codigo: str) -> Insumo | None:
        resultado = await self.db.execute(
            select(Insumo).options(selectinload(Insumo.categoria)).where(Insumo.codigo == codigo)
        )
        return resultado.scalar_one_or_none()

    async def obtener_con_categoria(self, id_insumo: int) -> Insumo | None:
        resultado = await self.db.execute(
            select(Insumo).options(selectinload(Insumo.categoria)).where(Insumo.id_insumo == id_insumo)
        )
        return resultado.scalar_one_or_none()

    async def listar_stock_critico(self) -> list[Insumo]:
        resultado = await self.db.execute(
            select(Insumo)
            .options(selectinload(Insumo.categoria))
            .where(Insumo.stock_actual <= Insumo.stock_minimo)
            .order_by(Insumo.stock_actual.asc())
        )
        return list(resultado.scalars().all())

    async def ajustar_stock(self, insumo: Insumo, delta: Decimal) -> Insumo:
        insumo.stock_actual += delta
        await self.db.flush()
        await self.db.refresh(insumo)
        return insumo

    async def listar_categorias(self) -> list[CategoriaInsumo]:
        resultado = await self.db.execute(select(CategoriaInsumo).order_by(CategoriaInsumo.nombre))
        return list(resultado.scalars().all())

    async def crear_categoria(self, categoria: CategoriaInsumo) -> CategoriaInsumo:
        self.db.add(categoria)
        await self.db.flush()
        await self.db.refresh(categoria)
        return categoria
