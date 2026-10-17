"""
Servicio de Proveedores.
"""
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import ConflictoRegistro, RecursoNoEncontrado
from app.models.proveedor import Proveedor
from app.repositories.base_repository import BaseRepository
from app.schemas.common import RespuestaPaginada
from app.schemas.proveedor import ProveedorCreate, ProveedorResponse, ProveedorUpdate
from app.services import bitacora_service


async def listar(
    db: AsyncSession, pagina: int = 1, por_pagina: int = 20
) -> RespuestaPaginada[ProveedorResponse]:
    query = select(Proveedor)
    count_query = select(func.count()).select_from(Proveedor)

    total_res = await db.execute(count_query)
    total = total_res.scalar_one()

    offset = (pagina - 1) * por_pagina
    query = query.order_by(Proveedor.razon_social.asc()).offset(offset).limit(por_pagina)
    res = await db.execute(query)
    proveedores = list(res.scalars().all())

    return RespuestaPaginada[ProveedorResponse](
        total=total,
        pagina=pagina,
        por_pagina=por_pagina,
        datos=[ProveedorResponse.model_validate(p) for p in proveedores],
    )


async def crear(db: AsyncSession, datos: ProveedorCreate, usuario_id: int = 1) -> ProveedorResponse:
    # Verificar NIT único
    res = await db.execute(select(Proveedor).where(Proveedor.nit == datos.nit))
    if res.scalar_one_or_none():
        raise ConflictoRegistro(f"Ya existe un proveedor con el NIT '{datos.nit}'.")

    nuevo = Proveedor(
        razon_social=datos.razon_social,
        nit=datos.nit,
        contacto=datos.contacto,
        telefono=datos.telefono,
        email=datos.email,
        direccion=datos.direccion,
    )
    db.add(nuevo)
    await db.flush()
    await db.refresh(nuevo)

    await bitacora_service.registrar(
        db, usuario_id=usuario_id, accion="CREAR_PROVEEDOR", modulo="Proveedores",
        detalle={"id_proveedor": nuevo.id_proveedor, "nit": nuevo.nit}
    )
    return ProveedorResponse.model_validate(nuevo)


async def obtener(db: AsyncSession, id_proveedor: int) -> ProveedorResponse:
    proveedor = await db.get(Proveedor, id_proveedor)
    if not proveedor:
        raise RecursoNoEncontrado("Proveedor", id_proveedor)
    return ProveedorResponse.model_validate(proveedor)


async def actualizar(
    db: AsyncSession, id_proveedor: int, datos: ProveedorUpdate, usuario_id: int = 1
) -> ProveedorResponse:
    proveedor = await db.get(Proveedor, id_proveedor)
    if not proveedor:
        raise RecursoNoEncontrado("Proveedor", id_proveedor)

    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(proveedor, campo, valor)

    await db.flush()
    await db.refresh(proveedor)

    await bitacora_service.registrar(
        db, usuario_id=usuario_id, accion="ACTUALIZAR_PROVEEDOR", modulo="Proveedores",
        detalle={"id_proveedor": id_proveedor}
    )
    return ProveedorResponse.model_validate(proveedor)
