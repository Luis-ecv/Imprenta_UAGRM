"""
Schemas Pydantic para Categorías de Insumos.
"""
from pydantic import BaseModel, ConfigDict


class CategoriaInsumoBase(BaseModel):
    nombre: str
    unidad_base: str


class CategoriaInsumoCreate(CategoriaInsumoBase):
    pass


class CategoriaInsumoUpdate(BaseModel):
    nombre: str | None = None
    unidad_base: str | None = None


class CategoriaInsumoResponse(CategoriaInsumoBase):
    id_categoria: int

    model_config = ConfigDict(from_attributes=True)
