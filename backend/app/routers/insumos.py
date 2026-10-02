"""
Router de Insumos.
CRUD de insumos, categorías de insumos y movimientos de inventario.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import get_current_user, require_roles
from app.database import get_db
from app.schemas.common import RespuestaExito, RespuestaPaginada
from app.schemas.insumo import (
    CategoriaInsumoCreate,
    CategoriaInsumoResponse,
    InsumoCreate,
    InsumoResponse,
    InsumoUpdate,
    MovimientoInventarioCreate,
    MovimientoInventarioResponse,
)

router = APIRouter(prefix="/insumos")


# --- Insumos ---

@router.get("", response_model=RespuestaPaginada[InsumoResponse], summary="Listar insumos")
async def listar_insumos(
    pagina: int = 1,
    por_pagina: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Retorna la lista paginada de insumos del catálogo."""
    # TODO: implementar llamada a insumo_service.listar(db, pagina, por_pagina)
    pass


@router.post("", response_model=InsumoResponse, status_code=201, summary="Crear insumo")
async def crear_insumo(
    datos: InsumoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("ADMIN", "SUPERADMIN", "ALMACENERO")),
):
    """Registra un nuevo insumo en el catálogo."""
    # TODO: implementar llamada a insumo_service.crear(db, datos)
    pass


@router.get("/{insumo_id}", response_model=InsumoResponse, summary="Obtener insumo")
async def obtener_insumo(
    insumo_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Retorna los datos completos de un insumo por su ID."""
    # TODO: implementar llamada a insumo_service.obtener(db, insumo_id)
    pass


@router.put("/{insumo_id}", response_model=InsumoResponse, summary="Actualizar insumo")
async def actualizar_insumo(
    insumo_id: int,
    datos: InsumoUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("ADMIN", "SUPERADMIN", "ALMACENERO")),
):
    """Actualiza los datos de un insumo existente."""
    # TODO: implementar llamada a insumo_service.actualizar(db, insumo_id, datos)
    pass


# --- Movimientos de Inventario ---

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
    current_user: dict = Depends(require_roles("ADMIN", "SUPERADMIN", "ALMACENERO")),
):
    """
    Registra una entrada, salida o ajuste de stock para un insumo.
    Actualiza automáticamente el stock_actual del insumo.
    """
    # TODO: implementar llamada a insumo_service.registrar_movimiento(db, insumo_id, datos)
    pass


# --- Categorías ---

@router.get(
    "/categorias/",
    response_model=list[CategoriaInsumoResponse],
    summary="Listar categorías",
)
async def listar_categorias(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Retorna todas las categorías de insumos activas."""
    # TODO: implementar llamada a insumo_service.listar_categorias(db)
    pass


@router.post(
    "/categorias/",
    response_model=CategoriaInsumoResponse,
    status_code=201,
    summary="Crear categoría",
)
async def crear_categoria(
    datos: CategoriaInsumoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("ADMIN", "SUPERADMIN")),
):
    """Crea una nueva categoría de insumos."""
    # TODO: implementar llamada a insumo_service.crear_categoria(db, datos)
    pass
