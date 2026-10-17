import apiClient from './client'
import type {
  ProformaResponse,
  ProformaCreate,
  EstadoProforma,
  RespuestaPaginada,
  ParametrosPaginacion
} from '@/types'

export const proformasApi = {
  listar: async (params?: ParametrosPaginacion & { estado?: string }): Promise<RespuestaPaginada<ProformaResponse>> => {
    const { data } = await apiClient.get<RespuestaPaginada<ProformaResponse>>('/proformas', { params })
    return data
  },
  obtener: async (id: number): Promise<ProformaResponse> => {
    const { data } = await apiClient.get<ProformaResponse>(`/proformas/${id}`)
    return data
  },
  crear: async (payload: ProformaCreate): Promise<ProformaResponse> => {
    const { data } = await apiClient.post<ProformaResponse>('/proformas', payload)
    return data
  },
  cambiarEstado: async (id: number, nuevoEstado: EstadoProforma): Promise<ProformaResponse> => {
    const { data } = await apiClient.patch<ProformaResponse>(`/proformas/${id}/estado?nuevo_estado=${nuevoEstado}`)
    return data
  },
  obtenerImpresionHtml: async (id: number): Promise<string> => {
    const { data } = await apiClient.get<string>(`/proformas/${id}/imprimir`, {
      responseType: 'text',
    })
    return data
  },
}