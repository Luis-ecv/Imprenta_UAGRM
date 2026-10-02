"""
Modelo SQLAlchemy para la tabla 'proformas'.
Documento previo a la orden de trabajo que cotiza los servicios solicitados.
"""
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models.base import Base


class Proforma(Base):
    """Proforma de impresión: cotización previa a la orden de trabajo."""

    __tablename__ = "proformas"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    numero: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)
    cliente_id: Mapped[int] = mapped_column(ForeignKey("clientes.id"), nullable=False)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
    total: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False, default=Decimal("0")
    )
    estado: Mapped[str] = mapped_column(
        String(20), nullable=False, default="BORRADOR"
    )
    fecha_emision: Mapped[Date] = mapped_column(
        Date, nullable=False, server_default=func.current_date()
    )
    fecha_validez: Mapped[Date | None] = mapped_column(Date, nullable=True)
    observaciones: Mapped[str | None] = mapped_column(Text, nullable=True)
    creado_en: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    actualizado_en: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    # Relaciones
    cliente: Mapped["Cliente"] = relationship("Cliente", back_populates="proformas")
    detalles: Mapped[list["DetalleProforma"]] = relationship(
        "DetalleProforma", back_populates="proforma", cascade="all, delete-orphan"
    )
    ordenes: Mapped[list["OrdenTrabajo"]] = relationship(
        "OrdenTrabajo", back_populates="proforma"
    )
