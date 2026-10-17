"""
Servicio de Bitácora (Auditoría Inmutable).
Registra automáticamente todas las operaciones críticas del sistema.
"""
import json
from datetime import datetime, timezone
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.bitacora import Bitacora
from app.schemas.common import RespuestaPaginada
from app.schemas.bitacora import BitacoraResponse


async def registrar(
    db: AsyncSession,
    usuario_id: int,
    accion: str,
    modulo: str,
    detalle: str | dict | None = None,
    ip_origen: str = "127.0.0.1",
) -> Bitacora:
    detalle_str = json.dumps(detalle, ensure_ascii=False) if isinstance(detalle, dict) else detalle
    registro = Bitacora(
        usuario_id=usuario_id,
        accion=accion,
        modulo=modulo,
        detalle=detalle_str,
        ip_origen=ip_origen,
        created_at=datetime.now(timezone.utc),
    )
    db.add(registro)
    await db.flush()
    return registro


async def listar(
    db: AsyncSession,
    pagina: int = 1,
    por_pagina: int = 20,
    usuario_id: int | None = None,
    modulo: str | None = None,
) -> RespuestaPaginada[BitacoraResponse]:
    query = select(Bitacora)
    count_query = select(func.count()).select_from(Bitacora)

    if usuario_id is not None:
        query = query.where(Bitacora.usuario_id == usuario_id)
        count_query = count_query.where(Bitacora.usuario_id == usuario_id)
    if modulo is not None:
        query = query.where(Bitacora.modulo == modulo)
        count_query = count_query.where(Bitacora.modulo == modulo)

    total_res = await db.execute(count_query)
    total = total_res.scalar_one()

    offset = (pagina - 1) * por_pagina
    query = query.order_by(Bitacora.created_at.desc()).offset(offset).limit(por_pagina)
    res = await db.execute(query)
    registros = list(res.scalars().all())

    return RespuestaPaginada[BitacoraResponse](
        total=total,
        pagina=pagina,
        por_pagina=por_pagina,
        datos=[BitacoraResponse.model_validate(b) for b in registros],
    )
