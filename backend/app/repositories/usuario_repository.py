"""
Repositorio de Usuarios.
Queries SQLAlchemy sobre la entidad Usuario.
"""
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.usuario import Usuario
from app.repositories.base_repository import BaseRepository


class UsuarioRepository(BaseRepository[Usuario]):
    """Repositorio para operaciones de base de datos sobre la entidad Usuario."""

    def __init__(self, db: AsyncSession):
        super().__init__(db, Usuario)

    async def obtener_por_email(self, email: str) -> Usuario | None:
        """Busca un usuario por su correo electrónico institucional e incluye su rol."""
        resultado = await self.db.execute(
            select(Usuario).options(selectinload(Usuario.rol)).where(Usuario.email == email)
        )
        return resultado.scalar_one_or_none()

    async def obtener_con_rol(self, id_usuario: int) -> Usuario | None:
        """Obtiene un usuario por ID cargando la relación del rol."""
        resultado = await self.db.execute(
            select(Usuario).options(selectinload(Usuario.rol)).where(Usuario.id_usuario == id_usuario)
        )
        return resultado.scalar_one_or_none()

    async def desactivar(self, usuario: Usuario) -> Usuario:
        """Realiza la baja lógica del usuario (activo=False)."""
        usuario.activo = False
        await self.db.flush()
        await self.db.refresh(usuario)
        return usuario
