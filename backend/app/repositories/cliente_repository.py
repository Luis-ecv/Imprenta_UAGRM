"""
Repositorio de Clientes.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.cliente import Cliente
from app.repositories.base_repository import BaseRepository


class ClienteRepository(BaseRepository[Cliente]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Cliente)

    async def buscar_por_razon_social(self, termino: str) -> list[Cliente]:
        resultado = await self.db.execute(
            select(Cliente).where(Cliente.razon_social.ilike(f"%{termino}%"))
        )
        return list(resultado.scalars().all())
