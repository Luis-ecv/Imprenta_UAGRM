"""
Servicio de Clientes.
Lógica de negocio para la gestión de clientes institucionales.
"""
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import RecursoNoEncontrado
from app.repositories.cliente_repository import ClienteRepository
from app.schemas.cliente import ClienteCreate, ClienteResponse, ClienteUpdate
from app.schemas.common import RespuestaPaginada


async def listar(
    db: AsyncSession, pagina: int, por_pagina: int
) -> RespuestaPaginada[ClienteResponse]:
    """Retorna la lista paginada de clientes activos."""
    # TODO: implementar usando ClienteRepository.listar_paginado
    pass


async def crear(db: AsyncSession, datos: ClienteCreate) -> ClienteResponse:
    """Registra un nuevo cliente institucional."""
    # TODO: implementar usando ClienteRepository.crear
    pass


async def obtener(db: AsyncSession, cliente_id: int) -> ClienteResponse:
    """Retorna un cliente por ID. Lanza RecursoNoEncontrado si no existe."""
    # TODO: implementar usando ClienteRepository.obtener_por_id
    pass


async def actualizar(
    db: AsyncSession, cliente_id: int, datos: ClienteUpdate
) -> ClienteResponse:
    """Actualiza los datos de un cliente existente."""
    # TODO: implementar usando ClienteRepository.actualizar
    pass


async def desactivar(db: AsyncSession, cliente_id: int) -> dict:
    """Realiza la baja lógica de un cliente."""
    # TODO: implementar usando ClienteRepository.desactivar
    pass
