"""
Router de Proveedores.
CRUD de proveedores de insumos de la imprenta.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import get_current_user, require_roles
from app.database import get_db
from app.schemas.common import RespuestaExito, RespuestaPaginada
from app.schemas.proveedor import ProveedorCreate, ProveedorResponse, ProveedorUpdate

router = APIRouter(prefix="/proveedores")


@router.get("", response_model=RespuestaPaginada[ProveedorResponse], summary="Listar proveedores")
async def listar_proveedores(
    pagina: int = 1,
    por_pagina: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Retorna la lista paginada de proveedores registrados."""
    # TODO: implementar llamada a proveedor_service.listar(db, pagina, por_pagina)
    pass


@router.post("", response_model=ProveedorResponse, status_code=201, summary="Registrar proveedor")
async def crear_proveedor(
    datos: ProveedorCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("ADMIN", "SUPERADMIN", "COMPRAS")),
):
    """Registra un nuevo proveedor de insumos."""
    # TODO: implementar llamada a proveedor_service.crear(db, datos)
    pass


@router.get("/{proveedor_id}", response_model=ProveedorResponse, summary="Obtener proveedor")
async def obtener_proveedor(
    proveedor_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Retorna los datos de un proveedor por su ID."""
    # TODO: implementar llamada a proveedor_service.obtener(db, proveedor_id)
    pass


@router.put("/{proveedor_id}", response_model=ProveedorResponse, summary="Actualizar proveedor")
async def actualizar_proveedor(
    proveedor_id: int,
    datos: ProveedorUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("ADMIN", "SUPERADMIN", "COMPRAS")),
):
    """Actualiza los datos de un proveedor existente."""
    # TODO: implementar llamada a proveedor_service.actualizar(db, proveedor_id, datos)
    pass
