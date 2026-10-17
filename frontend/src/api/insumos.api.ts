import apiClient from './client'
import type {
  InsumoResponse,
  InsumoCreate,
  InsumoUpdate,
  MovimientoInventarioCreate,
  MovimientoInventarioResponse,
  RespuestaPaginada,
  RespuestaExito,
  ParametrosPaginacion
} from '@/types'

export const insumosApi = {
  listar: async (params?: ParametrosPaginacion & { solo_alertas?: boolean }): Promise<RespuestaPaginada<InsumoResponse>> => {
    const { data } = await apiClient.get<RespuestaPaginada<InsumoResponse>>('/insumos', { params })
    return data
  },
  obtener: async (id: number): Promise<InsumoResponse> => {
    const { data } = await apiClient.get<InsumoResponse>(`/insumos/${id}`)
    return data
  },
  crear: async (payload: InsumoCreate): Promise<InsumoResponse> => {
    const { data } = await apiClient.post<InsumoResponse>('/insumos', payload)
    return data
  },
  actualizar: async (id: number, payload: InsumoUpdate): Promise<InsumoResponse> => {
    const { data } = await apiClient.put<InsumoResponse>(`/insumos/${id}`, payload)
    return data
  },
  eliminar: async (id: number): Promise<RespuestaExito> => {
    const { data } = await apiClient.delete<RespuestaExito>(`/insumos/${id}`)
    return data
  },
  obtenerAlertas: async (): Promise<InsumoResponse[]> => {
    const { data } = await apiClient.get<InsumoResponse[]>('/insumos/alertas')
    return data
  },
  registrarMovimiento: async (payload: MovimientoInventarioCreate): Promise<MovimientoInventarioResponse> => {
    const { data } = await apiClient.post<MovimientoInventarioResponse>('/insumos/movimientos', payload)
    return data
  },
}