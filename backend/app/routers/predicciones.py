"""
Router de Predicciones de Demanda (Machine Learning).
Endpoints para entrenar el modelo y generar predicciones de consumo futuro.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import get_current_user, require_roles
from app.database import get_db
from app.schemas.prediccion_demanda import (
    EntrenamientoResponse,
    PrediccionRequest,
    PrediccionResponse,
)

router = APIRouter(prefix="/predicciones")


@router.post(
    "/entrenar",
    response_model=EntrenamientoResponse,
    summary="Entrenar modelo de predicción",
)
async def entrenar_modelo(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("ADMIN", "SUPERADMIN")),
):
    """
    Dispara el entrenamiento del modelo Random Forest Regressor
    con el historial de consumo de insumos almacenado en la base de datos.
    Requiere al menos ML_MIN_RECORDS_FOR_TRAINING registros históricos.
    """
    # TODO: implementar llamada a prediccion_service.entrenar(db)
    pass


@router.post(
    "/",
    response_model=PrediccionResponse,
    status_code=201,
    summary="Generar predicción de demanda",
)
async def generar_prediccion(
    datos: PrediccionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Genera una predicción de demanda para un insumo específico
    en el horizonte de meses indicado, usando el modelo entrenado.
    """
    # TODO: implementar llamada a prediccion_service.predecir(db, datos)
    pass


@router.get(
    "/{insumo_id}",
    response_model=list[PrediccionResponse],
    summary="Historial de predicciones de un insumo",
)
async def historial_predicciones(
    insumo_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Retorna el historial de predicciones generadas para un insumo."""
    # TODO: implementar llamada a prediccion_service.historial(db, insumo_id)
    pass
