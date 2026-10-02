"""
Servicio de Tarifas.
Lógica de negocio para los parámetros de costeo de servicios de impresión.
"""
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import RecursoNoEncontrado
from app.schemas.tarifa import TarifaCreate, TarifaResponse, TarifaUpdate


async def listar(db: AsyncSession) -> list[TarifaResponse]:
    """Retorna todas las tarifas activas."""
    # TODO: implementar
    pass


async def crear(db: AsyncSession, datos: TarifaCreate) -> TarifaResponse:
    """Registra una nueva tarifa de servicio."""
    # TODO: implementar
    pass


async def obtener(db: AsyncSession, tarifa_id: int) -> TarifaResponse:
    """Retorna una tarifa por ID. Lanza RecursoNoEncontrado si no existe."""
    # TODO: implementar
    pass


async def actualizar(
    db: AsyncSession, tarifa_id: int, datos: TarifaUpdate
) -> TarifaResponse:
    """Actualiza los datos de una tarifa existente."""
    # TODO: implementar
    pass


async def desactivar(db: AsyncSession, tarifa_id: int) -> dict:
    """Desactiva una tarifa de servicio."""
    # TODO: implementar
    pass
