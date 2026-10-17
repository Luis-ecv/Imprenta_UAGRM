"""
Servicio de Tarifas de Taller y Servicios.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import RecursoNoEncontrado
from app.models.tarifa import Tarifa
from app.models.tipo_trabajo import TipoTrabajo
from app.schemas.tarifa import TarifaCreate, TarifaResponse, TarifaUpdate
from app.schemas.tipo_trabajo import TipoTrabajoCreate, TipoTrabajoResponse
from app.services import bitacora_service


async def listar(db: AsyncSession) -> list[TarifaResponse]:
    res = await db.execute(select(Tarifa).order_by(Tarifa.concepto.asc()))
    tarifas = list(res.scalars().all())
    return [TarifaResponse.model_validate(t) for t in tarifas]


async def crear(db: AsyncSession, datos: TarifaCreate, usuario_id: int = 1) -> TarifaResponse:
    tarifa = Tarifa(
        concepto=datos.concepto,
        precio_unitario=datos.precio_unitario,
        tipo_tarifa=datos.tipo_tarifa,
        vigencia_hasta=datos.vigencia_hasta,
    )
    db.add(tarifa)
    await db.flush()
    await db.refresh(tarifa)

    await bitacora_service.registrar(
        db, usuario_id=usuario_id, accion="CREAR_TARIFA", modulo="Tarifas",
        detalle={"id_tarifa": tarifa.id_tarifa, "concepto": tarifa.concepto}
    )
    return TarifaResponse.model_validate(tarifa)


async def obtener(db: AsyncSession, id_tarifa: int) -> TarifaResponse:
    tarifa = await db.get(Tarifa, id_tarifa)
    if not tarifa:
        raise RecursoNoEncontrado("Tarifa", id_tarifa)
    return TarifaResponse.model_validate(tarifa)


async def actualizar(
    db: AsyncSession, id_tarifa: int, datos: TarifaUpdate, usuario_id: int = 1
) -> TarifaResponse:
    tarifa = await db.get(Tarifa, id_tarifa)
    if not tarifa:
        raise RecursoNoEncontrado("Tarifa", id_tarifa)

    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(tarifa, campo, valor)

    await db.flush()
    await db.refresh(tarifa)

    await bitacora_service.registrar(
        db, usuario_id=usuario_id, accion="ACTUALIZAR_TARIFA", modulo="Tarifas",
        detalle={"id_tarifa": id_tarifa}
    )
    return TarifaResponse.model_validate(tarifa)


async def listar_tipos_trabajo(db: AsyncSession) -> list[TipoTrabajoResponse]:
    res = await db.execute(select(TipoTrabajo).where(TipoTrabajo.activo == True).order_by(TipoTrabajo.nombre.asc()))
    tipos = list(res.scalars().all())
    return [TipoTrabajoResponse.model_validate(t) for t in tipos]
