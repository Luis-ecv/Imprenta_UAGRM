"""
Modelo SQLAlchemy para la tabla 'prediccion_demanda'.
"""
from datetime import datetime
from decimal import Decimal
from sqlalchemy import DateTime, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.models.base import Base


class PrediccionDemanda(Base):
    __tablename__ = "prediccion_demanda"

    id_prediccion: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    insumo_id: Mapped[int] = mapped_column(
        ForeignKey("insumo.id_insumo", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False
    )
    periodo_id: Mapped[int] = mapped_column(
        ForeignKey("periodo_academico.id_periodo", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False
    )
    cantidad_proyectada: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    margen_variabilidad: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    stock_sugerido_compra: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    fecha_generacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relaciones
    insumo: Mapped["Insumo"] = relationship("Insumo", back_populates="predicciones")
    periodo: Mapped["PeriodoAcademico"] = relationship("PeriodoAcademico", back_populates="predicciones")
    ordenes_compra: Mapped[list["OrdenCompra"]] = relationship("OrdenCompra", back_populates="prediccion")
