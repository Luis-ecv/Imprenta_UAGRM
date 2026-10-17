"""
Modelo SQLAlchemy para la tabla 'orden_trabajo'.
"""
from datetime import date, datetime
from sqlalchemy import Date, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.models.base import Base


class OrdenTrabajo(Base):
    __tablename__ = "orden_trabajo"

    id_orden: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    proforma_id: Mapped[int] = mapped_column(
        ForeignKey("proforma.id_proforma", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False, unique=True
    )
    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuario.id_usuario", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False
    )
    codigo_ot: Mapped[str] = mapped_column(String(30), nullable=False, unique=True)
    fecha_compromiso: Mapped[date] = mapped_column(Date, nullable=False)
    prioridad: Mapped[str] = mapped_column(String(20), nullable=False, default="NORMAL")
    estado_actual: Mapped[str] = mapped_column(String(30), nullable=False, default="REGISTRADO")
    observaciones: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relaciones
    proforma: Mapped["Proforma"] = relationship("Proforma", back_populates="orden_trabajo")
    usuario: Mapped["Usuario"] = relationship("Usuario", back_populates="ordenes")
    detalles_orden: Mapped[list["DetalleOrden"]] = relationship(
        "DetalleOrden", back_populates="orden", cascade="all, delete-orphan"
    )
    historial: Mapped[list["HistorialEstado"]] = relationship(
        "HistorialEstado", back_populates="orden", cascade="all, delete-orphan"
    )
    consumos: Mapped[list["ConsumoReal"]] = relationship("ConsumoReal", back_populates="orden")
