"""
Modelo SQLAlchemy para la tabla 'rol'.
"""
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class Rol(Base):
    __tablename__ = "rol"

    id_rol: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    descripcion: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Relaciones
    usuarios: Mapped[list["Usuario"]] = relationship("Usuario", back_populates="rol")
