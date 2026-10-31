export interface CategoriaInsumoResponse {
  id_categoria: number
  nombre: string
  unidad_base?: string
  descripcion?: string | null
}

export interface CategoriaInsumoCreate {
  nombre: string
  unidad_base: string
}

export interface InsumoBase {
  categoria_id: number
  codigo: string
  descripcion: string
  stock_actual: number
  stock_minimo: number
  costo_reposicion: number
  unidad_medida: string
}

export type InsumoCreate = InsumoBase

export type InsumoUpdate = Partial<InsumoBase>

export interface InsumoResponse extends InsumoBase {
  id_insumo: number
  alerta_stock: boolean
  categoria?: CategoriaInsumoResponse | null
}

export interface MovimientoInventarioCreate {
  insumo_id: number
  tipo_movimiento: 'INGRESO_COMPRA' | 'DEDUCCION_ORDEN' | 'AJUSTE' | 'MERMA'
  cantidad: number
  referencia?: string | null
}

export interface MovimientoInventarioResponse {
  id_movimiento: number
  insumo_id: number
  usuario_id: number
  tipo_movimiento: string
  cantidad: number
  saldo_resultante: number
  referencia?: string | null
  created_at: string
}