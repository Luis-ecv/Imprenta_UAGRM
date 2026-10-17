import apiClient from './client'

export interface TipoTrabajoResponse {
  id_tipo_trabajo: number
  nombre: string
  descripcion?: string | null
}

export interface TarifaResponse {
  id_tarifa: number
  tipo_trabajo_id: number
  concepto: string
  costo_unitario: number
  unidad: string
  activo: boolean
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
}