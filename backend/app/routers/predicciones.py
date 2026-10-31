"""
Router de Predicciones de Demanda (CU11, Machine Learning).
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.permissions import require_roles
from app.core.roles import RolEnum
from app.database import get_db
from app.schemas.periodo_academico import PeriodoAcademicoResponse
from app.schemas.prediccion_demanda import (
    EntrenamientoResponse,
    InferenciaMLRequest,
    PrediccionDemandaResponse,
)
from app.services import prediccion_service

router = APIRouter(prefix="/predicciones")


@router.post("/entrenar", response_model=EntrenamientoResponse, summary="Entrenar modelo ML")
async def entrenar_modelo(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.ADMIN, RolEnum.SUPERADMIN)),
):
    usuario_id = current_user.get("id_usuario", 1)
    return await prediccion_service.entrenar(db, usuario_id)


@router.get("/periodos", response_model=list[PeriodoAcademicoResponse], summary="Listar periodos académicos")
async def listar_periodos(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.ADMIN, RolEnum.SUPERADMIN)),
):
    """Lista los semestres académicos para poblar el selector de predicción."""
    return await prediccion_service.listar_periodos(db)


@router.post("", response_model=PrediccionDemandaResponse, summary="Generar predicción de demanda")
@router.post("/", include_in_schema=False)
@router.post("/estimar", response_model=PrediccionDemandaResponse, include_in_schema=False)
async def generar_prediccion(
    datos: InferenciaMLRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.ADMIN, RolEnum.SUPERADMIN)),
):
    usuario_id = current_user.get("id_usuario", 1)
    return await prediccion_service.predecir(db, datos, usuario_id)


@router.get("/{insumo_id}", response_model=list[PrediccionDemandaResponse], summary="Historial de predicciones")
async def historial_predicciones(
    insumo_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.ADMIN, RolEnum.SUPERADMIN)),
):
    return await prediccion_service.historial(db, insumo_id)
