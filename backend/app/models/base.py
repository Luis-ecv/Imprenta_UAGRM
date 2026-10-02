"""
Base declarativa de SQLAlchemy 2.0.
Todos los modelos del sistema deben heredar de esta clase Base.
"""
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """
    Clase base para todos los modelos ORM del sistema.

    Uso:
        class MiModelo(Base):
            __tablename__ = "mi_tabla"
            ...
    """
    pass
