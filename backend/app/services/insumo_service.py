"""
Servicio de Insumos e Inventario (CU03, CU04, CU05).
"""
from decimal import Decimal
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import ConflictoRegistro, RecursoNoEncontrado, StockInsuficiente
from app.models.categoria_insumo import CategoriaInsumo
from app.models.insumo import Insumo
from app.models.movimiento_inventario import MovimientoInventario
from app.repositories.insumo_repository import InsumoRepository
from app.schemas.common import RespuestaPaginada
from app.schemas.categoria_insumo import CategoriaInsumoCreate, CategoriaInsumoResponse
from app.schemas.insumo import (
    InsumoCreate,
    InsumoResponse,
    InsumoUpdate,
    MovimientoInventarioCreate,
    MovimientoInventarioResponse,
)
from app.services import bitacora_service


async def listar(
    db: AsyncSession, pagina: int = 1, por_pagina: int = 20, categoria_id: int | None = None
) -> RespuestaPaginada[InsumoResponse]:
    query = select(Insumo).options(selectinload(Insumo.categoria))
    count_query = select(func.count()).select_from(Insumo)

    if categoria_id is not None:
        query = query.where(Insumo.categoria_id == categoria_id)
        count_query = count_query.where(Insumo.categoria_id == categoria_id)

    total_res = await db.execute(count_query)
    total = total_res.scalar_one()

    offset = (pagina - 1) * por_pagina
    query = query.order_by(Insumo.codigo.asc()).offset(offset).limit(por_pagina)
    res = await db.execute(query)
    insumos = list(res.scalars().all())

    datos = []
    for ins in insumos:
        resp = InsumoResponse.model_validate(ins)
        resp.alerta_stock = (ins.stock_actual <= ins.stock_minimo)
        datos.append(resp)

    return RespuestaPaginada[InsumoResponse](
        total=total,
        pagina=pagina,
        por_pagina=por_pagina,
        datos=datos,
    )


async def crear(db: AsyncSession, datos: InsumoCreate, usuario_id: int = 1) -> InsumoResponse:
    repo = InsumoRepository(db)
    existente = await repo.obtener_por_codigo(datos.codigo)
    if existente:
        raise ConflictoRegistro(f"Ya existe un insumo con el código '{datos.codigo}'.")

    nuevo_insumo = Insumo(
        categoria_id=datos.categoria_id,
        codigo=datos.codigo.strip().upper(),
        descripcion=datos.descripcion,
        stock_actual=datos.stock_actual,
        stock_minimo=datos.stock_minimo,
        costo_reposicion=datos.costo_reposicion,
        unidad_medida=datos.unidad_medida,
    )
    creado = await repo.crear(nuevo_insumo)
    insumo_con_cat = await repo.obtener_con_categoria(creado.id_insumo)

    await bitacora_service.registrar(
        db, usuario_id=usuario_id, accion="CREAR_INSUMO", modulo="Insumos",
        detalle={"id_insumo": creado.id_insumo, "codigo": creado.codigo}
    )

    resp = InsumoResponse.model_validate(insumo_con_cat)
    resp.alerta_stock = (creado.stock_actual <= creado.stock_minimo)
    return resp


async def obtener(db: AsyncSession, id_insumo: int) -> InsumoResponse:
    repo = InsumoRepository(db)
    insumo = await repo.obtener_con_categoria(id_insumo)
    if not insumo:
        raise RecursoNoEncontrado("Insumo", id_insumo)
    resp = InsumoResponse.model_validate(insumo)
    resp.alerta_stock = (insumo.stock_actual <= insumo.stock_minimo)
    return resp


