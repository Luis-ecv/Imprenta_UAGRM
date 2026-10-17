/**
 * Tipos TypeScript reutilizables en todo el sistema.
 * Corresponden a los schemas comunes del backend FastAPI (common.py, auth.py).
 */

export interface RespuestaPaginada<T> {
  total: number
  pagina: number
  por_pagina: number
  datos: T[]
}

export interface RespuestaExito {
  mensaje: string
  exito: boolean
}

export interface ParametrosPaginacion {
  pagina?: number
  por_pagina?: number
  busqueda?: string
}

export type EstadoOrden =
  | 'REGISTRADO'
  | 'EN COLA'
  | 'EN IMPRESION'
  | 'EN ACABADO'
  | 'FINALIZADO'
  | 'ENTREGADO'

export type EstadoProforma =
  | 'EMITIDA'
  | 'APROBADA'
  | 'RECHAZADA'
  | 'VENCIDA'

export type Modalidad = 'insumos_imprenta' | 'insumos_cliente'

export type TipoCliente = 'facultad' | 'docente' | 'autoridad' | 'estudiante' | 'particular'

export type RolSistema =
  | 'Superadministrador'
  | 'Administrador'
  | 'Operador Mostrador'
  | 'Operador Taller'
  | 'Cliente'

export type PrioridadOrden = 'NORMAL' | 'URGENTE'

export interface UsuarioAutenticado {
  id_usuario: number
  email: string
  nombre_completo: string
  rol: RolSistema
}