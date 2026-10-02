"""
Modelo SQLAlchemy para la tabla 'usuarios'.
Representa a los operadores y administradores del sistema.
"""
from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models.base import Base


class Usuario(Base):
    """Usuario del sistema con credenciales y rol asignado."""

    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre_usuario: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    correo: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    hash_contrasena: Mapped[str] = mapped_column(String(255), nullable=False)
    nombre_completo: Mapped[str] = mapped_column(String(150), nullable=False)
    rol_id: Mapped[int] = mapped_column(ForeignKey("roles.id"), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    creado_en: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    actualizado_en: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    # Relaciones
    rol: Mapped["Rol"] = relationship("Rol", back_populates="usuarios")
    bitacoras: Mapped[list["Bitacora"]] = relationship("Bitacora", back_populates="usuario")
