"""
Re-export y alias de Orden de Compra para compatibilidad.
"""
from app.schemas.orden_compra import (
    OrdenCompraCreate as CompraCreate,
    OrdenCompraResponse as CompraResponse,
    OrdenCompraUpdate as CompraUpdate,
    OrdenCompraCreate,
    OrdenCompraResponse,
    OrdenCompraUpdate,
)

__all__ = [
    "CompraCreate",
    "CompraResponse",
    "CompraUpdate",
    "OrdenCompraCreate",
    "OrdenCompraResponse",
    "OrdenCompraUpdate",
]
