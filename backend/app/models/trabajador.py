"""
Modelo SQLAlchemy para la tabla 'trabajadores'.
Operarios del taller de impresión que ejecutan las órdenes de trabajo.
"""
from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.models.base import Base


class Trabajador(Base):
    """Operario del taller de impresión."""

    __tablename__ = "trabajadores"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre_completo: Mapped[str] = mapped_column(String(150), nullable=False)
    cargo: Mapped[str | None] = mapped_column(String(100), nullable=True)
    telefono: Mapped[str | None] = mapped_column(String(20), nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    creado_en: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
