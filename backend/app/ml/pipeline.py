"""
Pipeline de entrenamiento del modelo de predicción de demanda.
Usa Random Forest Regressor de scikit-learn.
"""
from datetime import datetime
from pathlib import Path
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from app.config import settings
from app.ml.feature_engineering import FEATURES, TARGET


def entrenar(dataset: pd.DataFrame) -> dict:
    if dataset.empty or len(dataset) < 5:
        # Modelo dummy/fallback para pocos registros
        modelo = RandomForestRegressor(n_estimators=50, random_state=42)
        X = dataset[FEATURES] if not dataset.empty else pd.DataFrame(columns=FEATURES)
        y = dataset[TARGET] if not dataset.empty else pd.Series(dtype=float)
        if not X.empty:
            modelo.fit(X, y)
        score_r2 = 0.0
        mae = 0.0
    else:
        X = dataset[FEATURES]
        y = dataset[TARGET]
        split_idx = int(len(dataset) * 0.8)
        X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
        y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

        modelo = RandomForestRegressor(n_estimators=100, random_state=42)
        modelo.fit(X_train, y_train)

        if len(X_test) > 0:
            y_pred = modelo.predict(X_test)
            score_r2 = float(r2_score(y_test, y_pred)) if len(y_test) > 1 else 1.0
            mae = float(mean_absolute_error(y_test, y_pred))
        else:
            score_r2 = 1.0
            mae = 0.0

    Path(settings.ML_MODEL_PATH).mkdir(parents=True, exist_ok=True)
    version = f"modelo_v{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    ruta = Path(settings.ML_MODEL_PATH) / f"{version}.pkl"
    joblib.dump(modelo, ruta)

    return {
        "version_modelo": version,
        "registros_usados": len(dataset),
        "score_r2": score_r2,
        "mae": mae,
        "ruta_modelo": str(ruta),
    }


def obtener_ruta_modelo_activo() -> Path | None:
    directorio = Path(settings.ML_MODEL_PATH)
    if not directorio.exists():
        return None
    modelos = sorted(directorio.glob("modelo_v*.pkl"), reverse=True)
    return modelos[0] if modelos else None
