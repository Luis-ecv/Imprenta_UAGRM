"""
Modelo SQLAlchemy para la tabla 'usuario'.
"""
from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class Usuario(Base):
    __tablename__ = "usuario"

    id_usuario: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    rol_id: Mapped[int] = mapped_column(ForeignKey("rol.id_rol", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False)
    nombre_completo: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    ultimo_acceso: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relaciones
    rol: Mapped["Rol"] = relationship("Rol", back_populates="usuarios")
    bitacoras: Mapped[list["Bitacora"]] = relationship("Bitacora", back_populates="usuario")
    proformas: Mapped[list["Proforma"]] = relationship("Proforma", back_populates="usuario")
    ordenes: Mapped[list["OrdenTrabajo"]] = relationship("OrdenTrabajo", back_populates="usuario")
    movimientos: Mapped[list["MovimientoInventario"]] = relationship("MovimientoInventario", back_populates="usuario")
    historiales: Mapped[list["HistorialEstado"]] = relationship("HistorialEstado", back_populates="usuario")
