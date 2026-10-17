"""
Servicio de Clientes y Facultades.
"""
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import RecursoNoEncontrado
from app.models.cliente import Cliente
from app.repositories.cliente_repository import ClienteRepository
from app.schemas.cliente import ClienteCreate, ClienteResponse, ClienteUpdate
from app.schemas.common import RespuestaPaginada
from app.services import bitacora_service


async def listar(
    db: AsyncSession, pagina: int = 1, por_pagina: int = 20, busqueda: str | None = None
) -> RespuestaPaginada[ClienteResponse]:
    query = select(Cliente)
    count_query = select(func.count()).select_from(Cliente)

    if busqueda:
        filtro = f"%{busqueda.strip()}%"
        query = query.where(Cliente.razon_social.ilike(filtro) | Cliente.codigo_facultad.ilike(filtro))
        count_query = count_query.where(Cliente.razon_social.ilike(filtro) | Cliente.codigo_facultad.ilike(filtro))

    total_res = await db.execute(count_query)
    total = total_res.scalar_one()

    offset = (pagina - 1) * por_pagina
    query = query.order_by(Cliente.razon_social.asc()).offset(offset).limit(por_pagina)
    res = await db.execute(query)
    clientes = list(res.scalars().all())

    return RespuestaPaginada[ClienteResponse](
        total=total,
        pagina=pagina,
        por_pagina=por_pagina,
        datos=[ClienteResponse.model_validate(c) for c in clientes],
    )


async def crear(db: AsyncSession, datos: ClienteCreate, usuario_id: int = 1) -> ClienteResponse:
    repo = ClienteRepository(db)
    nuevo = Cliente(
        tipo_cliente=datos.tipo_cliente,
        razon_social=datos.razon_social,
        telefono=datos.telefono,
        email=datos.email,
        direccion=datos.direccion,
        codigo_facultad=datos.codigo_facultad,
        dependencia=datos.dependencia,
        ci_nit=datos.ci_nit,
    )
    creado = await repo.crear(nuevo)
    await bitacora_service.registrar(
        db, usuario_id=usuario_id, accion="CREAR_CLIENTE", modulo="Clientes",
        detalle={"id_cliente": creado.id_cliente, "razon_social": creado.razon_social}
    )
    return ClienteResponse.model_validate(creado)


async def obtener(db: AsyncSession, id_cliente: int) -> ClienteResponse:
    repo = ClienteRepository(db)
    cliente = await repo.obtener_por_id(id_cliente)
    if not cliente:
        raise RecursoNoEncontrado("Cliente", id_cliente)
    return ClienteResponse.model_validate(cliente)


async def actualizar(
    db: AsyncSession, id_cliente: int, datos: ClienteUpdate, usuario_id: int = 1
) -> ClienteResponse:
    repo = ClienteRepository(db)
    cliente = await repo.obtener_por_id(id_cliente)
    if not cliente:
        raise RecursoNoEncontrado("Cliente", id_cliente)

    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(cliente, campo, valor)

    await db.flush()
    await db.refresh(cliente)

    await bitacora_service.registrar(
        db, usuario_id=usuario_id, accion="ACTUALIZAR_CLIENTE", modulo="Clientes",
        detalle={"id_cliente": id_cliente}
    )
    return ClienteResponse.model_validate(cliente)
