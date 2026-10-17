import type { EstadoOrden, PrioridadOrden } from './common.types'
import type { ProformaResponse } from './proforma.types'

export interface DetalleOrdenCreate {
  formato_corte: string
  tipo_encuadernacion: string
  especificaciones_taller?: string | null
}

export interface DetalleOrdenResponse extends DetalleOrdenCreate {
  id_detalle_orden: number
  orden_id: number
}

export interface HistorialEstadoResponse {
  id_historial: number
  orden_id: number
  usuario_id: number
  estado_anterior: string
  estado_nuevo: string
  fecha_cambio: string
}

export interface OrdenTrabajoCreate {
  proforma_id: number
  fecha_compromiso: string
  prioridad?: PrioridadOrden
  observaciones?: string | null
  detalle_orden: DetalleOrdenCreate
}

export interface OrdenTrabajoUpdate {
  fecha_compromiso?: string
  prioridad?: PrioridadOrden
  observaciones?: string | null
}

export interface CambioEstadoOrden {
  estado_nuevo: EstadoOrden
  observaciones?: string | null
}

export interface OrdenTrabajoResponse {
  id_orden: number
  proforma_id: number
  usuario_id: number
  codigo_ot: string
  fecha_compromiso: string
  prioridad: PrioridadOrden
  estado_actual: EstadoOrden
  observaciones?: string | null
  created_at: string
  detalles_orden: DetalleOrdenResponse[]
  historial: HistorialEstadoResponse[]
  proforma?: ProformaResponse | null
}

export interface ConsumoRealCreate {
  orden_id: number
  insumo_id: number
  cantidad_utilizada: number
  cantidad_merma?: number
}

export interface ConsumoRealResponse {
  id_consumo: number
  orden_id: number
  insumo_id: number
  cantidad_utilizada: number
  cantidad_merma: number
  created_at: string
}