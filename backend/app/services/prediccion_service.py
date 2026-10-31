"""
Servicio de Predicción de Demanda (CU11, Machine Learning).
"""
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.core.exceptions import RecursoNoEncontrado
from app.ml import feature_engineering, pipeline, predictor
from app.models.consumo_real import ConsumoReal
from app.models.insumo import Insumo
from app.models.periodo_academico import PeriodoAcademico
from app.models.prediccion_demanda import PrediccionDemanda
from app.repositories.prediccion_repository import PrediccionRepository
from app.schemas.periodo_academico import PeriodoAcademicoResponse
from app.schemas.prediccion_demanda import (
    EntrenamientoResponse,
    InferenciaMLRequest,
    PrediccionDemandaResponse,
)
from app.services import bitacora_service


async def listar_periodos(db: AsyncSession) -> list[PeriodoAcademicoResponse]:
    """Retorna los periodos académicos disponibles para selección en inferencias ML."""
    result = await db.execute(
        select(PeriodoAcademico).order_by(PeriodoAcademico.gestion.desc(), PeriodoAcademico.id_periodo.desc())
    )
    periodos = result.scalars().all()
    return [PeriodoAcademicoResponse.model_validate(p) for p in periodos]


async def entrenar(db: AsyncSession, usuario_id: int = 1) -> EntrenamientoResponse:
    repo = PrediccionRepository(db)
    consumos = await repo.obtener_historial_consumos()

    registros = []
    for c in consumos:
        registros.append({
            "insumo_id": c.insumo_id,
            "cantidad_usada": float(c.cantidad_utilizada + c.cantidad_merma),
            "registrado_en": c.created_at,
        })

    dataset = feature_engineering.preparar_dataset(registros)
    metricas = pipeline.entrenar(dataset)
    predictor.invalidar_cache()

    await bitacora_service.registrar(
        db, usuario_id=usuario_id, accion="ENTRENAR_MODELO_ML", modulo="Predicciones",
        detalle={
            "version": metricas["version_modelo"],
            "registros": len(registros),
            "score_r2": metricas["score_r2"],
        }
    )

    return EntrenamientoResponse(
        mensaje="Modelo de Machine Learning reentrenado exitosamente.",
        registros_entrenamiento=len(registros),
        r2_score=metricas["score_r2"],
        mae=metricas["mae"],
        fecha_entrenamiento=datetime.now(timezone.utc),
    )


async def predecir(
    db: AsyncSession, datos: InferenciaMLRequest, usuario_id: int = 1
) -> PrediccionDemandaResponse:
    insumo = await db.get(Insumo, datos.insumo_id)
    if not insumo:
        raise RecursoNoEncontrado("Insumo", datos.insumo_id)

    periodo = await db.get(PeriodoAcademico, datos.periodo_id)
    if not periodo:
        raise RecursoNoEncontrado("PeriodoAcademico", datos.periodo_id)

    repo = PrediccionRepository(db)
    consumos = await repo.obtener_historial_consumos()

    total_registros = len(consumos)
    es_referencial = (total_registros < settings.ML_MIN_RECORDS_FOR_TRAINING)

    registros = [
        {
            "insumo_id": c.insumo_id,
            "cantidad_usada": float(c.cantidad_utilizada + c.cantidad_merma),
            "registrado_en": c.created_at,
        }
        for c in consumos
    ]
    dataset = feature_engineering.preparar_dataset(registros)
    mes_objetivo = periodo.fecha_inicio.month
    anio_objetivo = periodo.fecha_inicio.year

    features = feature_engineering.obtener_features_para_prediccion(
        datos.insumo_id, anio_objetivo, mes_objetivo, dataset
    )

    cantidad_proyectada = predictor.predecir(datos.insumo_id, features)

    # Margen de variabilidad estimado (mayor si es referencial)
    margen = cantidad_proyectada * (Decimal("0.25") if es_referencial else Decimal("0.10"))
    stock_sugerido = max(Decimal("0.00"), (cantidad_proyectada + margen) - insumo.stock_actual)

    prediccion = PrediccionDemanda(
        insumo_id=datos.insumo_id,
        periodo_id=datos.periodo_id,
        cantidad_proyectada=cantidad_proyectada,
        margen_variabilidad=margen,
        stock_sugerido_compra=stock_sugerido,
        fecha_generacion=datetime.now(timezone.utc),
    )
    db.add(prediccion)
    await db.flush()
    await db.refresh(prediccion)

    await bitacora_service.registrar(
        db, usuario_id=usuario_id, accion="GENERAR_PREDICCION_ML", modulo="Predicciones",
        detalle={
            "id_prediccion": prediccion.id_prediccion,
            "insumo_id": datos.insumo_id,
            "proyectada": float(cantidad_proyectada),
            "es_referencial": es_referencial,
        }
    )

    resp = PrediccionDemandaResponse.model_validate(prediccion)
    resp.es_referencial = es_referencial
    return resp


async def historial(
    db: AsyncSession, insumo_id: int
) -> list[PrediccionDemandaResponse]:
    repo = PrediccionRepository(db)
    preds = await repo.listar_por_insumo(insumo_id)
    return [PrediccionDemandaResponse.model_validate(p) for p in preds]
