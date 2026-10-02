"""
Modelo SQLAlchemy para la tabla 'insumo_proveedor'.
Tabla de asociación que relaciona insumos con sus proveedores habituales.
"""
from decimal import Decimal

from sqlalchemy import Boolean, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class InsumoProveedor(Base):
    """Relación entre un insumo y el proveedor que lo suministra."""

    __tablename__ = "insumo_proveedor"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    insumo_id: Mapped[int] = mapped_column(ForeignKey("insumos.id"), nullable=False)
    proveedor_id: Mapped[int] = mapped_column(ForeignKey("proveedores.id"), nullable=False)
    precio_referencia: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2), nullable=True
    )
    es_principal: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Relaciones
    insumo: Mapped["Insumo"] = relationship("Insumo", back_populates="proveedores")
    proveedor: Mapped["Proveedor"] = relationship(
        "Proveedor", back_populates="insumos_proveedor"
    )
