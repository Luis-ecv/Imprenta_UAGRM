"""
Exportación unificada de los 20 modelos SQLAlchemy de la Imprenta UAGRM.
"""
from app.models.base import Base
from app.models.rol import Rol
from app.models.usuario import Usuario
from app.models.bitacora import Bitacora
from app.models.cliente import Cliente
from app.models.categoria_insumo import CategoriaInsumo
from app.models.insumo import Insumo
from app.models.proveedor import Proveedor
from app.models.insumo_proveedor import InsumoProveedor
from app.models.tarifa import Tarifa
from app.models.movimiento_inventario import MovimientoInventario
from app.models.tipo_trabajo import TipoTrabajo
from app.models.proforma import Proforma
from app.models.detalle_proforma import DetalleProforma
from app.models.orden_trabajo import OrdenTrabajo
from app.models.detalle_orden import DetalleOrden
from app.models.historial_estado import HistorialEstado
from app.models.consumo_real import ConsumoReal
from app.models.periodo_academico import PeriodoAcademico
from app.models.prediccion_demanda import PrediccionDemanda
from app.models.orden_compra import OrdenCompra

__all__ = [
    "Base",
    "Rol",
    "Usuario",
    "Bitacora",
    "Cliente",
    "CategoriaInsumo",
    "Insumo",
    "Proveedor",
    "InsumoProveedor",
    "Tarifa",
    "MovimientoInventario",
    "TipoTrabajo",
    "Proforma",
    "DetalleProforma",
    "OrdenTrabajo",
    "DetalleOrden",
    "HistorialEstado",
    "ConsumoReal",
    "PeriodoAcademico",
    "PrediccionDemanda",
    "OrdenCompra",
]
