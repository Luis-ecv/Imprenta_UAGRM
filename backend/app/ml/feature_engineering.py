"""
Ingeniería de características para el modelo de predicción de demanda.
Transforma los registros de consumo_real de la base de datos
en un DataFrame con las features requeridas por el modelo Random Forest.
"""
import numpy as np
import pandas as pd

FEATURES = ["insumo_id", "anio", "mes", "trimestre", "mes_sin", "mes_cos", "lag_1", "lag_3", "rolling_3"]
TARGET = "cantidad_usada"


def preparar_dataset(registros_consumo: list[dict]) -> pd.DataFrame:
    """Convierte el historial de consumo de insumos en un DataFrame listo para entrenar."""
    if not registros_consumo:
        return pd.DataFrame(columns=FEATURES + [TARGET])

    df = pd.DataFrame(registros_consumo)
    df["registrado_en"] = pd.to_datetime(df["registrado_en"])
    df["anio"] = df["registrado_en"].dt.year
    df["mes"] = df["registrado_en"].dt.month
    df["trimestre"] = df["registrado_en"].dt.quarter

    # Features cíclicas para estacionalidad mensual
    df["mes_sin"] = np.sin(2 * np.pi * df["mes"] / 12)
    df["mes_cos"] = np.cos(2 * np.pi * df["mes"] / 12)

    # Agrupar por mes e insumo
    agrupado = df.groupby(["insumo_id", "anio", "mes", "trimestre", "mes_sin", "mes_cos"], as_index=False)[
        "cantidad_usada"
    ].sum()
    agrupado = agrupado.sort_values(["insumo_id", "anio", "mes"])

    # Lags y promedios móviles
    agrupado["lag_1"] = agrupado.groupby("insumo_id")["cantidad_usada"].shift(1).fillna(0.0)
    agrupado["lag_3"] = agrupado.groupby("insumo_id")["cantidad_usada"].shift(3).fillna(0.0)
    agrupado["rolling_3"] = (
        agrupado.groupby("insumo_id")["cantidad_usada"]
        .transform(lambda x: x.rolling(3, min_periods=1).mean())
        .fillna(0.0)
    )

    return agrupado


def obtener_features_para_prediccion(
    insumo_id: int, anio: int, mes: int, historial: pd.DataFrame
) -> pd.DataFrame:
    trimestre = (mes - 1) // 3 + 1
    mes_sin = float(np.sin(2 * np.pi * mes / 12))
    mes_cos = float(np.cos(2 * np.pi * mes / 12))

    lag_1 = 0.0
    lag_3 = 0.0
    rolling_3 = 0.0

    if not historial.empty and "insumo_id" in historial.columns:
        df_ins = historial[historial["insumo_id"] == insumo_id].sort_values(["anio", "mes"])
        if not df_ins.empty:
            valores = df_ins["cantidad_usada"].tolist()
            if len(valores) >= 1:
                lag_1 = float(valores[-1])
            if len(valores) >= 3:
                lag_3 = float(valores[-3])
                rolling_3 = float(np.mean(valores[-3:]))
            elif valores:
                rolling_3 = float(np.mean(valores))

    row = {
        "insumo_id": insumo_id,
        "anio": anio,
        "mes": mes,
        "trimestre": trimestre,
        "mes_sin": mes_sin,
        "mes_cos": mes_cos,
        "lag_1": lag_1,
        "lag_3": lag_3,
        "rolling_3": rolling_3,
    }
    return pd.DataFrame([row])[FEATURES]
