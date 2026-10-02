"""
Modelo SQLAlchemy para la tabla 'predicciones_ml'.
Almacena las predicciones de demanda generadas por el modelo Random Forest.
"""
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models.base import Base


class PrediccionDemanda(Base):
    """Predicción de demanda de un insumo generada por el modelo ML."""

    __tablename__ = "predicciones_ml"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    insumo_id: Mapped[int] = mapped_column(ForeignKey("insumos.id"), nullable=False)
    periodo_inicio: Mapped[Date] = mapped_column(Date, nullable=False)
    periodo_fin: Mapped[Date] = mapped_column(Date, nullable=False)
    cantidad_predicha: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    confianza_pct: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 2), nullable=True
    )
    version_modelo: Mapped[str | None] = mapped_column(String(50), nullable=True)
    generado_en: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    generado_por: Mapped[int | None] = mapped_column(
        ForeignKey("usuarios.id"), nullable=True
    )

    # Relaciones
    insumo: Mapped["Insumo"] = relationship("Insumo", back_populates="predicciones")
