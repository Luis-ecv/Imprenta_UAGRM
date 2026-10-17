"""
Router de Bitácora (Auditoría del sistema).
Endpoints de consulta protegidos para Superadministrador y Administrador.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.permissions import require_roles
from app.core.roles import RolEnum
from app.database import get_db
from app.schemas.bitacora import BitacoraResponse
from app.schemas.common import RespuestaPaginada
from app.services import bitacora_service

router = APIRouter(prefix="/bitacora")


@router.get("", response_model=RespuestaPaginada[BitacoraResponse], summary="Listar registros de auditoría")
async def listar_bitacora(
    pagina: int = 1,
    por_pagina: int = 50,
    usuario_id: int | None = Query(default=None, description="Filtrar por ID de usuario"),
    modulo: str | None = Query(default=None, description="Filtrar por subsistema/módulo"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.SUPERADMIN)),
):
    return await bitacora_service.listar(db, pagina, por_pagina, usuario_id, modulo)
