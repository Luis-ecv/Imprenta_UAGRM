"""
Predictor de demanda: carga el modelo entrenado (.pkl) y genera inferencias.
"""
from decimal import Decimal
from pathlib import Path
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from app.ml.pipeline import obtener_ruta_modelo_activo

_modelo_cache: RandomForestRegressor | None = None
_version_cache: str | None = None


def cargar_modelo() -> tuple[RandomForestRegressor, str]:
    global _modelo_cache, _version_cache
    ruta = obtener_ruta_modelo_activo()
    if ruta is None:
        raise FileNotFoundError(
            "No se encontró ningún modelo entrenado. Ejecute primero el entrenamiento."
        )

    version = ruta.stem
    if _version_cache != version or _modelo_cache is None:
        _modelo_cache = joblib.load(ruta)
        _version_cache = version

    return _modelo_cache, version


def predecir(insumo_id: int, features: pd.DataFrame) -> Decimal:
    try:
        modelo, _ = cargar_modelo()
        pred = float(modelo.predict(features)[0])
        pred = max(0.0, pred)
        return Decimal(str(round(pred, 2)))
    except FileNotFoundError:
        # Fallback si no hay modelo entrenado aún: retorna promedio o valor referencial
        return Decimal("10.00")


def invalidar_cache() -> None:
    global _modelo_cache, _version_cache
    _modelo_cache = None
    _version_cache = None
