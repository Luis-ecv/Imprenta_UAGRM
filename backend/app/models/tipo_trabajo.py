"""
Modelo SQLAlchemy para la tabla 'tipos_trabajo'.
Catálogo de tipos de trabajo de impresión disponibles en la imprenta.
"""
from sqlalchemy import Boolean, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.models.base import Base


class TipoTrabajo(Base):
    """Tipo de trabajo de impresión (offset, digital, serigrafía, etc.)."""

    __tablename__ = "tipos_trabajo"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(80), nullable=False, unique=True)
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    creado_en: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
