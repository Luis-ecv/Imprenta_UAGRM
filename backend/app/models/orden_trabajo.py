"""
Modelo SQLAlchemy para la tabla 'ordenes_trabajo'.
Documento principal que controla el ciclo de vida de un trabajo de impresión.
"""
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models.base import Base


class OrdenTrabajo(Base):
    """Orden de trabajo: documento que controla la producción de impresión."""

    __tablename__ = "ordenes_trabajo"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    numero: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)
    proforma_id: Mapped[int | None] = mapped_column(
        ForeignKey("proformas.id"), nullable=True
    )
    cliente_id: Mapped[int] = mapped_column(ForeignKey("clientes.id"), nullable=False)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"), nullable=False)
    descripcion: Mapped[str] = mapped_column(Text, nullable=False)
    estado: Mapped[str] = mapped_column(
        String(20), nullable=False, default="PENDIENTE"
    )
    fecha_inicio: Mapped[Date | None] = mapped_column(Date, nullable=True)
    fecha_entrega: Mapped[Date | None] = mapped_column(Date, nullable=True)
    total: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False, default=Decimal("0")
    )
    observaciones: Mapped[str | None] = mapped_column(Text, nullable=True)
    creado_en: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    actualizado_en: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    # Relaciones
    cliente: Mapped["Cliente"] = relationship("Cliente", back_populates="ordenes")
    proforma: Mapped["Proforma | None"] = relationship(
        "Proforma", back_populates="ordenes"
    )
    detalles: Mapped[list["DetalleOrden"]] = relationship(
        "DetalleOrden", back_populates="orden", cascade="all, delete-orphan"
    )
    historial_estados: Mapped[list["HistorialEstadoOrden"]] = relationship(
        "HistorialEstadoOrden", back_populates="orden"
    )
    consumos: Mapped[list["ConsumoReal"]] = relationship(
        "ConsumoReal", back_populates="orden"
    )
