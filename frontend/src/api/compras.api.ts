import apiClient from './client'
import type {
  OrdenCompraResponse,
  OrdenCompraCreate,
  ProveedorResponse,
  RespuestaPaginada,
  ParametrosPaginacion
} from '@/types'

export const comprasApi = {
  listar: async (params?: ParametrosPaginacion): Promise<RespuestaPaginada<OrdenCompraResponse>> => {
    const { data } = await apiClient.get<RespuestaPaginada<OrdenCompraResponse>>('/compras', { params })
    return data
  },
  crear: async (payload: OrdenCompraCreate): Promise<OrdenCompraResponse> => {
    const { data } = await apiClient.post<OrdenCompraResponse>('/compras', payload)
    return data
  },
  listarProveedores: async (): Promise<ProveedorResponse[]> => {
    const { data } = await apiClient.get<ProveedorResponse[]>('/proveedores')
    return data
  },
}