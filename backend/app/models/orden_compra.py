"""
Modelo SQLAlchemy para la tabla 'orden_compra'.
"""
from datetime import date
from decimal import Decimal
from sqlalchemy import Date, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.models.base import Base


class OrdenCompra(Base):
    __tablename__ = "orden_compra"

    id_orden_compra: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    proveedor_id: Mapped[int] = mapped_column(
        ForeignKey("proveedor.id_proveedor", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False
    )
    prediccion_id: Mapped[int | None] = mapped_column(
        ForeignKey("prediccion_demanda.id_prediccion", onupdate="CASCADE", ondelete="SET NULL"), nullable=True
    )
    total_estimado: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    fecha_generacion: Mapped[date] = mapped_column(Date, nullable=False, server_default=func.current_date())
    estado: Mapped[str] = mapped_column(String(30), nullable=False, default="SUGERIDA")

    # Relaciones
    proveedor: Mapped["Proveedor"] = relationship("Proveedor", back_populates="ordenes_compra")
    prediccion: Mapped["PrediccionDemanda | None"] = relationship("PrediccionDemanda", back_populates="ordenes_compra")