async def actualizar(
    db: AsyncSession, id_insumo: int, datos: InsumoUpdate, usuario_id: int = 1
) -> InsumoResponse:
    repo = InsumoRepository(db)
    insumo = await repo.obtener_con_categoria(id_insumo)
    if not insumo:
        raise RecursoNoEncontrado("Insumo", id_insumo)

    if datos.codigo and datos.codigo != insumo.codigo:
        existente = await repo.obtener_por_codigo(datos.codigo)
        if existente:
            raise ConflictoRegistro(f"El código '{datos.codigo}' ya pertenece a otro insumo.")
        insumo.codigo = datos.codigo.strip().upper()

    if datos.categoria_id is not None:
        insumo.categoria_id = datos.categoria_id
    if datos.descripcion is not None:
        insumo.descripcion = datos.descripcion
    if datos.stock_minimo is not None:
        insumo.stock_minimo = datos.stock_minimo
    if datos.costo_reposicion is not None:
        insumo.costo_reposicion = datos.costo_reposicion
    if datos.unidad_medida is not None:
        insumo.unidad_medida = datos.unidad_medida

    await db.flush()
    await db.refresh(insumo)

    await bitacora_service.registrar(
        db, usuario_id=usuario_id, accion="ACTUALIZAR_INSUMO", modulo="Insumos",
        detalle={"id_insumo": insumo.id_insumo}
    )

    resp = InsumoResponse.model_validate(insumo)
    resp.alerta_stock = (insumo.stock_actual <= insumo.stock_minimo)
    return resp


async def registrar_movimiento(
    db: AsyncSession, usuario_id: int, datos: MovimientoInventarioCreate
) -> MovimientoInventarioResponse:
    repo = InsumoRepository(db)
    insumo = await repo.obtener_por_id(datos.insumo_id)
    if not insumo:
        raise RecursoNoEncontrado("Insumo", datos.insumo_id)

    tipo = datos.tipo_movimiento.upper()
    stock_anterior = insumo.stock_actual

    if tipo in ("INGRESO_COMPRA", "ENTRADA"):
        nuevo_stock = stock_anterior + datos.cantidad
    elif tipo in ("DEDUCCION_ORDEN", "MERMA", "SALIDA"):
        if stock_anterior < datos.cantidad:
            raise StockInsuficiente(insumo.descripcion, float(stock_anterior), float(datos.cantidad))
        nuevo_stock = stock_anterior - datos.cantidad
    elif tipo == "AJUSTE":
        nuevo_stock = datos.cantidad
    else:
        nuevo_stock = stock_anterior + datos.cantidad

    insumo.stock_actual = nuevo_stock

    movimiento = MovimientoInventario(
        insumo_id=insumo.id_insumo,
        usuario_id=usuario_id,
        tipo_movimiento=tipo,
        cantidad=datos.cantidad,
        saldo_resultante=nuevo_stock,
        referencia=datos.referencia,
    )
    db.add(movimiento)
    await db.flush()
    await db.refresh(movimiento)

    await bitacora_service.registrar(
        db, usuario_id=usuario_id, accion="MOVIMIENTO_INVENTARIO", modulo="Inventario",
        detalle={
            "id_insumo": insumo.id_insumo,
            "tipo": tipo,
            "cantidad": float(datos.cantidad),
            "stock_anterior": float(stock_anterior),
            "nuevo_stock": float(nuevo_stock),
        }
    )

    return MovimientoInventarioResponse.model_validate(movimiento)


async def listar_categorias(db: AsyncSession) -> list[CategoriaInsumoResponse]:
    repo = InsumoRepository(db)
    cats = await repo.listar_categorias()
    return [CategoriaInsumoResponse.model_validate(c) for c in cats]


async def crear_categoria(
    db: AsyncSession, datos: CategoriaInsumoCreate, usuario_id: int = 1
) -> CategoriaInsumoResponse:
    repo = InsumoRepository(db)
    nueva = CategoriaInsumo(nombre=datos.nombre.strip(), unidad_base=datos.unidad_base.strip())
    creada = await repo.crear_categoria(nueva)
    await bitacora_service.registrar(
        db, usuario_id=usuario_id, accion="CREAR_CATEGORIA", modulo="Insumos",
        detalle={"id_categoria": creada.id_categoria, "nombre": creada.nombre}
    )
    return CategoriaInsumoResponse.model_validate(creada)
