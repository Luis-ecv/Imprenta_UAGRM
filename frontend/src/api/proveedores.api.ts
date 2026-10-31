import apiClient from './client'
import type {
  ProveedorResponse,
  ProveedorCreate,
  ProveedorUpdate,
  RespuestaPaginada,
  ParametrosPaginacion
} from '@/types'

export const proveedoresApi = {
  listar: async (params?: ParametrosPaginacion): Promise<RespuestaPaginada<ProveedorResponse>> => {
    const { data } = await apiClient.get<RespuestaPaginada<ProveedorResponse>>('/proveedores', { params })
    return data
  },
  obtener: async (id: number): Promise<ProveedorResponse> => {
    const { data } = await apiClient.get<ProveedorResponse>(`/proveedores/${id}`)
    return data
  },
  crear: async (payload: ProveedorCreate): Promise<ProveedorResponse> => {
    const { data } = await apiClient.post<ProveedorResponse>('/proveedores', payload)
    return data
  },
  actualizar: async (id: number, payload: ProveedorUpdate): Promise<ProveedorResponse> => {
    const { data } = await apiClient.put<ProveedorResponse>(`/proveedores/${id}`, payload)
    return data
  },
}
