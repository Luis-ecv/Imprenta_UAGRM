import apiClient from './client'
import type {
  OrdenTrabajoResponse,
  OrdenTrabajoCreate,
  CambioEstadoOrden,
  ConsumoRealCreate,
  ConsumoRealResponse,
  RespuestaPaginada,
  ParametrosPaginacion
} from '@/types'

export const ordenesApi = {
  listar: async (params?: ParametrosPaginacion & { estado?: string }): Promise<RespuestaPaginada<OrdenTrabajoResponse>> => {
    const { data } = await apiClient.get<RespuestaPaginada<OrdenTrabajoResponse>>('/ordenes', { params })
    return data
  },
  obtener: async (id: number): Promise<OrdenTrabajoResponse> => {
    const { data } = await apiClient.get<OrdenTrabajoResponse>(`/ordenes/${id}`)
    return data
  },
  crear: async (payload: OrdenTrabajoCreate): Promise<OrdenTrabajoResponse> => {
    const { data } = await apiClient.post<OrdenTrabajoResponse>('/ordenes', payload)
    return data
  },
  cambiarEstado: async (id: number, payload: CambioEstadoOrden): Promise<OrdenTrabajoResponse> => {
    const { data } = await apiClient.patch<OrdenTrabajoResponse>(`/ordenes/${id}/estado`, payload)
    return data
  },
  registrarConsumoReal: async (idOrden: number, payload: ConsumoRealCreate): Promise<ConsumoRealResponse> => {
    const { data } = await apiClient.post<ConsumoRealResponse>(`/ordenes/${idOrden}/consumo-real`, payload)
    return data
  },
}