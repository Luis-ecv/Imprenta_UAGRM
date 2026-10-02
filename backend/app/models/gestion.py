"""
Modelo SQLAlchemy para la tabla 'gestiones'.
Representa el período de gestión académica o administrativa (año lectivo).
Usado para agrupar estadísticas y predicciones por período.
"""
from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.models.base import Base


class Gestion(Base):
    """Gestión o año académico de la UAGRM."""

    __tablename__ = "gestiones"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    anio: Mapped[int] = mapped_column(Integer, nullable=False, unique=True)
    descripcion: Mapped[str | None] = mapped_column(String(100), nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    creado_en: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
