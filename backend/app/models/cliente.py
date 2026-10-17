"""
Modelo SQLAlchemy para la tabla 'cliente'.
"""
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class Cliente(Base):
    __tablename__ = "cliente"

    id_cliente: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tipo_cliente: Mapped[str] = mapped_column(String(30), nullable=False)
    razon_social: Mapped[str] = mapped_column(String(150), nullable=False)
    telefono: Mapped[str | None] = mapped_column(String(30), nullable=True)
    email: Mapped[str | None] = mapped_column(String(120), nullable=True)
    direccion: Mapped[str | None] = mapped_column(String(200), nullable=True)
    codigo_facultad: Mapped[str | None] = mapped_column(String(20), nullable=True)
    dependencia: Mapped[str | None] = mapped_column(String(100), nullable=True)
    ci_nit: Mapped[str | None] = mapped_column(String(30), nullable=True)

    # Relaciones
    proformas: Mapped[list["Proforma"]] = relationship("Proforma", back_populates="cliente")
