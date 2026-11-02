import apiClient from './client'
import type { ParametrosPaginacion, RespuestaPaginada, BitacoraResponse } from '@/types'

export const reportesApi = {
  consumo: async (anio?: number, mes?: number): Promise<unknown> => {
    const ahora = new Date()
    const targetAnio = anio ?? ahora.getFullYear()
    const targetMes = mes ?? (ahora.getMonth() + 1)
    const { data } = await apiClient.get('/reportes/consumo/mensual', {
      params: { anio: targetAnio, mes: targetMes },
    })
    return data
  },
  proformas: async (estado?: string): Promise<unknown> => {
    const { data } = await apiClient.get('/proformas', { params: { por_pagina: 100, estado } })
    return data.datos || []
  },
  inventario: async (): Promise<unknown> => {
    const { data } = await apiClient.get('/reportes/insumos/stock-bajo')
    return data
  },
  ordenesPorEstado: async (): Promise<Record<string, number>> => {
    const { data } = await apiClient.get<Record<string, number>>('/reportes/ordenes/por-estado')
    return data
  },
  dashboard: async (): Promise<{
    ordenes_activas: number
    insumos_criticos: number
    proformas_pendientes: number
    total_proformas_cerradas: number
  }> => {
    const { data } = await apiClient.get('/reportes/dashboard')
    return data
  },
  bitacora: async (params?: ParametrosPaginacion & { usuario_id?: number; modulo?: string }): Promise<RespuestaPaginada<BitacoraResponse>> => {
    const { data } = await apiClient.get<RespuestaPaginada<BitacoraResponse>>('/bitacora', { params })
    return data
  },
}
