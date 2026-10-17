"""
Modelo SQLAlchemy para la tabla 'tipo_trabajo'.
"""
from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class TipoTrabajo(Base):
    __tablename__ = "tipo_trabajo"

    id_tipo_trabajo: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(80), nullable=False, unique=True)
    descripcion: Mapped[str | None] = mapped_column(String(255), nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Relaciones
    detalles_proforma: Mapped[list["DetalleProforma"]] = relationship("DetalleProforma", back_populates="tipo_trabajo")
