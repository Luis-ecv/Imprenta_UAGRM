"""
Repositorio base genérico con operaciones CRUD comunes.
Compatible con SQLAlchemy 2.0 AsyncSession.
"""
from typing import Any, Generic, Type, TypeVar
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """
    Repositorio genérico parametrizado por el tipo de modelo SQLAlchemy.
    """

    def __init__(self, db: AsyncSession, model: Type[ModelType]):
        self.db = db
        self.model = model

    async def obtener_por_id(self, id_val: Any) -> ModelType | None:
        """Retorna el registro buscando por su clave primaria mediante db.get()."""
        return await self.db.get(self.model, id_val)

    async def listar_todos(self) -> list[ModelType]:
        """Retorna todos los registros del modelo."""
        resultado = await self.db.execute(select(self.model))
        return list(resultado.scalars().all())

    async def listar_paginado(
        self, pagina: int = 1, por_pagina: int = 20
    ) -> tuple[list[ModelType], int]:
        """Retorna una tupla (registros, total) para paginación."""
        offset = (pagina - 1) * por_pagina
        total_resultado = await self.db.execute(
            select(func.count()).select_from(self.model)
        )
        total = total_resultado.scalar_one()

        resultado = await self.db.execute(
            select(self.model).offset(offset).limit(por_pagina)
        )
        registros = list(resultado.scalars().all())
        return registros, total

    async def crear(self, obj: ModelType) -> ModelType:
        """Persiste un nuevo registro y lo retorna con sus claves asignadas."""
        self.db.add(obj)
        await self.db.flush()
        await self.db.refresh(obj)
        return obj

    async def actualizar(self, obj: ModelType, datos: dict[str, Any]) -> ModelType:
        """Aplica los cambios del diccionario al objeto y lo persiste."""
        for campo, valor in datos.items():
            if valor is not None and hasattr(obj, campo):
                setattr(obj, campo, valor)
        await self.db.flush()
        await self.db.refresh(obj)
        return obj

    async def eliminar(self, obj: ModelType) -> None:
        """Elimina físicamente un registro de la base de datos."""
        await self.db.delete(obj)
        await self.db.flush()
