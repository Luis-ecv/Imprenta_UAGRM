"""
Modelo SQLAlchemy para la tabla 'proforma'.
"""
from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.models.base import Base


class Proforma(Base):
    __tablename__ = "proforma"

    id_proforma: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    cliente_id: Mapped[int] = mapped_column(
        ForeignKey("cliente.id_cliente", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False
    )
    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuario.id_usuario", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False
    )
    codigo_proforma: Mapped[str] = mapped_column(String(30), nullable=False, unique=True)
    modalidad: Mapped[str] = mapped_column(String(50), nullable=False)
    total_presupuesto: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    estado: Mapped[str] = mapped_column(String(30), nullable=False, default="EMITIDA")
    fecha_emision: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    fecha_vencimiento: Mapped[date] = mapped_column(Date, nullable=False)

    # Relaciones
    cliente: Mapped["Cliente"] = relationship("Cliente", back_populates="proformas")
    usuario: Mapped["Usuario"] = relationship("Usuario", back_populates="proformas")
    detalles: Mapped[list["DetalleProforma"]] = relationship(
        "DetalleProforma", back_populates="proforma", cascade="all, delete-orphan"
    )
    orden_trabajo: Mapped["OrdenTrabajo"] = relationship("OrdenTrabajo", back_populates="proforma", uselist=False)
