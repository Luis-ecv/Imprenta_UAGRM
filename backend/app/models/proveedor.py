"""
Modelo SQLAlchemy para la tabla 'proveedores'.
Empresas o personas que suministran insumos a la imprenta.
"""
from sqlalchemy import Boolean, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models.base import Base


class Proveedor(Base):
    """Proveedor de insumos de la imprenta."""

    __tablename__ = "proveedores"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    nit: Mapped[str | None] = mapped_column(String(20), nullable=True)
    telefono: Mapped[str | None] = mapped_column(String(20), nullable=True)
    correo: Mapped[str | None] = mapped_column(String(100), nullable=True)
    direccion: Mapped[str | None] = mapped_column(Text, nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    creado_en: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relaciones
    compras: Mapped[list["Compra"]] = relationship("Compra", back_populates="proveedor")
    insumos_proveedor: Mapped[list["InsumoProveedor"]] = relationship(
        "InsumoProveedor", back_populates="proveedor"
    )
