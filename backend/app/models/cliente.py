"""
Modelo SQLAlchemy para la tabla 'clientes'.
Representa a las unidades académicas o instituciones que solicitan servicios.
"""
from sqlalchemy import Boolean, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models.base import Base


class Cliente(Base):
    """Cliente institucional de la imprenta (unidades académicas, facultades, etc.)."""

    __tablename__ = "clientes"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    unidad_academica: Mapped[str | None] = mapped_column(String(100), nullable=True)
    nit: Mapped[str | None] = mapped_column(String(20), nullable=True)
    telefono: Mapped[str | None] = mapped_column(String(20), nullable=True)
    correo: Mapped[str | None] = mapped_column(String(100), nullable=True)
    direccion: Mapped[str | None] = mapped_column(Text, nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    creado_en: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relaciones
    proformas: Mapped[list["Proforma"]] = relationship("Proforma", back_populates="cliente")
    ordenes: Mapped[list["OrdenTrabajo"]] = relationship("OrdenTrabajo", back_populates="cliente")
    solicitantes: Mapped[list["Solicitante"]] = relationship("Solicitante", back_populates="cliente")
