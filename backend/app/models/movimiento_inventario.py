"""
Modelo SQLAlchemy para la tabla 'movimiento_inventario'.
"""
from datetime import datetime
from decimal import Decimal
from sqlalchemy import DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.models.base import Base


class MovimientoInventario(Base):
    __tablename__ = "movimiento_inventario"

    id_movimiento: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    insumo_id: Mapped[int] = mapped_column(
        ForeignKey("insumo.id_insumo", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False
    )
    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuario.id_usuario", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False
    )
    tipo_movimiento: Mapped[str] = mapped_column(String(40), nullable=False)
    cantidad: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    saldo_resultante: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    referencia: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relaciones
    insumo: Mapped["Insumo"] = relationship("Insumo", back_populates="movimientos")
    usuario: Mapped["Usuario"] = relationship("Usuario", back_populates="movimientos")
