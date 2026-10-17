"""
Servicio de Reportes y Dashboards.
Consultas agregadas y métricas del sistema.
"""
from decimal import Decimal
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.consumo_real import ConsumoReal
from app.models.insumo import Insumo
from app.models.orden_trabajo import OrdenTrabajo
from app.models.proforma import Proforma


async def dashboard(db: AsyncSession) -> dict:
    # 1. Total de órdenes activas (no finalizadas ni entregadas)
    res_ordenes = await db.execute(
        select(func.count(OrdenTrabajo.id_orden)).where(
            OrdenTrabajo.estado_actual.notin_(["FINALIZADO", "ENTREGADO"])
        )
    )
    ordenes_activas = res_ordenes.scalar_one() or 0

    # 2. Insumos con stock crítico
    res_insumos = await db.execute(
        select(func.count(Insumo.id_insumo)).where(
            Insumo.stock_actual <= Insumo.stock_minimo
        )
    )
    insumos_criticos = res_insumos.scalar_one() or 0

    # 3. Proformas emitidas pendientes
    res_proformas = await db.execute(
        select(func.count(Proforma.id_proforma)).where(
            Proforma.estado == "EMITIDA"
        )
    )
    proformas_pendientes = res_proformas.scalar_one() or 0

    # 4. Total facturado histórico / presupuesto proformas cerradas
    res_total = await db.execute(
        select(func.sum(Proforma.total_presupuesto)).where(
            Proforma.estado == "CERRADA"
        )
    )
    total_proformas = res_total.scalar_one() or Decimal("0.00")

    return {
        "ordenes_activas": ordenes_activas,
        "insumos_criticos": insumos_criticos,
        "proformas_pendientes": proformas_pendientes,
        "total_proformas_cerradas": float(total_proformas),
    }


async def insumos_stock_bajo(db: AsyncSession) -> list:
    res = await db.execute(
        select(Insumo).where(Insumo.stock_actual <= Insumo.stock_minimo)
    )
    insumos = list(res.scalars().all())
    return [
        {
            "id_insumo": i.id_insumo,
            "codigo": i.codigo,
            "descripcion": i.descripcion,
            "stock_actual": float(i.stock_actual),
            "stock_minimo": float(i.stock_minimo),
            "costo_reposicion": float(i.costo_reposicion),
            "unidad_medida": i.unidad_medida,
        }
        for i in insumos
    ]


async def ordenes_por_estado(db: AsyncSession) -> dict:
    res = await db.execute(
        select(OrdenTrabajo.estado_actual, func.count(OrdenTrabajo.id_orden))
        .group_by(OrdenTrabajo.estado_actual)
    )
    filas = res.all()
    conteo = {
        "REGISTRADO": 0,
        "EN COLA": 0,
        "EN IMPRESION": 0,
        "EN ACABADO": 0,
        "FINALIZADO": 0,
        "ENTREGADO": 0,
    }
    for estado, cant in filas:
        conteo[estado] = cant
    return conteo


async def consumo_mensual(db: AsyncSession, anio: int, mes: int) -> list:
    res = await db.execute(
        select(
            ConsumoReal.insumo_id,
            Insumo.codigo,
            Insumo.descripcion,
            func.sum(ConsumoReal.cantidad_utilizada).label("utilizado"),
            func.sum(ConsumoReal.cantidad_merma).label("merma"),
        )
        .join(Insumo, ConsumoReal.insumo_id == Insumo.id_insumo)
        .where(
            func.extract("year", ConsumoReal.created_at) == anio,
            func.extract("month", ConsumoReal.created_at) == mes,
        )
        .group_by(ConsumoReal.insumo_id, Insumo.codigo, Insumo.descripcion)
    )
    filas = res.all()
    return [
        {
            "insumo_id": row.insumo_id,
            "codigo": row.codigo,
            "descripcion": row.descripcion,
            "total_utilizado": float(row.utilizado or 0),
            "total_merma": float(row.merma or 0),
        }
        for row in filas
    ]
