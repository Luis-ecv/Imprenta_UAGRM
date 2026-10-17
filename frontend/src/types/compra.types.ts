export interface ProveedorResponse {
  id_proveedor: number
  razon_social: string
  nit: string
  contacto?: string | null
  telefono?: string | null
  email?: string | null
  direccion?: string | null
}

export interface OrdenCompraCreate {
  proveedor_id: number
  prediccion_id?: number | null
  total_estimado: number
  estado?: string
}

export interface OrdenCompraResponse {
  id_orden_compra: number
  proveedor_id: number
  prediccion_id?: number | null
  total_estimado: number
  estado: string
  fecha_generacion: string
  proveedor?: ProveedorResponse | null
}