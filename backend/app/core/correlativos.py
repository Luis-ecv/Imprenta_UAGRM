"""
Generador de códigos correlativos anuales estandarizados.
Formato: PREFIJO-AÑO-SECUENCIAL (ej. PRF-2026-00001, OT-2026-00001, OC-2026-00001).
"""
from datetime import datetime
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.proforma import Proforma
from app.models.orden_trabajo import OrdenTrabajo
from app.models.orden_compra import OrdenCompra


async def generar_codigo_proforma(db: AsyncSession, anio: int | None = None) -> str:
    """Genera el próximo correlativo de Proforma (PRF-YYYY-#####)."""
    if anio is None:
        anio = datetime.now().year
    prefijo = f"PRF-{anio}-"
    
    query = select(Proforma.codigo_proforma).where(
        Proforma.codigo_proforma.like(f"{prefijo}%")
    ).order_by(Proforma.codigo_proforma.desc()).limit(1)
    
    result = await db.execute(query)
    ultimo = result.scalar_one_or_none()
    
    if ultimo:
        try:
            ultimo_num = int(ultimo.split("-")[-1])
            siguiente = ultimo_num + 1
        except (ValueError, IndexError):
            siguiente = 1
    else:
        siguiente = 1
        
    return f"{prefijo}{siguiente:05d}"


async def generar_codigo_ot(db: AsyncSession, anio: int | None = None) -> str:
    """Genera el próximo correlativo de Orden de Trabajo (OT-YYYY-#####)."""
    if anio is None:
        anio = datetime.now().year
    prefijo = f"OT-{anio}-"
    
    query = select(OrdenTrabajo.codigo_ot).where(
        OrdenTrabajo.codigo_ot.like(f"{prefijo}%")
    ).order_by(OrdenTrabajo.codigo_ot.desc()).limit(1)
    
    result = await db.execute(query)
    ultimo = result.scalar_one_or_none()
    
    if ultimo:
        try:
            ultimo_num = int(ultimo.split("-")[-1])
            siguiente = ultimo_num + 1
        except (ValueError, IndexError):
            siguiente = 1
    else:
        siguiente = 1
        
    return f"{prefijo}{siguiente:05d}"


async def generar_codigo_oc(db: AsyncSession, anio: int | None = None) -> str:
    """Genera el próximo correlativo de Orden de Compra (OC-YYYY-#####)."""
    if anio is None:
        anio = datetime.now().year
    prefijo = f"OC-{anio}-"
    
    query = select(func.count(OrdenCompra.id_orden_compra))
    result = await db.execute(query)
    total = result.scalar_one() or 0
    return f"{prefijo}{total + 1:05d}"
