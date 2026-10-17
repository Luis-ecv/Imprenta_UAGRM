"""
Modelo SQLAlchemy para la tabla 'periodo_academico'.
"""
from datetime import date
from sqlalchemy import Boolean, Date, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class PeriodoAcademico(Base):
    __tablename__ = "periodo_academico"

    id_periodo: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    gestion: Mapped[int] = mapped_column(Integer, nullable=False)
    semestre: Mapped[str] = mapped_column(String(20), nullable=False)
    fecha_inicio: Mapped[date] = mapped_column(Date, nullable=False)
    fecha_fin: Mapped[date] = mapped_column(Date, nullable=False)
    es_pico_demanda: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Relaciones
    predicciones: Mapped[list["PrediccionDemanda"]] = relationship("PrediccionDemanda", back_populates="periodo")
