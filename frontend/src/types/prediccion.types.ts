export interface InferenciaMLRequest {
  insumo_id: number
  periodo_id: number
}

export interface PrediccionDemandaResponse {
  id_prediccion: number
  insumo_id: number
  periodo_id: number
  cantidad_proyectada: number
  margen_variabilidad: number
  stock_sugerido_compra: number
  fecha_generacion: string
  es_referencial: boolean
}

export interface EntrenamientoResponse {
  mensaje: string
  registros_entrenamiento: number
  r2_score?: number | null
  mae?: number | null
  fecha_entrenamiento: string
}