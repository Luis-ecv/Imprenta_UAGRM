"""
Schemas Pydantic para Proformas de Impresión.
"""
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.detalle_proforma import DetalleProformaCreate, DetalleProformaResponse


class ProformaBase(BaseModel):
    cliente_id: int
    modalidad: str  # insumos_imprenta | insumos_cliente
    dias_vigencia: int = 15


class ProformaCreate(ProformaBase):
    detalles: List[DetalleProformaCreate]


class ProformaUpdate(BaseModel):
    estado: Optional[str] = None
    dias_vigencia: Optional[int] = None


class ProformaResponse(BaseModel):
    id_proforma: int
    cliente_id: int
    usuario_id: int
    codigo_proforma: str
    modalidad: str
    total_presupuesto: Decimal
    estado: str
    fecha_emision: datetime
    fecha_vencimiento: date
    detalles: List[DetalleProformaResponse] = []

    model_config = ConfigDict(from_attributes=True)
