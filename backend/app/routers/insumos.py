"""
Router de Insumos e Inventario.
CRUD de insumos, categorías y movimientos de stock.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.permissions import get_current_user, require_roles
from app.core.roles import RolEnum
from app.database import get_db
from app.schemas.categoria_insumo import CategoriaInsumoCreate, CategoriaInsumoResponse
from app.schemas.common import RespuestaPaginada
from app.schemas.insumo import (
    InsumoCreate,
    InsumoResponse,
    InsumoUpdate,
    MovimientoInventarioCreate,
    MovimientoInventarioResponse,
)
from app.services import insumo_service

router = APIRouter(prefix="/insumos")


@router.get("", response_model=RespuestaPaginada[InsumoResponse], summary="Listar insumos")
async def listar_insumos(
    pagina: int = 1,
    por_pagina: int = 20,
    categoria_id: int | None = Query(default=None, description="Filtrar por categoría"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await insumo_service.listar(db, pagina, por_pagina, categoria_id)


@router.post("", response_model=InsumoResponse, status_code=201, summary="Crear insumo")
async def crear_insumo(
    datos: InsumoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.ADMIN, RolEnum.SUPERADMIN)),
):
    usuario_id = current_user.get("id_usuario", 1)
    return await insumo_service.crear(db, datos, usuario_id)


@router.get("/{insumo_id}", response_model=InsumoResponse, summary="Obtener insumo")
async def obtener_insumo(
    insumo_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await insumo_service.obtener(db, insumo_id)


@router.put("/{insumo_id}", response_model=InsumoResponse, summary="Actualizar insumo")
async def actualizar_insumo(
    insumo_id: int,
    datos: InsumoUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.ADMIN, RolEnum.SUPERADMIN)),
):
    usuario_id = current_user.get("id_usuario", 1)
    return await insumo_service.actualizar(db, insumo_id, datos, usuario_id)


@router.post(
    "/{insumo_id}/movimientos",
    response_model=MovimientoInventarioResponse,
    status_code=201,
    summary="Registrar movimiento de stock",
)
async def registrar_movimiento(
    insumo_id: int,
    datos: MovimientoInventarioCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.ADMIN, RolEnum.SUPERADMIN, RolEnum.TALLER)),
):
    usuario_id = current_user.get("id_usuario", 1)
    datos.insumo_id = insumo_id
    return await insumo_service.registrar_movimiento(db, usuario_id, datos)


@router.get("/categorias/", response_model=list[CategoriaInsumoResponse], summary="Listar categorías")
async def listar_categorias(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await insumo_service.listar_categorias(db)


@router.post("/categorias/", response_model=CategoriaInsumoResponse, status_code=201, summary="Crear categoría")
async def crear_categoria(
    datos: CategoriaInsumoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.ADMIN, RolEnum.SUPERADMIN)),
):
    usuario_id = current_user.get("id_usuario", 1)
    return await insumo_service.crear_categoria(db, datos, usuario_id)
