"""
Repositorio de Clientes.
Queries SQLAlchemy específicas para la tabla 'clientes'.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cliente import Cliente
from app.repositories.base_repository import BaseRepository


class ClienteRepository(BaseRepository[Cliente]):
    """Repositorio para operaciones de base de datos sobre la entidad Cliente."""

    def __init__(self, db: AsyncSession):
        super().__init__(db, Cliente)

    async def buscar_por_nombre(self, nombre: str) -> list[Cliente]:
        """Búsqueda de clientes por nombre parcial (ILIKE)."""
        resultado = await self.db.execute(
            select(Cliente).where(Cliente.nombre.ilike(f"%{nombre}%"))
        )
        return list(resultado.scalars().all())

    async def desactivar(self, cliente: Cliente) -> Cliente:
        """Baja lógica del cliente."""
        # TODO: implementar
        pass
