"""
Servicio de Proformas.
Lógica de negocio para la creación, edición y aprobación de proformas.
El total se recalcula automáticamente al agregar/quitar ítems de detalle.
"""
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import OperacionNoPermitida, RecursoNoEncontrado, TransicionEstadoInvalida
from app.repositories.proforma_repository import ProformaRepository
from app.schemas.common import RespuestaPaginada
from app.schemas.detalle_proforma import DetalleProformaCreate, DetalleProformaResponse
from app.schemas.proforma import ProformaCreate, ProformaResponse, ProformaUpdate

# Estados permitidos y sus transiciones válidas
TRANSICIONES_PROFORMA = {
    "BORRADOR":  ["PENDIENTE", "CANCELADA"],
    "PENDIENTE": ["APROBADA",  "CANCELADA"],
    "APROBADA":  [],  # estado final positivo
    "CANCELADA": [],  # estado final negativo
}


async def listar(
    db: AsyncSession, pagina: int, por_pagina: int
) -> RespuestaPaginada[ProformaResponse]:
    """Retorna la lista paginada de proformas."""
    # TODO: implementar usando ProformaRepository.listar_paginado
    pass


async def crear(
    db: AsyncSession, datos: ProformaCreate, usuario_id: int
) -> ProformaResponse:
    """
    Crea una nueva proforma en estado BORRADOR.
    Genera el número correlativo automáticamente (PROF-YYYY-NNNN).
    """
    # TODO: implementar usando ProformaRepository.crear
    pass


async def obtener(db: AsyncSession, proforma_id: int) -> ProformaResponse:
    """Retorna una proforma con sus detalles. Lanza RecursoNoEncontrado si no existe."""
    # TODO: implementar usando ProformaRepository.obtener_con_detalles
    pass


async def actualizar(
    db: AsyncSession, proforma_id: int, datos: ProformaUpdate
) -> ProformaResponse:
    """
    Actualiza una proforma. Solo se permite si está en estado BORRADOR.
    Lanza OperacionNoPermitida si el estado no lo permite.
    """
    # TODO: implementar
    pass


async def agregar_detalle(
    db: AsyncSession, proforma_id: int, datos: DetalleProformaCreate
) -> DetalleProformaResponse:
    """
    Agrega un ítem de servicio a una proforma.
    Recalcula y actualiza el total de la proforma.
    Solo permitido en estado BORRADOR.
    """
    # TODO: implementar
    pass


async def eliminar_detalle(
    db: AsyncSession, proforma_id: int, detalle_id: int
) -> dict:
    """
    Elimina un ítem de una proforma y recalcula el total.
    Solo permitido en estado BORRADOR.
    """
    # TODO: implementar
    pass
