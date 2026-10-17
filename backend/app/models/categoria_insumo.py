"""
Modelo SQLAlchemy para la tabla 'categoria_insumo'.
"""
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class CategoriaInsumo(Base):
    __tablename__ = "categoria_insumo"

    id_categoria: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(80), nullable=False, unique=True)
    unidad_base: Mapped[str] = mapped_column(String(30), nullable=False)

    # Relaciones
    insumos: Mapped[list["Insumo"]] = relationship("Insumo", back_populates="categoria")
