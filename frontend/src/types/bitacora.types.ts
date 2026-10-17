export interface BitacoraResponse {
  id_bitacora: number
  usuario_id: number
  accion: string
  modulo: string
  detalle?: string | null
  ip_origen: string
  created_at: string
}