"""
Modelo SQLAlchemy para la tabla 'tarifa'.
"""
from datetime import date
from decimal import Decimal
from sqlalchemy import Date, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class Tarifa(Base):
    __tablename__ = "tarifa"

    id_tarifa: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    concepto: Mapped[str] = mapped_column(String(100), nullable=False)
    precio_unitario: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    tipo_tarifa: Mapped[str] = mapped_column(String(50), nullable=False)
    vigencia_hasta: Mapped[date] = mapped_column(Date, nullable=False)

    # Relaciones
    detalles_proforma: Mapped[list["DetalleProforma"]] = relationship("DetalleProforma", back_populates="tarifa")
