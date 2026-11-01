import apiClient from './client'
import type {
  InferenciaMLRequest,
  PrediccionDemandaResponse,
  EntrenamientoResponse,
  PeriodoAcademicoResponse,
} from '@/types'

export const prediccionesApi = {
  estimarDemanda: async (payload: InferenciaMLRequest): Promise<PrediccionDemandaResponse> => {
    // Timeout extendido a 60s para inferencia de Machine Learning con Random Forest
    try {
      const { data } = await apiClient.post<PrediccionDemandaResponse>('/predicciones/estimar', payload, {
        timeout: 60000,
      })
      return data
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } }
      // Si la ruta /estimar no existe (404), intentar con /predicciones o /predicciones/
      if (err.response?.status === 404) {
        try {
          const { data } = await apiClient.post<PrediccionDemandaResponse>('/predicciones', payload, {
            timeout: 60000,
          })
          return data
        } catch (subError: unknown) {
          const subErr = subError as { response?: { status?: number } }
          if (subErr.response?.status === 404) {
            const { data } = await apiClient.post<PrediccionDemandaResponse>('/predicciones/', payload, {
              timeout: 60000,
            })
            return data
          }
          throw subError
        }
      }
      throw error
    }
  },
  reentrenarModelo: async (): Promise<EntrenamientoResponse> => {
    const { data } = await apiClient.post<EntrenamientoResponse>('/predicciones/entrenar', null, {
      timeout: 120000,
    })
    return data
  },
  listarPeriodos: async (): Promise<PeriodoAcademicoResponse[]> => {
    const { data } = await apiClient.get<PeriodoAcademicoResponse[]>('/predicciones/periodos')
    return data
  },
  obtenerHistorial: async (insumoId: number): Promise<PrediccionDemandaResponse[]> => {
    const { data } = await apiClient.get<PrediccionDemandaResponse[]>(`/predicciones/${insumoId}`)
    return data
  },
}
