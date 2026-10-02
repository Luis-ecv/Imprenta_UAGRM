"""
Servicio de Predicción de Demanda (Machine Learning).
Orquesta el entrenamiento del modelo Random Forest y la generación de predicciones.
Usa el módulo app/ml/ para toda la lógica de ciencia de datos.
"""
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.exceptions import DatosInsuficientesML, RecursoNoEncontrado
from app.repositories.prediccion_repository import PrediccionRepository
from app.schemas.prediccion_demanda import (
    EntrenamientoResponse,
    PrediccionRequest,
    PrediccionResponse,
)


async def entrenar(db: AsyncSession) -> EntrenamientoResponse:
    """
    Entrena el modelo Random Forest Regressor con el historial de consumos.

    Flujo:
      1. Consultar historial de consumo_real via PrediccionRepository.
      2. Verificar que haya al menos ML_MIN_RECORDS_FOR_TRAINING registros.
         Lanza DatosInsuficientesML si no alcanza.
      3. Llamar a feature_engineering.preparar_dataset(datos).
      4. Llamar a pipeline.entrenar(dataset).
      5. Persistir el modelo .pkl con un nombre de versión (ej: modelo_v20240101.pkl).
      6. Retornar EntrenamientoResponse con métricas del entrenamiento.
    """
    # TODO: implementar
    pass


async def predecir(
    db: AsyncSession, datos: PrediccionRequest
) -> PrediccionResponse:
    """
    Genera una predicción de demanda para un insumo específico.

    Flujo:
      1. Verificar que el insumo existe.
      2. Cargar el modelo .pkl más reciente con predictor.cargar_modelo().
      3. Preparar las features del insumo.
      4. Llamar a predictor.predecir(insumo_id, meses).
      5. Persistir el resultado en la tabla predicciones_ml.
      6. Retornar PrediccionResponse.
    """
    # TODO: implementar
    pass


async def historial(
    db: AsyncSession, insumo_id: int
) -> list[PrediccionResponse]:
    """Retorna el historial de predicciones generadas para un insumo."""
    # TODO: implementar usando PrediccionRepository.listar_por_insumo
    pass
