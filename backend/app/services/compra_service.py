"""
Servicio de Órdenes de Compra (CU12).
"""
from datetime import date
from decimal import Decimal
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import RecursoNoEncontrado
from app.models.orden_compra import OrdenCompra
from app.models.proveedor import Proveedor
from app.models.prediccion_demanda import PrediccionDemanda
from app.repositories.orden_compra_repository import OrdenCompraRepository
from app.schemas.common import RespuestaPaginada
from app.schemas.orden_compra import OrdenCompraCreate, OrdenCompraResponse, OrdenCompraUpdate
from app.services import bitacora_service


async def listar(
    db: AsyncSession, pagina: int = 1, por_pagina: int = 20
) -> RespuestaPaginada[OrdenCompraResponse]:
    query = select(OrdenCompra)
    count_query = select(func.count()).select_from(OrdenCompra)

    total_res = await db.execute(count_query)
    total = total_res.scalar_one()

    offset = (pagina - 1) * por_pagina
    query = query.order_by(OrdenCompra.fecha_generacion.desc()).offset(offset).limit(por_pagina)
    res = await db.execute(query)
    compras = list(res.scalars().all())

    return RespuestaPaginada[OrdenCompraResponse](
        total=total,
        pagina=pagina,
        por_pagina=por_pagina,
        datos=[OrdenCompraResponse.model_validate(c) for c in compras],
    )


async def crear(
    db: AsyncSession, datos: OrdenCompraCreate, usuario_id: int = 1
) -> OrdenCompraResponse:
    proveedor = await db.get(Proveedor, datos.proveedor_id)
    if not proveedor:
        raise RecursoNoEncontrado("Proveedor", datos.proveedor_id)

    if datos.prediccion_id is not None:
        pred = await db.get(PrediccionDemanda, datos.prediccion_id)
        if not pred:
            raise RecursoNoEncontrado("PrediccionDemanda", datos.prediccion_id)

    compra = OrdenCompra(
        proveedor_id=datos.proveedor_id,
        prediccion_id=datos.prediccion_id,
        total_estimado=datos.total_estimado,
        fecha_generacion=date.today(),
        estado=datos.estado.upper(),
    )
    db.add(compra)
    await db.flush()
    await db.refresh(compra)

    await bitacora_service.registrar(
        db, usuario_id=usuario_id, accion="CREAR_ORDEN_COMPRA", modulo="Compras",
        detalle={"id_orden_compra": compra.id_orden_compra, "proveedor_id": compra.proveedor_id}
    )

    return OrdenCompraResponse.model_validate(compra)


async def obtener(db: AsyncSession, id_orden_compra: int) -> OrdenCompraResponse:
    repo = OrdenCompraRepository(db)
    compra = await repo.obtener_con_relaciones(id_orden_compra)
    if not compra:
        raise RecursoNoEncontrado("OrdenCompra", id_orden_compra)
    return OrdenCompraResponse.model_validate(compra)


async def actualizar(
    db: AsyncSession, id_orden_compra: int, datos: OrdenCompraUpdate, usuario_id: int = 1
) -> OrdenCompraResponse:
    compra = await db.get(OrdenCompra, id_orden_compra)
    if not compra:
        raise RecursoNoEncontrado("OrdenCompra", id_orden_compra)

    if datos.estado:
        compra.estado = datos.estado.upper()
    if datos.total_estimado is not None:
        compra.total_estimado = datos.total_estimado

    await db.flush()
    await db.refresh(compra)

    await bitacora_service.registrar(
        db, usuario_id=usuario_id, accion="ACTUALIZAR_ORDEN_COMPRA", modulo="Compras",
        detalle={"id_orden_compra": id_orden_compra, "estado": compra.estado}
    )

    return OrdenCompraResponse.model_validate(compra)
