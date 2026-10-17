"""
Esquemas comunes y genéricos (paginación, respuestas estándar).
"""
from typing import Generic, List, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")


class PaginacionParams(BaseModel):
    pagina: int = Field(default=1, ge=1, description="Número de página")
    por_pagina: int = Field(default=20, ge=1, le=100, description="Registros por página")


class RespuestaPaginada(BaseModel, Generic[T]):
    total: int
    pagina: int
    por_pagina: int
    datos: List[T]


class RespuestaExito(BaseModel):
    mensaje: str = "Operación completada con éxito."
    exito: bool = True


MensajeRespuesta = RespuestaExito
