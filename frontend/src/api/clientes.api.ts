import apiClient from './client'
import type {
  ClienteResponse,
  ClienteCreate,
  ClienteUpdate,
  RespuestaPaginada,
  RespuestaExito,
  ParametrosPaginacion
} from '@/types'

export const clientesApi = {
  listar: async (params?: ParametrosPaginacion): Promise<RespuestaPaginada<ClienteResponse>> => {
    const { data } = await apiClient.get<RespuestaPaginada<ClienteResponse>>('/clientes', { params })
    return data
  },
  obtener: async (id: number): Promise<ClienteResponse> => {
    const { data } = await apiClient.get<ClienteResponse>(`/clientes/${id}`)
    return data
  },
  crear: async (payload: ClienteCreate): Promise<ClienteResponse> => {
    const { data } = await apiClient.post<ClienteResponse>('/clientes', payload)
    return data
  },
  actualizar: async (id: number, payload: ClienteUpdate): Promise<ClienteResponse> => {
    const { data } = await apiClient.put<ClienteResponse>(`/clientes/${id}`, payload)
    return data
  },
  eliminar: async (id: number): Promise<RespuestaExito> => {
    const { data } = await apiClient.delete<RespuestaExito>(`/clientes/${id}`)
    return data
  },
}