"""
Modelo SQLAlchemy para la tabla 'movimientos_inventario'.
Registra cada entrada, salida o ajuste de stock de un insumo.
"""
from decimal import Decimal

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models.base import Base


class MovimientoInventario(Base):
    """Movimiento de stock de un insumo (ENTRADA, SALIDA o AJUSTE)."""

    __tablename__ = "movimientos_inventario"
    __table_args__ = (
        CheckConstraint(
            "tipo_movim IN ('ENTRADA', 'SALIDA', 'AJUSTE')",
            name="ck_tipo_movim",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    insumo_id: Mapped[int] = mapped_column(ForeignKey("insumos.id"), nullable=False)
    tipo_movim: Mapped[str] = mapped_column(String(20), nullable=False)
    cantidad: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    stock_anterior: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    stock_nuevo: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    motivo: Mapped[str | None] = mapped_column(Text, nullable=True)
    usuario_id: Mapped[int | None] = mapped_column(
        ForeignKey("usuarios.id"), nullable=True
    )
    fecha_hora: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relaciones
    insumo: Mapped["Insumo"] = relationship("Insumo", back_populates="movimientos")
