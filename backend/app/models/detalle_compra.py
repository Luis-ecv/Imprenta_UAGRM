"""
Modelo SQLAlchemy para la tabla 'detalle_compra'.
Ítems individuales de insumo dentro de una orden de compra.
"""
from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class DetalleCompra(Base):
    """Ítem de insumo dentro de una orden de compra."""

    __tablename__ = "detalle_compra"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    orden_compra_id: Mapped[int] = mapped_column(
        ForeignKey("ordenes_compra.id", ondelete="CASCADE"), nullable=False
    )
    insumo_id: Mapped[int] = mapped_column(ForeignKey("insumos.id"), nullable=False)
    cantidad_pedida: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    precio_unitario: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    # Relaciones
    compra: Mapped["Compra"] = relationship("Compra", back_populates="detalles")
    insumo: Mapped["Insumo"] = relationship("Insumo")
