"""
Modelo SQLAlchemy para la tabla 'insumo_proveedor'.
"""
from datetime import date
from decimal import Decimal
from sqlalchemy import Date, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.models.base import Base


class InsumoProveedor(Base):
    __tablename__ = "insumo_proveedor"

    insumo_id: Mapped[int] = mapped_column(
        ForeignKey("insumo.id_insumo", onupdate="CASCADE", ondelete="RESTRICT"), primary_key=True
    )
    proveedor_id: Mapped[int] = mapped_column(
        ForeignKey("proveedor.id_proveedor", onupdate="CASCADE", ondelete="RESTRICT"), primary_key=True
    )
    precio_cotizado: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    fecha_cotizacion: Mapped[date] = mapped_column(Date, nullable=False, server_default=func.current_date())

    # Relaciones
    insumo: Mapped["Insumo"] = relationship("Insumo", back_populates="proveedores")
    proveedor: Mapped["Proveedor"] = relationship("Proveedor", back_populates="insumos_ofertados")
