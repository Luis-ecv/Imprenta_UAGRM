"""
Modelo SQLAlchemy para la tabla 'consumo_real'.
"""
from datetime import datetime
from decimal import Decimal
from sqlalchemy import DateTime, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.models.base import Base


class ConsumoReal(Base):
    __tablename__ = "consumo_real"

    id_consumo: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    orden_id: Mapped[int] = mapped_column(
        ForeignKey("orden_trabajo.id_orden", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False
    )
    insumo_id: Mapped[int] = mapped_column(
        ForeignKey("insumo.id_insumo", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False
    )
    cantidad_utilizada: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    cantidad_merma: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relaciones
    orden: Mapped["OrdenTrabajo"] = relationship("OrdenTrabajo", back_populates="consumos")
    insumo: Mapped["Insumo"] = relationship("Insumo", back_populates="consumos")
