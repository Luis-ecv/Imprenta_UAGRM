import type { Modalidad, EstadoProforma } from './common.types'
import type { ClienteResponse } from './cliente.types'

export interface DetalleProformaCreate {
  descripcion_trabajo: string
  tipo_trabajo_id: number
  tiraje: number
  numero_paginas: number
  costo_papel: number
  costo_tinta: number
  costo_planchas: number
  costo_mano_obra: number
  subtotal: number
}

export interface DetalleProformaResponse extends DetalleProformaCreate {
  id_detalle: number
  proforma_id: number
}

export interface ProformaCreate {
  cliente_id: number
  modalidad: Modalidad
  dias_vigencia?: number
  detalles: DetalleProformaCreate[]
}

export interface ProformaUpdate {
  estado?: EstadoProforma
  dias_vigencia?: number
}

export interface ProformaResponse {
  id_proforma: number
  cliente_id: number
  usuario_id: number
  codigo_proforma: string
  modalidad: Modalidad
  total_presupuesto: number
  estado: EstadoProforma
  fecha_emision: string
  fecha_vencimiento: string
  detalles: DetalleProformaResponse[]
  cliente?: ClienteResponse | null
}