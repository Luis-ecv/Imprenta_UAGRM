"""
Schemas Pydantic para Detalle de Proforma.
"""
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict


class DetalleProformaBase(BaseModel):
    tipo_trabajo_id: int
    insumo_id: Optional[int] = None
    tarifa_id: Optional[int] = None
    descripcion_trabajo: str
    tiraje: int
    paginas_totales: int
    costo_papel: Decimal = Decimal("0.00")
    costo_tinta: Decimal = Decimal("0.00")
    costo_planchas: Decimal = Decimal("0.00")
    costo_mano_obra: Decimal = Decimal("0.00")
    subtotal: Decimal


class DetalleProformaCreate(DetalleProformaBase):
    pass


class DetalleProformaResponse(DetalleProformaBase):
    id_detalle_proforma: int
    proforma_id: int

    model_config = ConfigDict(from_attributes=True)
