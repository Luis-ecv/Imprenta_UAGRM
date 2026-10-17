"""
Router de Clientes.
CRUD de clientes institucionales y particulares de la UAGRM.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.permissions import get_current_user, require_roles
from app.core.roles import RolEnum
from app.database import get_db
from app.schemas.cliente import ClienteCreate, ClienteResponse, ClienteUpdate
from app.schemas.common import RespuestaPaginada
from app.services import cliente_service

router = APIRouter(prefix="/clientes")


@router.get("", response_model=RespuestaPaginada[ClienteResponse], summary="Listar clientes")
async def listar_clientes(
    pagina: int = 1,
    por_pagina: int = 20,
    busqueda: str | None = Query(default=None, description="Buscar por razón social o sigla"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await cliente_service.listar(db, pagina, por_pagina, busqueda)


@router.post("", response_model=ClienteResponse, status_code=201, summary="Registrar cliente")
async def crear_cliente(
    datos: ClienteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.ADMIN, RolEnum.SUPERADMIN, RolEnum.MOSTRADOR)),
):
    usuario_id = current_user.get("id_usuario", 1)
    return await cliente_service.crear(db, datos, usuario_id)


@router.get("/{cliente_id}", response_model=ClienteResponse, summary="Obtener cliente")
async def obtener_cliente(
    cliente_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await cliente_service.obtener(db, cliente_id)


@router.put("/{cliente_id}", response_model=ClienteResponse, summary="Actualizar cliente")
async def actualizar_cliente(
    cliente_id: int,
    datos: ClienteUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.ADMIN, RolEnum.SUPERADMIN, RolEnum.MOSTRADOR)),
):
    usuario_id = current_user.get("id_usuario", 1)
    return await cliente_service.actualizar(db, cliente_id, datos, usuario_id)
