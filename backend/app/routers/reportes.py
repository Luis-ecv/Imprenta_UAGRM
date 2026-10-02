"""
Router de Reportes y Dashboards.
Endpoints de solo lectura para consultas agregadas y métricas del sistema.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import get_current_user
from app.database import get_db

router = APIRouter(prefix="/reportes")


@router.get("/dashboard", summary="Datos del dashboard principal")
async def dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Retorna métricas clave del sistema para el panel principal:
    órdenes activas, insumos con stock bajo, ventas del mes, etc.
    """
    # TODO: implementar llamada a reporte_service.dashboard(db)
    pass


@router.get("/insumos/stock-bajo", summary="Insumos con stock bajo el mínimo")
async def insumos_stock_bajo(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Lista los insumos cuyo stock_actual está por debajo del stock_minimo."""
    # TODO: implementar llamada a reporte_service.insumos_stock_bajo(db)
    pass


@router.get("/ordenes/por-estado", summary="Conteo de órdenes por estado")
async def ordenes_por_estado(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Retorna el conteo de órdenes de trabajo agrupadas por estado."""
    # TODO: implementar llamada a reporte_service.ordenes_por_estado(db)
    pass


@router.get("/consumo/mensual", summary="Consumo mensual de insumos")
async def consumo_mensual(
    anio: int = Query(..., description="Año a consultar"),
    mes: int = Query(..., ge=1, le=12, description="Mes a consultar (1-12)"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Retorna el consumo total de cada insumo para el mes y año indicados."""
    # TODO: implementar llamada a reporte_service.consumo_mensual(db, anio, mes)
    pass
