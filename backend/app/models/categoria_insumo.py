"""
Modelo SQLAlchemy para la tabla 'categorias_insumo'.
Agrupa los insumos en categorías (Papel, Tóner, Encuadernación, etc.).
"""
from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class CategoriaInsumo(Base):
    """Categoría de clasificación de insumos."""

    __tablename__ = "categorias_insumo"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(80), nullable=False, unique=True)
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Relaciones
    insumos: Mapped[list["Insumo"]] = relationship("Insumo", back_populates="categoria")
