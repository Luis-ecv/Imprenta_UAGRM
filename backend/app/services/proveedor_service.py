"""
Servicio de Proveedores.
Lógica de negocio para la gestión de proveedores de insumos.
"""
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import RecursoNoEncontrado
from app.schemas.common import RespuestaPaginada
from app.schemas.proveedor import ProveedorCreate, ProveedorResponse, ProveedorUpdate


async def listar(
    db: AsyncSession, pagina: int, por_pagina: int
) -> RespuestaPaginada[ProveedorResponse]:
    """Retorna la lista paginada de proveedores activos."""
    # TODO: implementar
    pass


async def crear(db: AsyncSession, datos: ProveedorCreate) -> ProveedorResponse:
    """Registra un nuevo proveedor."""
    # TODO: implementar
    pass


async def obtener(db: AsyncSession, proveedor_id: int) -> ProveedorResponse:
    """Retorna un proveedor por ID. Lanza RecursoNoEncontrado si no existe."""
    # TODO: implementar
    pass


async def actualizar(
    db: AsyncSession, proveedor_id: int, datos: ProveedorUpdate
) -> ProveedorResponse:
    """Actualiza los datos de un proveedor existente."""
    # TODO: implementar
    pass
