"""
Modelo SQLAlchemy para la tabla 'insumos'.
Catálogo de materiales utilizados en los procesos de impresión.
"""
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models.base import Base


class Insumo(Base):
    """Insumo de impresión con control de stock."""

    __tablename__ = "insumos"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    codigo: Mapped[str] = mapped_column(String(30), nullable=False, unique=True)
    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
    unidad_medida: Mapped[str] = mapped_column(String(20), nullable=False)
    categoria_id: Mapped[int] = mapped_column(
        ForeignKey("categorias_insumo.id"), nullable=False
    )
    stock_actual: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False, default=Decimal("0")
    )
    stock_minimo: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False, default=Decimal("0")
    )
    stock_maximo: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    precio_unitario: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False, default=Decimal("0")
    )
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    creado_en: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    actualizado_en: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    # Relaciones
    categoria: Mapped["CategoriaInsumo"] = relationship(
        "CategoriaInsumo", back_populates="insumos"
    )
    movimientos: Mapped[list["MovimientoInventario"]] = relationship(
        "MovimientoInventario", back_populates="insumo"
    )
    consumos: Mapped[list["ConsumoReal"]] = relationship(
        "ConsumoReal", back_populates="insumo"
    )
    proveedores: Mapped[list["InsumoProveedor"]] = relationship(
        "InsumoProveedor", back_populates="insumo"
    )
    predicciones: Mapped[list["PrediccionDemanda"]] = relationship(
        "PrediccionDemanda", back_populates="insumo"
    )
