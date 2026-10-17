"""
Modelo SQLAlchemy para la tabla 'detalle_proforma'.
"""
from decimal import Decimal
from sqlalchemy import ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class DetalleProforma(Base):
    __tablename__ = "detalle_proforma"

    id_detalle_proforma: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    proforma_id: Mapped[int] = mapped_column(
        ForeignKey("proforma.id_proforma", onupdate="CASCADE", ondelete="CASCADE"), nullable=False
    )
    tipo_trabajo_id: Mapped[int] = mapped_column(
        ForeignKey("tipo_trabajo.id_tipo_trabajo", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False
    )
    insumo_id: Mapped[int | None] = mapped_column(
        ForeignKey("insumo.id_insumo", onupdate="CASCADE", ondelete="RESTRICT"), nullable=True
    )
    tarifa_id: Mapped[int | None] = mapped_column(
        ForeignKey("tarifa.id_tarifa", onupdate="CASCADE", ondelete="RESTRICT"), nullable=True
    )
    descripcion_trabajo: Mapped[str] = mapped_column(String(200), nullable=False)
    tiraje: Mapped[int] = mapped_column(Integer, nullable=False)
    paginas_totales: Mapped[int] = mapped_column(Integer, nullable=False)
    costo_papel: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    costo_tinta: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    costo_planchas: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    costo_mano_obra: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    # Relaciones
    proforma: Mapped["Proforma"] = relationship("Proforma", back_populates="detalles")
    tipo_trabajo: Mapped["TipoTrabajo"] = relationship("TipoTrabajo", back_populates="detalles_proforma")
    insumo: Mapped["Insumo | None"] = relationship("Insumo", back_populates="detalles_proforma")
    tarifa: Mapped["Tarifa | None"] = relationship("Tarifa", back_populates="detalles_proforma")
