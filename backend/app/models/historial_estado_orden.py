"""
Modelo SQLAlchemy para la tabla 'historial_estado_orden'.
Registra cada cambio de estado de una orden de trabajo con su motivo y responsable.
"""
from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models.base import Base


class HistorialEstadoOrden(Base):
    """Registro histórico de cambios de estado de una orden de trabajo."""

    __tablename__ = "historial_estado_orden"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    orden_id: Mapped[int] = mapped_column(
        ForeignKey("ordenes_trabajo.id"), nullable=False
    )
    estado_anterior: Mapped[str] = mapped_column(String(20), nullable=False)
    estado_nuevo: Mapped[str] = mapped_column(String(20), nullable=False)
    observacion: Mapped[str | None] = mapped_column(Text, nullable=True)
    usuario_id: Mapped[int | None] = mapped_column(
        ForeignKey("usuarios.id"), nullable=True
    )
    fecha_hora: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relaciones
    orden: Mapped["OrdenTrabajo"] = relationship(
        "OrdenTrabajo", back_populates="historial_estados"
    )
