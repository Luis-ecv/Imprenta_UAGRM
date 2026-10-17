"""
Modelo SQLAlchemy para la tabla 'insumo'.
"""
from decimal import Decimal
from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class Insumo(Base):
    __tablename__ = "insumo"

    id_insumo: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    categoria_id: Mapped[int] = mapped_column(
        ForeignKey("categoria_insumo.id_categoria", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False
    )
    codigo: Mapped[str] = mapped_column(String(30), nullable=False, unique=True)
    descripcion: Mapped[str] = mapped_column(String(150), nullable=False)
    stock_actual: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    stock_minimo: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    costo_reposicion: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    unidad_medida: Mapped[str] = mapped_column(String(30), nullable=False)

    # Relaciones
    categoria: Mapped["CategoriaInsumo"] = relationship("CategoriaInsumo", back_populates="insumos")
    movimientos: Mapped[list["MovimientoInventario"]] = relationship("MovimientoInventario", back_populates="insumo")
    proveedores: Mapped[list["InsumoProveedor"]] = relationship("InsumoProveedor", back_populates="insumo")
    detalles_proforma: Mapped[list["DetalleProforma"]] = relationship("DetalleProforma", back_populates="insumo")
    consumos: Mapped[list["ConsumoReal"]] = relationship("ConsumoReal", back_populates="insumo")
    predicciones: Mapped[list["PrediccionDemanda"]] = relationship("PrediccionDemanda", back_populates="insumo")
