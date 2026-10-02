"""
Repositorio base genérico con operaciones CRUD comunes.
Todos los repositorios específicos heredan de esta clase para reutilizar
las operaciones básicas de create, read, update y delete.
"""
from typing import Any, Generic, Type, TypeVar

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """
    Repositorio genérico parametrizado por el tipo de modelo SQLAlchemy.

    Uso:
        class UsuarioRepository(BaseRepository[Usuario]):
            def __init__(self, db: AsyncSession):
                super().__init__(db, Usuario)
    """

    def __init__(self, db: AsyncSession, model: Type[ModelType]):
        self.db = db
        self.model = model

    async def obtener_por_id(self, id: int) -> ModelType | None:
        """Retorna el registro con el ID indicado, o None si no existe."""
        resultado = await self.db.execute(
            select(self.model).where(self.model.id == id)
        )
        return resultado.scalar_one_or_none()

    async def listar_todos(self) -> list[ModelType]:
        """Retorna todos los registros del modelo."""
        resultado = await self.db.execute(select(self.model))
        return list(resultado.scalars().all())

    async def listar_paginado(
        self, pagina: int = 1, por_pagina: int = 20
    ) -> tuple[list[ModelType], int]:
        """
        Retorna una tupla (registros, total) para paginación.

        Args:
            pagina: Número de página (base 1).
            por_pagina: Cantidad de registros por página.

        Returns:
            Tupla con la lista de registros y el total de registros.
        """
        offset = (pagina - 1) * por_pagina

        # Total de registros
        total_resultado = await self.db.execute(
            select(func.count()).select_from(self.model)
        )
        total = total_resultado.scalar_one()

        # Registros paginados
        resultado = await self.db.execute(
            select(self.model).offset(offset).limit(por_pagina)
        )
        registros = list(resultado.scalars().all())

        return registros, total

    async def crear(self, obj: ModelType) -> ModelType:
        """Persiste un nuevo registro y lo retorna con su ID asignado."""
        self.db.add(obj)
        await self.db.flush()  # obtiene el ID sin hacer commit
        await self.db.refresh(obj)
        return obj

    async def actualizar(self, obj: ModelType, datos: dict[str, Any]) -> ModelType:
        """Aplica los cambios del diccionario al objeto y lo persiste."""
        for campo, valor in datos.items():
            if valor is not None:
                setattr(obj, campo, valor)
        await self.db.flush()
        await self.db.refresh(obj)
        return obj

    async def eliminar(self, obj: ModelType) -> None:
        """Elimina físicamente un registro de la base de datos."""
        await self.db.delete(obj)
        await self.db.flush()
