import apiClient from './client'
import type {
  InferenciaMLRequest,
  PrediccionDemandaResponse,
  EntrenamientoResponse,
  PeriodoAcademicoResponse,
} from '@/types'

export const prediccionesApi = {
  estimarDemanda: async (payload: InferenciaMLRequest): Promise<PrediccionDemandaResponse> => {
    const { data } = await apiClient.post<PrediccionDemandaResponse>('/predicciones/estimar', payload)
    return data
  },
  reentrenarModelo: async (): Promise<EntrenamientoResponse> => {
    const { data } = await apiClient.post<EntrenamientoResponse>('/predicciones/entrenar')
    return data
  },
  listarPeriodos: async (): Promise<PeriodoAcademicoResponse[]> => {
    const { data } = await apiClient.get<PeriodoAcademicoResponse[]>('/predicciones/periodos')
    return data
  },
}
