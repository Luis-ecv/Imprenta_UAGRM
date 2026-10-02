"""
Modelo SQLAlchemy para la tabla 'bitacora' (auditoría del sistema).
Registra todas las acciones críticas realizadas por los usuarios.
"""
from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.dialects.postgresql import INET
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models.base import Base


class Bitacora(Base):
    """Registro de auditoría de acciones críticas del sistema."""

    __tablename__ = "bitacora"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    usuario_id: Mapped[int | None] = mapped_column(
        ForeignKey("usuarios.id"), nullable=True
    )
    accion: Mapped[str] = mapped_column(String(100), nullable=False)
    tabla_afec: Mapped[str | None] = mapped_column(String(100), nullable=True)
    registro_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    detalle: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    ip_origen: Mapped[str | None] = mapped_column(String(45), nullable=True)  # IPv4/IPv6
    fecha_hora: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relaciones
    usuario: Mapped["Usuario | None"] = relationship("Usuario", back_populates="bitacoras")
