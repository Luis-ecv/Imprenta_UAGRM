"""
Modelo SQLAlchemy para la tabla 'periodos_academicos'.
Divide el año académico en períodos (semestres, trimestres).
Permite analizar la demanda de impresión por período académico.
"""
from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models.base import Base


class PeriodoAcademico(Base):
    """Período académico dentro de una gestión (semestre 1, semestre 2, etc.)."""

    __tablename__ = "periodos_academicos"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    gestion_id: Mapped[int] = mapped_column(ForeignKey("gestiones.id"), nullable=False)
    nombre: Mapped[str] = mapped_column(String(50), nullable=False)
    numero: Mapped[int] = mapped_column(Integer, nullable=False)
    fecha_inicio: Mapped[Date] = mapped_column(Date, nullable=False)
    fecha_fin: Mapped[Date] = mapped_column(Date, nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    creado_en: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relaciones
    gestion: Mapped["Gestion"] = relationship("Gestion")
