"""
Router de Tarifas de servicios de impresión.
CRUD de tarifas configurables utilizadas en proformas y órdenes.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import get_current_user, require_roles
from app.database import get_db
from app.schemas.common import RespuestaExito
from app.schemas.tarifa import TarifaCreate, TarifaResponse, TarifaUpdate

router = APIRouter(prefix="/tarifas")


@router.get("", response_model=list[TarifaResponse], summary="Listar tarifas")
async def listar_tarifas(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Retorna todas las tarifas de servicios activas."""
    # TODO: implementar llamada a tarifa_service.listar(db)
    pass


@router.post("", response_model=TarifaResponse, status_code=201, summary="Crear tarifa")
async def crear_tarifa(
    datos: TarifaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("ADMIN", "SUPERADMIN")),
):
    """Registra una nueva tarifa de servicio de impresión."""
    # TODO: implementar llamada a tarifa_service.crear(db, datos)
    pass


@router.get("/{tarifa_id}", response_model=TarifaResponse, summary="Obtener tarifa")
async def obtener_tarifa(
    tarifa_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Retorna los datos de una tarifa por su ID."""
    # TODO: implementar llamada a tarifa_service.obtener(db, tarifa_id)
    pass


@router.put("/{tarifa_id}", response_model=TarifaResponse, summary="Actualizar tarifa")
async def actualizar_tarifa(
    tarifa_id: int,
    datos: TarifaUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("ADMIN", "SUPERADMIN")),
):
    """Actualiza el precio u otros datos de una tarifa."""
    # TODO: implementar llamada a tarifa_service.actualizar(db, tarifa_id, datos)
    pass


@router.delete("/{tarifa_id}", response_model=RespuestaExito, summary="Desactivar tarifa")
async def desactivar_tarifa(
    tarifa_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("ADMIN", "SUPERADMIN")),
):
    """Desactiva una tarifa (no se podrá usar en nuevas proformas/órdenes)."""
    # TODO: implementar llamada a tarifa_service.desactivar(db, tarifa_id)
    pass
