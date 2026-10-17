"""
Servicio de Órdenes de Trabajo (CU08, CU09, CU10).
Gestiona el ciclo de vida de la OT, secuencia estricta de estados y consumo real.
"""
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.correlativos import generar_codigo_ot
from app.core.exceptions import OperacionNoPermitida, RecursoNoEncontrado, TransicionEstadoInvalida
from app.models.consumo_real import ConsumoReal
from app.models.detalle_orden import DetalleOrden
from app.models.historial_estado import HistorialEstado
from app.models.insumo import Insumo
from app.models.movimiento_inventario import MovimientoInventario
from app.models.orden_trabajo import OrdenTrabajo
from app.models.proforma import Proforma
from app.repositories.orden_repository import OrdenRepository
from app.schemas.common import RespuestaPaginada
from app.schemas.consumo_real import ConsumoRealCreate, ConsumoRealResponse
from app.schemas.orden_trabajo import CambioEstadoOrden, OrdenTrabajoCreate, OrdenTrabajoResponse, OrdenTrabajoUpdate
from app.services import bitacora_service

# Secuencia obligatoria de estados de la orden de trabajo (CU09)
TRANSICIONES_VALIDAS = {
    "REGISTRADO": "EN COLA",
    "EN COLA": "EN IMPRESION",
    "EN IMPRESION": "EN ACABADO",
    "EN ACABADO": "FINALIZADO",
    "FINALIZADO": "ENTREGADO",
}


async def crear_desde_proforma(
    db: AsyncSession, usuario_id: int, datos: OrdenTrabajoCreate
) -> OrdenTrabajoResponse:
    # 1. Validar proforma
    proforma = await db.get(Proforma, datos.proforma_id)
    if not proforma:
        raise RecursoNoEncontrado("Proforma", datos.proforma_id)

    if proforma.estado in ("CERRADA", "RECHAZADA", "VENCIDA"):
        raise OperacionNoPermitida(
            f"No se puede generar Orden de Trabajo para una proforma en estado '{proforma.estado}'."
        )

    # 2. Generar correlativo OT
    codigo_ot = await generar_codigo_ot(db)

    # 3. Crear OrdenTrabajo
    orden = OrdenTrabajo(
        proforma_id=proforma.id_proforma,
        usuario_id=usuario_id,
        codigo_ot=codigo_ot,
        fecha_compromiso=datos.fecha_compromiso,
        prioridad=datos.prioridad.upper(),
        estado_actual="REGISTRADO",
        observaciones=datos.observaciones,
        created_at=datetime.now(timezone.utc),
    )
    db.add(orden)
    await db.flush()

    # 4. Crear DetalleOrden
    detalle = DetalleOrden(
        orden_id=orden.id_orden,
        formato_corte=datos.detalle_orden.formato_corte,
        tipo_encuadernacion=datos.detalle_orden.tipo_encuadernacion,
        especificaciones_taller=datos.detalle_orden.especificaciones_taller,
    )
    db.add(detalle)

    # 5. Registrar Historial inicial
    historial = HistorialEstado(
        orden_id=orden.id_orden,
        usuario_id=usuario_id,
        estado_anterior="N/A",
        estado_nuevo="REGISTRADO",
        fecha_cambio=datetime.now(timezone.utc),
    )
    db.add(historial)

    # 6. Actualizar Proforma a CERRADA (RF8)
    proforma.estado = "CERRADA"
    await db.flush()

    repo = OrdenRepository(db)
    orden_cargada = await repo.obtener_con_detalles(orden.id_orden)

    await bitacora_service.registrar(
        db, usuario_id=usuario_id, accion="CREAR_ORDEN_TRABAJO", modulo="Produccion",
        detalle={"id_orden": orden.id_orden, "codigo_ot": codigo_ot, "proforma_id": proforma.id_proforma}
    )

    return OrdenTrabajoResponse.model_validate(orden_cargada)


