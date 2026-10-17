"""
Schemas Pydantic para Tipo de Trabajo.
"""
from typing import Optional
from pydantic import BaseModel, ConfigDict


class TipoTrabajoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    activo: bool = True


class TipoTrabajoCreate(TipoTrabajoBase):
    pass


class TipoTrabajoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    activo: Optional[bool] = None


class TipoTrabajoResponse(TipoTrabajoBase):
    id_tipo_trabajo: int

    model_config = ConfigDict(from_attributes=True)
