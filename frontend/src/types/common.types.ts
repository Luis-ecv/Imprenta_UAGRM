/**
 * Tipos TypeScript reutilizables en todo el sistema.
 * Corresponden a los schemas comunes del backend (common.py).
 */

/** Respuesta paginada del backend */
export interface RespuestaPaginada<T> {
  total: number
  pagina: number
  por_pagina: number
  datos: T[]
}

/** Respuesta de operación exitosa */
export interface RespuestaExito {
  mensaje: string
  exitoso: boolean
}

/** Parámetros de paginación para requests */
export interface ParametrosPaginacion {
  pagina?: number
  por_pagina?: number
  busqueda?: string
}

/** Estados posibles de una Orden de Trabajo */
export type EstadoOrden =
  | 'Registrado'
  | 'En Cola'
  | 'En Impresion'
  | 'En Acabado'
  | 'Finalizado'
  | 'Entregado'

/** Estados posibles de una Proforma */
export type EstadoProforma =
  | 'emitida'
  | 'aprobada'
  | 'rechazada'
  | 'vencida'
  | 'cerrada'

/** Modalidades de trabajo */
export type Modalidad = 'insumos_imprenta' | 'insumos_cliente'

/** Tipos de cliente */
export type TipoCliente = 'facultad' | 'docente' | 'autoridad' | 'estudiante' | 'particular'

/** Roles del sistema */
export type RolSistema =
  | 'Superadministrador'
  | 'Administrador'
  | 'Operador Mostrador'
  | 'Operador Taller'

/** Usuario autenticado (payload del JWT) */
export interface UsuarioAutenticado {
  sub: string       // email
  nombre: string
  rol: RolSistema
  id: number
  exp: number
}
