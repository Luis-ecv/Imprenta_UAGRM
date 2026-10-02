"""
Servicio de Usuarios y Roles.
Lógica de negocio para la gestión de usuarios del sistema (CRUD + RBAC).
"""
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictoRegistro, RecursoNoEncontrado
from app.core.security import hash_password
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.common import RespuestaPaginada
from app.schemas.usuario import UsuarioCreate, UsuarioResponse, UsuarioUpdate


async def listar(
    db: AsyncSession, pagina: int, por_pagina: int
) -> RespuestaPaginada[UsuarioResponse]:
    """Retorna la lista paginada de usuarios del sistema."""
    # TODO: implementar usando UsuarioRepository.listar_paginado
    pass


async def crear(db: AsyncSession, datos: UsuarioCreate) -> UsuarioResponse:
    """
    Crea un nuevo usuario.
    Verifica que el nombre_usuario y correo no estén ya registrados.
    Aplica hash bcrypt a la contraseña antes de persistir.
    """
    # TODO: implementar
    # 1. Verificar unicidad de nombre_usuario y correo (ConflictoRegistro si duplicado)
    # 2. hash_password(datos.contrasena)
    # 3. Persistir con UsuarioRepository.crear
    pass


async def obtener(db: AsyncSession, usuario_id: int) -> UsuarioResponse:
    """Retorna los datos de un usuario. Lanza RecursoNoEncontrado si no existe."""
    # TODO: implementar usando UsuarioRepository.obtener_por_id
    pass


async def actualizar(
    db: AsyncSession, usuario_id: int, datos: UsuarioUpdate
) -> UsuarioResponse:
    """Actualiza los campos indicados de un usuario existente."""
    # TODO: implementar usando UsuarioRepository.actualizar
    pass


async def desactivar(db: AsyncSession, usuario_id: int) -> dict:
    """Realiza la baja lógica de un usuario (activo=False)."""
    # TODO: implementar usando UsuarioRepository.desactivar
    pass
