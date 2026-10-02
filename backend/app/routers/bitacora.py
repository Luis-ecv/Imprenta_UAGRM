"""
Router de Bitácora (Auditoría del sistema).
Endpoints de solo lectura para consultar el registro de acciones críticas.
Acceso restringido a ADMIN y SUPERADMIN.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_roles
from app.database import get_db
from app.schemas.common import RespuestaPaginada

router = APIRouter(prefix="/bitacora")


@router.get("", summary="Listar registros de auditoría")
async def listar_bitacora(
    pagina: int = 1,
    por_pagina: int = 50,
    usuario_id: int | None = Query(default=None, description="Filtrar por usuario"),
    accion: str | None = Query(default=None, description="Filtrar por tipo de acción"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles("ADMIN", "SUPERADMIN")),
):
    """
    Retorna el historial paginado de acciones críticas registradas en la bitácora.
    Permite filtrar por usuario y tipo de acción.
    """
    # TODO: implementar llamada a bitacora_service.listar(db, pagina, por_pagina, usuario_id, accion)
    pass
