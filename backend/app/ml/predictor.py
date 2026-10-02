"""
Predictor de demanda: carga el modelo entrenado (.pkl) y genera predicciones.
Separa la lógica de inferencia del pipeline de entrenamiento.
"""
from decimal import Decimal
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

from app.ml.pipeline import obtener_ruta_modelo_activo

# Caché en memoria del modelo cargado (evita leer el disco en cada predicción)
_modelo_cache: RandomForestRegressor | None = None
_version_cache: str | None = None


def cargar_modelo() -> tuple[RandomForestRegressor, str]:
    """
    Carga el modelo .pkl más reciente desde el disco.
    Usa caché en memoria para no releer en cada request.

    Returns:
        Tupla (modelo, version_modelo).

    Raises:
        FileNotFoundError: Si no existe ningún modelo entrenado en ML_MODEL_PATH.
    """
    global _modelo_cache, _version_cache

    ruta = obtener_ruta_modelo_activo()
    if ruta is None:
        raise FileNotFoundError(
            "No se encontró ningún modelo entrenado. "
            "Ejecute primero el endpoint POST /api/v1/predicciones/entrenar."
        )

    version = ruta.stem  # nombre del archivo sin extensión

    # Recargar si el modelo en disco es más reciente que el caché
    if _version_cache != version:
        _modelo_cache = joblib.load(ruta)
        _version_cache = version

    return _modelo_cache, version


def predecir(
    insumo_id: int,
    features: pd.DataFrame,
) -> Decimal:
    """
    Genera la predicción de demanda para el vector de features dado.

    Args:
        insumo_id: ID del insumo (usado para logging).
        features: DataFrame de una fila con las columnas de FEATURES.

    Returns:
        Cantidad predicha como Decimal redondeada a 2 decimales.

    Raises:
        FileNotFoundError: Si no hay modelo entrenado disponible.
    """
    # TODO: implementar
    # 1. modelo, version = cargar_modelo()
    # 2. prediccion = modelo.predict(features)[0]
    # 3. Retornar Decimal(str(round(prediccion, 2)))
    pass


def invalidar_cache() -> None:
    """
    Invalida el caché del modelo en memoria.
    Llamar después de entrenar un nuevo modelo para forzar su recarga.
    """
    global _modelo_cache, _version_cache
    _modelo_cache = None
    _version_cache = None
