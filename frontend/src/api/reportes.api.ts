import apiClient from './client'
import type { ParametrosPaginacion, RespuestaPaginada, BitacoraResponse } from '@/types'

export interface ConsumoMensualItem {
  insumo_id: number
  codigo: string
  descripcion: string
  total_utilizado: number
  total_merma: number
}

export interface InsumoStockBajoItem {
  id_insumo: number
  codigo: string
  descripcion: string
  stock_actual: number
  stock_minimo: number
  costo_reposicion: number
  unidad_medida: string
}

export interface InsumoInventarioItem {
  id_insumo: number
  codigo: string
  descripcion: string
  stock_actual: number
  stock_minimo: number
  costo_reposicion: number
  unidad_medida: string
  alerta_stock?: boolean
}

export interface ProformaReporteItem {
  id_proforma: number
  numero_proforma?: string
  cliente?: {
    nombre_razon_social?: string
  }
  tipo_trabajo?: {
    nombre?: string
  }
  tiraje?: number
  total_presupuesto?: number | string
  estado?: string
  created_at?: string
}

export const reportesApi = {
  consumo: async (anio?: number, mes?: number): Promise<ConsumoMensualItem[]> => {
    const ahora = new Date()
    const targetAnio = anio ?? ahora.getFullYear()
    const targetMes = mes ?? (ahora.getMonth() + 1)
    const { data } = await apiClient.get<ConsumoMensualItem[]>('/reportes/consumo/mensual', {
      params: { anio: targetAnio, mes: targetMes },
    })
    return data
  },
  proformas: async (estado?: string): Promise<ProformaReporteItem[]> => {
    const { data } = await apiClient.get('/proformas', { params: { por_pagina: 100, estado } })
    return data.datos || []
  },
  inventarioStockBajo: async (): Promise<InsumoStockBajoItem[]> => {
    const { data } = await apiClient.get<InsumoStockBajoItem[]>('/reportes/insumos/stock-bajo')
    return data
  },
  inventarioCompleto: async (): Promise<InsumoInventarioItem[]> => {
    const { data } = await apiClient.get<RespuestaPaginada<InsumoInventarioItem>>('/insumos', {
      params: { por_pagina: 100 },
    })
    return data.datos || []
  },
  inventario: async (soloBajo: boolean = true): Promise<(InsumoStockBajoItem | InsumoInventarioItem)[]> => {
    if (soloBajo) {
      const { data } = await apiClient.get<InsumoStockBajoItem[]>('/reportes/insumos/stock-bajo')
      return data
    }
    const { data } = await apiClient.get<RespuestaPaginada<InsumoInventarioItem>>('/insumos', {
      params: { por_pagina: 100 },
    })
    return data.datos || []
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
