"""
Router de Tarifas de servicios y tipos de trabajo.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.permissions import get_current_user, require_roles
from app.core.roles import RolEnum
from app.database import get_db
from app.schemas.tarifa import TarifaCreate, TarifaResponse, TarifaUpdate
from app.schemas.tipo_trabajo import TipoTrabajoResponse
from app.services import tarifa_service

router = APIRouter(prefix="/tarifas")


@router.get("", response_model=list[TarifaResponse], summary="Listar tarifas")
async def listar_tarifas(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await tarifa_service.listar(db)


@router.post("", response_model=TarifaResponse, status_code=201, summary="Crear tarifa")
async def crear_tarifa(
    datos: TarifaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.ADMIN, RolEnum.SUPERADMIN)),
):
    usuario_id = current_user.get("id_usuario", 1)
    return await tarifa_service.crear(db, datos, usuario_id)


@router.get("/tipos-trabajo", response_model=list[TipoTrabajoResponse], summary="Listar tipos de trabajo")
async def listar_tipos_trabajo(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await tarifa_service.listar_tipos_trabajo(db)


@router.get("/{tarifa_id}", response_model=TarifaResponse, summary="Obtener tarifa")
async def obtener_tarifa(
    tarifa_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await tarifa_service.obtener(db, tarifa_id)


@router.put("/{tarifa_id}", response_model=TarifaResponse, summary="Actualizar tarifa")
async def actualizar_tarifa(
    tarifa_id: int,
    datos: TarifaUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.ADMIN, RolEnum.SUPERADMIN)),
):
    usuario_id = current_user.get("id_usuario", 1)
    return await tarifa_service.actualizar(db, tarifa_id, datos, usuario_id)
