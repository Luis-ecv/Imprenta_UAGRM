"""
Router de Clientes.
CRUD de clientes institucionales de la imprenta.
"""
from fastapi import APIRouter, Depends
from app.core.permissions import require_roles
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import get_current_user
from app.database import get_db
from app.schemas.cliente import ClienteCreate, ClienteResponse, ClienteUpdate
from app.schemas.common import RespuestaExito, RespuestaPaginada

router = APIRouter(prefix="/clientes")


@router.get("", response_model=RespuestaPaginada[ClienteResponse], summary="Listar clientes")
async def listar_clientes(
    pagina: int = 1,
    por_pagina: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Retorna la lista paginada de clientes registrados."""
    # TODO: implementar llamada a cliente_service.listar(db, pagina, por_pagina)
    pass


@router.post("", response_model=ClienteResponse, status_code=201, summary="Registrar cliente")
async def crear_cliente(
    datos: ClienteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Registra un nuevo cliente institucional."""
    # TODO: implementar llamada a cliente_service.crear(db, datos)
    pass


@router.get("/{cliente_id}", response_model=ClienteResponse, summary="Obtener cliente")
async def obtener_cliente(
    cliente_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Retorna los datos de un cliente por su ID."""
    # TODO: implementar llamada a cliente_service.obtener(db, cliente_id)
    pass


@router.put("/{cliente_id}", response_model=ClienteResponse, summary="Actualizar cliente")
async def actualizar_cliente(
    cliente_id: int,
    datos: ClienteUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Actualiza los datos de un cliente existente."""
    # TODO: implementar llamada a cliente_service.actualizar(db, cliente_id, datos)
    pass


@router.delete("/{cliente_id}", response_model=RespuestaExito, summary="Desactivar cliente")
async def desactivar_cliente(
    cliente_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("ADMIN", "SUPERADMIN")),
):
    """Desactiva (baja lógica) un cliente."""
    # TODO: implementar llamada a cliente_service.desactivar(db, cliente_id)
    pass
