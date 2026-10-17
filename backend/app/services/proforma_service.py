"""
Servicio de Proformas de Impresión (CU06, CU07).
Calculadora paramétrica con soporte de dos modalidades:
  - insumos_imprenta: cotiza papel + tinta + planchas + mano de obra.
  - insumos_cliente: excluye papel; solo mano de obra, planchas y acabados.
"""
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.correlativos import generar_codigo_proforma
from app.core.exceptions import OperacionNoPermitida, RecursoNoEncontrado
from app.models.detalle_proforma import DetalleProforma
from app.models.proforma import Proforma
from app.repositories.proforma_repository import ProformaRepository
from app.schemas.common import RespuestaPaginada
from app.schemas.proforma import ProformaCreate, ProformaResponse, ProformaUpdate
from app.services import bitacora_service


async def crear(
    db: AsyncSession, usuario_id: int, datos: ProformaCreate
) -> ProformaResponse:
    codigo = await generar_codigo_proforma(db)
    ahora = datetime.now(timezone.utc)
    dias = max(datos.dias_vigencia, 1)
    fecha_vencimiento = (ahora + timedelta(days=dias)).date()

    modalidad = datos.modalidad.strip().lower()
    if modalidad not in ("insumos_imprenta", "insumos_cliente"):
        modalidad = "insumos_imprenta"

    proforma = Proforma(
        cliente_id=datos.cliente_id,
        usuario_id=usuario_id,
        codigo_proforma=codigo,
        modalidad=modalidad,
        total_presupuesto=Decimal("0.00"),
        estado="EMITIDA",
        fecha_emision=ahora,
        fecha_vencimiento=fecha_vencimiento,
    )
    db.add(proforma)
    await db.flush()

    total_calculado = Decimal("0.00")
    detalles_db = []

    for item in datos.detalles:
        costo_papel = item.costo_papel
        if modalidad == "insumos_cliente":
            costo_papel = Decimal("0.00")

        subtotal = costo_papel + item.costo_tinta + item.costo_planchas + item.costo_mano_obra
        total_calculado += subtotal

        det = DetalleProforma(
            proforma_id=proforma.id_proforma,
            tipo_trabajo_id=item.tipo_trabajo_id,
            insumo_id=item.insumo_id,
            tarifa_id=item.tarifa_id,
            descripcion_trabajo=item.descripcion_trabajo,
            tiraje=item.tiraje,
            paginas_totales=item.paginas_totales,
            costo_papel=costo_papel,
            costo_tinta=item.costo_tinta,
            costo_planchas=item.costo_planchas,
            costo_mano_obra=item.costo_mano_obra,
            subtotal=subtotal,
        )
        db.add(det)
        detalles_db.append(det)

    proforma.total_presupuesto = total_calculado
    await db.flush()
    await db.refresh(proforma)

    repo = ProformaRepository(db)
    proforma_cargada = await repo.obtener_con_detalles(proforma.id_proforma)

    await bitacora_service.registrar(
        db, usuario_id=usuario_id, accion="EMITIR_PROFORMA", modulo="Produccion",
        detalle={"id_proforma": proforma.id_proforma, "codigo": codigo, "total": float(total_calculado)}
    )

    return ProformaResponse.model_validate(proforma_cargada)


async def obtener(db: AsyncSession, id_proforma: int) -> ProformaResponse:
    repo = ProformaRepository(db)
    proforma = await repo.obtener_con_detalles(id_proforma)
    if not proforma:
        raise RecursoNoEncontrado("Proforma", id_proforma)
    return ProformaResponse.model_validate(proforma)


async def listar(
    db: AsyncSession, pagina: int = 1, por_pagina: int = 20, cliente_id: int | None = None, estado: str | None = None
) -> RespuestaPaginada[ProformaResponse]:
    query = select(Proforma).options(selectinload(Proforma.detalles))
    count_query = select(func.count()).select_from(Proforma)

    if cliente_id is not None:
        query = query.where(Proforma.cliente_id == cliente_id)
        count_query = count_query.where(Proforma.cliente_id == cliente_id)
    if estado is not None:
        query = query.where(Proforma.estado == estado.upper())
        count_query = count_query.where(Proforma.estado == estado.upper())

    total_res = await db.execute(count_query)
    total = total_res.scalar_one()

    offset = (pagina - 1) * por_pagina
    query = query.order_by(Proforma.fecha_emision.desc()).offset(offset).limit(por_pagina)
    res = await db.execute(query)
    proformas = list(res.scalars().all())

    return RespuestaPaginada[ProformaResponse](
        total=total,
        pagina=pagina,
        por_pagina=por_pagina,
        datos=[ProformaResponse.model_validate(p) for p in proformas],
    )


async def cambiar_estado(
    db: AsyncSession, id_proforma: int, nuevo_estado: str, usuario_id: int = 1
) -> ProformaResponse:
    repo = ProformaRepository(db)
    proforma = await repo.obtener_con_detalles(id_proforma)
    if not proforma:
        raise RecursoNoEncontrado("Proforma", id_proforma)

    estado_destino = nuevo_estado.upper()
    proforma.estado = estado_destino
    await db.flush()
    await db.refresh(proforma)

    await bitacora_service.registrar(
        db, usuario_id=usuario_id, accion="CAMBIAR_ESTADO_PROFORMA", modulo="Produccion",
        detalle={"id_proforma": id_proforma, "nuevo_estado": estado_destino}
    )

    return ProformaResponse.model_validate(proforma)
