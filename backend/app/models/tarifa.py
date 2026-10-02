"""
Modelo SQLAlchemy para la tabla 'tarifas'.
Define los precios de los servicios de impresión usados en proformas y órdenes.
"""
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models.base import Base


class Tarifa(Base):
    """Tarifa de un servicio de impresión (precio por unidad)."""

    __tablename__ = "tarifas"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre_servicio: Mapped[str] = mapped_column(String(100), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
    precio_unitario: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    unidad: Mapped[str] = mapped_column(String(50), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    creado_en: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relaciones
    detalles_proforma: Mapped[list["DetalleProforma"]] = relationship(
        "DetalleProforma", back_populates="tarifa"
    )
    detalles_orden: Mapped[list["DetalleOrden"]] = relationship(
        "DetalleOrden", back_populates="tarifa"
    )