async def cambiar_estado(
    db: AsyncSession, usuario_id: int, id_orden: int, datos: CambioEstadoOrden
) -> OrdenTrabajoResponse:
    repo = OrdenRepository(db)
    orden = await repo.obtener_con_detalles(id_orden)
    if not orden:
        raise RecursoNoEncontrado("OrdenTrabajo", id_orden)

    actual = orden.estado_actual.upper()
    destino = datos.estado_nuevo.upper()

    siguiente_permitido = TRANSICIONES_VALIDAS.get(actual)
    if siguiente_permitido != destino:
        raise TransicionEstadoInvalida(actual, destino)

    orden.estado_actual = destino

    historial = HistorialEstado(
        orden_id=orden.id_orden,
        usuario_id=usuario_id,
        estado_anterior=actual,
        estado_nuevo=destino,
        fecha_cambio=datetime.now(timezone.utc),
    )
    db.add(historial)
    await db.flush()
    await db.refresh(orden)

    await bitacora_service.registrar(
        db, usuario_id=usuario_id, accion="AVANZAR_ESTADO_OT", modulo="Produccion",
        detalle={"id_orden": id_orden, "estado_anterior": actual, "estado_nuevo": destino}
    )

    return OrdenTrabajoResponse.model_validate(orden)


async def registrar_consumo_real(
    db: AsyncSession, usuario_id: int, datos: ConsumoRealCreate
) -> ConsumoRealResponse:
    repo = OrdenRepository(db)
    orden = await repo.obtener_por_id(datos.orden_id)
    if not orden:
        raise RecursoNoEncontrado("OrdenTrabajo", datos.orden_id)

    # CU10: Solo permitido si la orden está finalizada o entregada
    if orden.estado_actual not in ("FINALIZADO", "ENTREGADO"):
        raise OperacionNoPermitida(
            f"El consumo real solo puede registrarse cuando la orden está 'FINALIZADO' (estado actual: {orden.estado_actual})."
        )

    insumo = await db.get(Insumo, datos.insumo_id)
    if not insumo:
        raise RecursoNoEncontrado("Insumo", datos.insumo_id)

    total_descontar = datos.cantidad_utilizada + datos.cantidad_merma
    insumo.stock_actual = max(Decimal("0.00"), insumo.stock_actual - total_descontar)

    consumo = ConsumoReal(
        orden_id=datos.orden_id,
        insumo_id=datos.insumo_id,
        cantidad_utilizada=datos.cantidad_utilizada,
        cantidad_merma=datos.cantidad_merma,
        created_at=datetime.now(timezone.utc),
    )
    db.add(consumo)

    movimiento = MovimientoInventario(
        insumo_id=insumo.id_insumo,
        usuario_id=usuario_id,
        tipo_movimiento="CONSUMO_PRODUCCION",
        cantidad=total_descontar,
        saldo_resultante=insumo.stock_actual,
        referencia=f"OT: {orden.codigo_ot}",
        created_at=datetime.now(timezone.utc),
    )
    db.add(movimiento)

    await db.flush()
    await db.refresh(consumo)

    await bitacora_service.registrar(
        db, usuario_id=usuario_id, accion="REGISTRO_CONSUMO_REAL", modulo="Produccion",
        detalle={
            "orden_id": datos.orden_id,
            "insumo_id": datos.insumo_id,
            "utilizado": float(datos.cantidad_utilizada),
            "merma": float(datos.cantidad_merma),
        }
    )

    return ConsumoRealResponse.model_validate(consumo)


async def obtener(db: AsyncSession, id_orden: int) -> OrdenTrabajoResponse:
    repo = OrdenRepository(db)
    orden = await repo.obtener_con_detalles(id_orden)
    if not orden:
        raise RecursoNoEncontrado("OrdenTrabajo", id_orden)
    return OrdenTrabajoResponse.model_validate(orden)


async def listar(
    db: AsyncSession, pagina: int = 1, por_pagina: int = 20, estado: str | None = None
) -> RespuestaPaginada[OrdenTrabajoResponse]:
    query = select(OrdenTrabajo).options(
        selectinload(OrdenTrabajo.detalles_orden),
        selectinload(OrdenTrabajo.historial),
    )
    count_query = select(func.count()).select_from(OrdenTrabajo)

    if estado is not None:
        query = query.where(OrdenTrabajo.estado_actual == estado.upper())
        count_query = count_query.where(OrdenTrabajo.estado_actual == estado.upper())

    total_res = await db.execute(count_query)
    total = total_res.scalar_one()

    offset = (pagina - 1) * por_pagina
    query = query.order_by(OrdenTrabajo.created_at.desc()).offset(offset).limit(por_pagina)
    res = await db.execute(query)
    ordenes = list(res.scalars().all())

    return RespuestaPaginada[OrdenTrabajoResponse](
        total=total,
        pagina=pagina,
        por_pagina=por_pagina,
        datos=[OrdenTrabajoResponse.model_validate(o) for o in ordenes],
    )
