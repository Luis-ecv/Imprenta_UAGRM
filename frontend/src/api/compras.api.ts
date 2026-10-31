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
  obtener: async (id: number): Promise<OrdenCompraResponse> => {
    const { data } = await apiClient.get<OrdenCompraResponse>(`/compras/${id}`)
    return data
  },
  crear: async (payload: OrdenCompraCreate): Promise<OrdenCompraResponse> => {
    const { data } = await apiClient.post<OrdenCompraResponse>('/compras', payload)
    return data
  },
  actualizar: async (id: number, payload: { estado?: string; total_estimado?: number }): Promise<OrdenCompraResponse> => {
    const { data } = await apiClient.patch<OrdenCompraResponse>(`/compras/${id}`, payload)
    return data
  },
  cambiarEstado: async (id: number, nuevoEstado: string): Promise<OrdenCompraResponse> => {
    const { data } = await apiClient.patch<OrdenCompraResponse>(`/compras/${id}`, { estado: nuevoEstado })
    return data
  },
  listarProveedores: async (): Promise<ProveedorResponse[]> => {
    const { data } = await apiClient.get<RespuestaPaginada<ProveedorResponse>>('/proveedores', { params: { por_pagina: 100 } })
    return data.datos || []
  },
}
