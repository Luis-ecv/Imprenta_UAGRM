"""
Modelo SQLAlchemy para la tabla 'consumo_real'.
Registra el consumo efectivo de insumos durante la ejecución de una orden.
"""
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models.base import Base


class ConsumoReal(Base):
    """Consumo real de un insumo registrado durante la ejecución de una orden."""

    __tablename__ = "consumo_real"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    orden_id: Mapped[int] = mapped_column(
        ForeignKey("ordenes_trabajo.id"), nullable=False
    )
    insumo_id: Mapped[int] = mapped_column(ForeignKey("insumos.id"), nullable=False)
    cantidad_usada: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    costo_unitario: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    costo_total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    registrado_en: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    registrado_por: Mapped[int | None] = mapped_column(
        ForeignKey("usuarios.id"), nullable=True
    )

    # Relaciones
    orden: Mapped["OrdenTrabajo"] = relationship("OrdenTrabajo", back_populates="consumos")
    insumo: Mapped["Insumo"] = relationship("Insumo", back_populates="consumos")
