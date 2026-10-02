"""
Pipeline de entrenamiento del modelo de predicción de demanda.
Usa Random Forest Regressor de scikit-learn para predecir el consumo
mensual de cada insumo en base al historial de consumo real.
"""
import os
from datetime import datetime
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error
from sklearn.model_selection import train_test_split

from app.config import settings

# Columnas de entrada (features) del modelo
FEATURES = ["insumo_id", "anio", "mes", "trimestre", "mes_sin", "mes_cos", "lag_1", "lag_3", "rolling_3"]
# Variable objetivo
TARGET = "cantidad_usada"


def entrenar(dataset: pd.DataFrame) -> dict:
    """
    Entrena el modelo Random Forest Regressor con el dataset de consumo histórico.

    Flujo:
      1. Separar features (X) y objetivo (y).
      2. Dividir en train/test (80/20, sin shuffle para respetar orden temporal).
      3. Instanciar y entrenar RandomForestRegressor.
      4. Evaluar con R² y MAE sobre el conjunto de test.
      5. Serializar el modelo con joblib en ML_MODEL_PATH.
      6. Retornar métricas y nombre de versión del modelo.

    Args:
        dataset: DataFrame con features y columna TARGET preparado por feature_engineering.

    Returns:
        Dict con claves: version_modelo, registros_usados, score_r2, mae, ruta_modelo.
    """
    # TODO: implementar
    # 1. X = dataset[FEATURES], y = dataset[TARGET]
    # 2. X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)
    # 3. modelo = RandomForestRegressor(n_estimators=100, random_state=42)
    # 4. modelo.fit(X_train, y_train)
    # 5. y_pred = modelo.predict(X_test)
    # 6. score_r2 = r2_score(y_test, y_pred)
    # 7. mae = mean_absolute_error(y_test, y_pred)
    # 8. version = f"modelo_v{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    # 9. ruta = Path(settings.ML_MODEL_PATH) / f"{version}.pkl"
    # 10. joblib.dump(modelo, ruta)
    # 11. Retornar métricas
    pass


def obtener_ruta_modelo_activo() -> Path | None:
    """
    Retorna la ruta del modelo .pkl más reciente en ML_MODEL_PATH.
    Retorna None si no existe ningún modelo entrenado.
    """
    directorio = Path(settings.ML_MODEL_PATH)
    modelos = sorted(directorio.glob("modelo_v*.pkl"), reverse=True)
    return modelos[0] if modelos else None
