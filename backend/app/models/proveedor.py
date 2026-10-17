"""
Modelo SQLAlchemy para la tabla 'proveedor'.
"""
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class Proveedor(Base):
    __tablename__ = "proveedor"

    id_proveedor: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    razon_social: Mapped[str] = mapped_column(String(150), nullable=False)
    nit: Mapped[str] = mapped_column(String(30), nullable=False, unique=True)
    contacto: Mapped[str | None] = mapped_column(String(100), nullable=True)
    telefono: Mapped[str | None] = mapped_column(String(30), nullable=True)
    email: Mapped[str | None] = mapped_column(String(120), nullable=True)
    direccion: Mapped[str | None] = mapped_column(String(200), nullable=True)

    # Relaciones
    insumos_ofertados: Mapped[list["InsumoProveedor"]] = relationship("InsumoProveedor", back_populates="proveedor")
    ordenes_compra: Mapped[list["OrdenCompra"]] = relationship("OrdenCompra", back_populates="proveedor")
