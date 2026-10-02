"""
Repositorio de Usuarios.
Queries SQLAlchemy específicas para la tabla 'usuarios'.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.usuario import Usuario
from app.repositories.base_repository import BaseRepository


class UsuarioRepository(BaseRepository[Usuario]):
    """Repositorio para operaciones de base de datos sobre la entidad Usuario."""

    def __init__(self, db: AsyncSession):
        super().__init__(db, Usuario)

    async def obtener_por_nombre_usuario(self, nombre_usuario: str) -> Usuario | None:
        """Busca un usuario por su nombre de usuario. Usado en autenticación."""
        resultado = await self.db.execute(
            select(Usuario).where(Usuario.nombre_usuario == nombre_usuario)
        )
        return resultado.scalar_one_or_none()

    async def obtener_por_correo(self, correo: str) -> Usuario | None:
        """Busca un usuario por su correo electrónico."""
        resultado = await self.db.execute(
            select(Usuario).where(Usuario.correo == correo)
        )
        return resultado.scalar_one_or_none()

    async def desactivar(self, usuario: Usuario) -> Usuario:
        """Realiza la baja lógica del usuario (activo=False)."""
        # TODO: implementar setattr(usuario, 'activo', False) + flush
        pass
