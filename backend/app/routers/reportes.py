"""
Router de Reportes y Dashboards.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.permissions import require_roles
from app.core.roles import RolEnum
from app.database import get_db
from app.services import reporte_service

router = APIRouter(prefix="/reportes")


@router.get("/dashboard", summary="Métricas generales del Dashboard")
async def obtener_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.ADMIN, RolEnum.SUPERADMIN, RolEnum.MOSTRADOR, RolEnum.TALLER)),
):
    return await reporte_service.dashboard(db)


@router.get("/insumos/stock-bajo", summary="Insumos con stock bajo")
async def obtener_insumos_stock_bajo(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.ADMIN, RolEnum.SUPERADMIN, RolEnum.TALLER)),
):
    return await reporte_service.insumos_stock_bajo(db)


@router.get("/ordenes/por-estado", summary="Conteo de órdenes por estado")
async def obtener_ordenes_por_estado(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.ADMIN, RolEnum.SUPERADMIN, RolEnum.TALLER, RolEnum.MOSTRADOR)),
):
    return await reporte_service.ordenes_por_estado(db)


@router.get("/consumo/mensual", summary="Consumo mensual de insumos")
async def obtener_consumo_mensual(
    anio: int = Query(..., description="Año a consultar"),
    mes: int = Query(..., ge=1, le=12, description="Mes a consultar (1-12)"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(RolEnum.ADMIN, RolEnum.SUPERADMIN)),
):
    return await reporte_service.consumo_mensual(db, anio, mes)
