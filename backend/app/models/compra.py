"""
Modelo SQLAlchemy para la tabla 'ordenes_compra'.
Gestiona las compras de insumos a proveedores.
"""
from decimal import Decimal

from sqlalchemy import CheckConstraint, Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models.base import Base


class Compra(Base):
    """Orden de compra de insumos a un proveedor."""

    __tablename__ = "ordenes_compra"
    __table_args__ = (
        CheckConstraint(
            "estado IN ('PENDIENTE', 'APROBADA', 'RECIBIDA', 'CANCELADA')",
            name="ck_estado_compra",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    numero: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)
    proveedor_id: Mapped[int] = mapped_column(ForeignKey("proveedores.id"), nullable=False)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"), nullable=False)
    estado: Mapped[str] = mapped_column(
        String(20), nullable=False, default="PENDIENTE"
    )
    total: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False, default=Decimal("0")
    )
    fecha_emision: Mapped[Date] = mapped_column(
        Date, nullable=False, server_default=func.current_date()
    )
    fecha_recepcion: Mapped[Date | None] = mapped_column(Date, nullable=True)
    observaciones: Mapped[str | None] = mapped_column(Text, nullable=True)
    creado_en: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    actualizado_en: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    # Relaciones
    proveedor: Mapped["Proveedor"] = relationship("Proveedor", back_populates="compras")
    detalles: Mapped[list["DetalleCompra"]] = relationship(
        "DetalleCompra", back_populates="compra", cascade="all, delete-orphan"
    )
