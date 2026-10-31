import apiClient from './client'

export interface TipoTrabajoResponse {
  id_tipo_trabajo: number
  nombre: string
  descripcion?: string | null
}

export interface TarifaCreate {
  concepto: string
  precio_unitario: number
  tipo_tarifa: string
  vigencia_hasta: string
}

export interface TarifaResponse {
  id_tarifa: number
  tipo_trabajo_id?: number
  concepto: string
  costo_unitario?: number
  precio_unitario?: number
  unidad?: string
  tipo_tarifa?: string
  vigencia_hasta?: string
  activo?: boolean
}

export const tarifasApi = {
  listar: async (): Promise<TarifaResponse[]> => {
    const { data } = await apiClient.get<TarifaResponse[]>('/tarifas')
    return data
  },
  listarTiposTrabajo: async (): Promise<TipoTrabajoResponse[]> => {
    const { data } = await apiClient.get<TipoTrabajoResponse[]>('/tarifas/tipos-trabajo')
    return data
  },
  crear: async (payload: TarifaCreate): Promise<TarifaResponse> => {
    const { data } = await apiClient.post<TarifaResponse>('/tarifas', payload)
    return data
  },
  actualizar: async (id: number, payload: Partial<TarifaResponse>): Promise<TarifaResponse> => {
    const { data } = await apiClient.put<TarifaResponse>(`/tarifas/${id}`, payload)
    return data
  },
}
