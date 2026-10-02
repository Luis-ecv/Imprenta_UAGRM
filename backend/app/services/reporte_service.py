"""
Servicio de Reportes y Dashboards.
Consultas agregadas y métricas del sistema. Solo operaciones de lectura.
"""
from sqlalchemy.ext.asyncio import AsyncSession


async def dashboard(db: AsyncSession) -> dict:
    """
    Retorna las métricas principales para el panel de control:
    - Total de órdenes activas (EN_PROCESO)
    - Insumos con stock bajo el mínimo
    - Total facturado en el mes actual
    - Cantidad de proformas pendientes de aprobación
    """
    # TODO: implementar con queries agregadas en SQLAlchemy
    pass


async def insumos_stock_bajo(db: AsyncSession) -> list:
    """Lista los insumos cuyo stock_actual < stock_minimo."""
    # TODO: implementar
    pass


async def ordenes_por_estado(db: AsyncSession) -> dict:
    """Retorna el conteo de órdenes de trabajo agrupadas por estado."""
    # TODO: implementar
    pass


async def consumo_mensual(db: AsyncSession, anio: int, mes: int) -> list:
    """
    Retorna el consumo total de cada insumo para el mes y año indicados,
    ordenado por consumo descendente.
    """
    # TODO: implementar
    pass
