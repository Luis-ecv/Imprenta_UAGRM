import apiClient from './client'
import type { ParametrosPaginacion, RespuestaPaginada, BitacoraResponse } from '@/types'

export const reportesApi = {
  consumo: async (fechaInicio?: string, fechaFin?: string): Promise<unknown> => {
    const { data } = await apiClient.get('/reportes/consumo', {
      params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
    })
    return data
  },
  proformas: async (estado?: string): Promise<unknown> => {
    const { data } = await apiClient.get('/reportes/proformas', { params: { estado } })
    return data
  },
  inventario: async (): Promise<unknown> => {
    const { data } = await apiClient.get('/reportes/inventario')
    return data
  },
  bitacora: async (params?: ParametrosPaginacion & { usuario_id?: number; modulo?: string }): Promise<RespuestaPaginada<BitacoraResponse>> => {
    const { data } = await apiClient.get<RespuestaPaginada<BitacoraResponse>>('/bitacora', { params })
    return data
  },
}