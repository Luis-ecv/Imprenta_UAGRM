"""
Modelo SQLAlchemy para la tabla 'detalle_orden'.
Ítems individuales de servicio dentro de una orden de trabajo.
"""
from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class DetalleOrden(Base):
    """Ítem de servicio dentro de una orden de trabajo."""

    __tablename__ = "detalle_orden"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    orden_id: Mapped[int] = mapped_column(
        ForeignKey("ordenes_trabajo.id", ondelete="CASCADE"), nullable=False
    )
    tarifa_id: Mapped[int] = mapped_column(ForeignKey("tarifas.id"), nullable=False)
    cantidad: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    precio_unit: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relaciones
    orden: Mapped["OrdenTrabajo"] = relationship("OrdenTrabajo", back_populates="detalles")
    tarifa: Mapped["Tarifa"] = relationship("Tarifa", back_populates="detalles_orden")
