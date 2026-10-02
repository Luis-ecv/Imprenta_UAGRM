"""
Modelo SQLAlchemy para la tabla 'roles'.
Define los roles del sistema usados para el control de acceso (RBAC).
"""
from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from sqlalchemy import DateTime

from app.models.base import Base


class Rol(Base):
    """Rol del sistema (ADMIN, SUPERADMIN, MOSTRADOR, TALLER, etc.)."""

    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    creado_en: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relación inversa con usuarios
    usuarios: Mapped[list["Usuario"]] = relationship("Usuario", back_populates="rol")
