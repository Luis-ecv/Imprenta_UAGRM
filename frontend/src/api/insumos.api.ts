import apiClient from './client'
import type {
  InsumoResponse,
  InsumoCreate,
  InsumoUpdate,
  CategoriaInsumoCreate,
  CategoriaInsumoResponse,
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
    const { data } = await apiClient.get<RespuestaPaginada<InsumoResponse>>('/insumos', {
      params: { por_pagina: 100 },
    })
    return (data.datos || []).filter(
      (insumo) => insumo.alerta_stock || Number(insumo.stock_actual) <= Number(insumo.stock_minimo)
    )
  },
  registrarMovimiento: async (payload: MovimientoInventarioCreate): Promise<MovimientoInventarioResponse> => {
    const { data } = await apiClient.post<MovimientoInventarioResponse>(`/insumos/${payload.insumo_id}/movimientos`, payload)
    return data
  },
  listarCategorias: async (): Promise<CategoriaInsumoResponse[]> => {
    const { data } = await apiClient.get<CategoriaInsumoResponse[]>('/insumos/categorias/')
    return data
  },
  crearCategoria: async (payload: CategoriaInsumoCreate): Promise<CategoriaInsumoResponse> => {
    const { data } = await apiClient.post<CategoriaInsumoResponse>('/insumos/categorias/', payload)
    return data
  },
}