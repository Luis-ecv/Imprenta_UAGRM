"""
Schemas Pydantic para Periodos Académicos.
"""
from datetime import date
from pydantic import BaseModel, ConfigDict


class PeriodoAcademicoBase(BaseModel):
    gestion: int
    semestre: str
    fecha_inicio: date
    fecha_fin: date
    es_pico_demanda: bool = False


class PeriodoAcademicoCreate(PeriodoAcademicoBase):
    pass


class PeriodoAcademicoResponse(PeriodoAcademicoBase):
    id_periodo: int

    model_config = ConfigDict(from_attributes=True)
