"""
Ingeniería de características para el modelo de predicción de demanda.
Transforma los registros de consumo_real de la base de datos
en un DataFrame con las features requeridas por el modelo Random Forest.
"""
import pandas as pd


def preparar_dataset(registros_consumo: list[dict]) -> pd.DataFrame:
    """
    Convierte el historial de consumo de insumos en un DataFrame listo para entrenar.

    Columnas del DataFrame resultante:
        - insumo_id      : identificador del insumo (int)
        - anio           : año del registro (int)
        - mes            : mes del registro (int, 1-12)
        - trimestre      : trimestre del año (int, 1-4)
        - cantidad_usada : cantidad consumida en el período (float)
        - mes_sin        : seno del mes (feature cíclica para capturar estacionalidad)
        - mes_cos        : coseno del mes (feature cíclica para capturar estacionalidad)
        - lag_1          : consumo del mes anterior para el mismo insumo (float)
        - lag_3          : consumo de 3 meses atrás (float)
        - rolling_3      : promedio móvil de los últimos 3 meses (float)

    Args:
        registros_consumo: Lista de dicts con campos
            {insumo_id, cantidad_usada, registrado_en}.

    Returns:
        DataFrame con las features y la variable objetivo (cantidad_usada).
    """
    # TODO: implementar
    # 1. Crear DataFrame desde registros_consumo
    # 2. Parsear registrado_en a datetime y extraer año, mes, trimestre
    # 3. Calcular features cíclicas: mes_sin = sin(2π * mes / 12)
    # 4. Calcular lags (lag_1, lag_3) agrupando por insumo_id
    # 5. Calcular rolling_3 (media móvil de 3 meses)
    # 6. Eliminar filas con NaN generadas por los lags
    # 7. Retornar el DataFrame procesado
    pass


def obtener_features_para_prediccion(
    insumo_id: int, anio: int, mes: int, historial: pd.DataFrame
) -> pd.DataFrame:
    """
    Construye el vector de features para predecir un insumo en un período futuro.
    Usa el historial existente para calcular los lags y rolling de ese insumo.

    Args:
        insumo_id: ID del insumo a predecir.
        anio: Año a predecir.
        mes: Mes a predecir.
        historial: DataFrame completo del historial de consumo (salida de preparar_dataset).

    Returns:
        DataFrame de una sola fila con las features del período a predecir.
    """
    # TODO: implementar
    pass
