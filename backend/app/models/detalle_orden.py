"""
Modelo SQLAlchemy para la tabla 'detalle_orden'.
"""
from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class DetalleOrden(Base):
    __tablename__ = "detalle_orden"

    id_detalle_orden: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    orden_id: Mapped[int] = mapped_column(
        ForeignKey("orden_trabajo.id_orden", onupdate="CASCADE", ondelete="CASCADE"), nullable=False
    )
    formato_corte: Mapped[str] = mapped_column(String(50), nullable=False)
    tipo_encuadernacion: Mapped[str] = mapped_column(String(80), nullable=False)
    especificaciones_taller: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relaciones
    orden: Mapped["OrdenTrabajo"] = relationship("OrdenTrabajo", back_populates="detalles_orden")
