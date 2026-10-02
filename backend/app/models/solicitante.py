"""
Modelo SQLAlchemy para la tabla 'solicitantes'.
Persona física que realiza el pedido en nombre de un cliente institucional.
"""
from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models.base import Base


class Solicitante(Base):
    """Persona que realiza el pedido de impresión en nombre de un cliente."""

    __tablename__ = "solicitantes"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre_completo: Mapped[str] = mapped_column(String(150), nullable=False)
    cargo: Mapped[str | None] = mapped_column(String(100), nullable=True)
    telefono: Mapped[str | None] = mapped_column(String(20), nullable=True)
    correo: Mapped[str | None] = mapped_column(String(100), nullable=True)
    cliente_id: Mapped[int] = mapped_column(ForeignKey("clientes.id"), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    creado_en: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relaciones
    cliente: Mapped["Cliente"] = relationship("Cliente", back_populates="solicitantes")
