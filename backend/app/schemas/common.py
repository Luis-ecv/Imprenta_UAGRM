"""
Schemas Pydantic reutilizables en todo el sistema.
Incluye paginación, respuestas genéricas y tipos base compartidos.
"""
from typing import Generic, List, Optional, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class RespuestaPaginada(BaseModel, Generic[T]):
    """Respuesta estándar para endpoints con paginación."""

    total: int
    pagina: int
    por_pagina: int
    datos: List[T]


class RespuestaExito(BaseModel):
    """Respuesta estándar para operaciones exitosas que no retornan datos."""

    mensaje: str
    exitoso: bool = True


class RespuestaError(BaseModel):
    """Respuesta estándar para errores del dominio."""

    detalle: str
    codigo: Optional[str] = None


class ParametrosPaginacion(BaseModel):
    """Parámetros de paginación recibidos en query params."""

    pagina: int = 1
    por_pagina: int = 20
