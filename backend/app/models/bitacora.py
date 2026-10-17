"""
Modelo SQLAlchemy para la tabla 'bitacora'.
Registro inmutable de auditoría para operaciones críticas.
"""
from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.models.base import Base


class Bitacora(Base):
    __tablename__ = "bitacora"

    id_bitacora: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuario.id_usuario", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False)
    accion: Mapped[str] = mapped_column(String(100), nullable=False)
    modulo: Mapped[str] = mapped_column(String(50), nullable=False)
    detalle: Mapped[str | None] = mapped_column(Text, nullable=True)
    ip_origen: Mapped[str] = mapped_column(String(45), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relaciones
    usuario: Mapped["Usuario"] = relationship("Usuario", back_populates="bitacoras")
