"""
Modelo SQLAlchemy para la tabla 'historial_estado'.
"""
from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.models.base import Base


class HistorialEstado(Base):
    __tablename__ = "historial_estado"

    id_historial: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    orden_id: Mapped[int] = mapped_column(
        ForeignKey("orden_trabajo.id_orden", onupdate="CASCADE", ondelete="CASCADE"), nullable=False
    )
    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuario.id_usuario", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False
    )
    estado_anterior: Mapped[str] = mapped_column(String(30), nullable=False)
    estado_nuevo: Mapped[str] = mapped_column(String(30), nullable=False)
    fecha_cambio: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relaciones
    orden: Mapped["OrdenTrabajo"] = relationship("OrdenTrabajo", back_populates="historial")
    usuario: Mapped["Usuario"] = relationship("Usuario", back_populates="historiales")
