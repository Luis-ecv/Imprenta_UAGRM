/**
 * Constantes del sistema usadas en toda la SPA.
 * Centralizar aquí evita strings hardcodeados en los componentes.
 */
import type { EstadoOrden, RolSistema } from '@/types/common.types'

/** Colores de badge por estado de la Orden de Trabajo */
export const COLORES_ESTADO_ORDEN: Record<EstadoOrden, string> = {
  'Registrado':    'bg-gray-100 text-gray-800',
  'En Cola':       'bg-yellow-100 text-yellow-800',
  'En Impresion':  'bg-blue-100 text-blue-800',
  'En Acabado':    'bg-purple-100 text-purple-800',
  'Finalizado':    'bg-green-100 text-green-800',
  'Entregado':     'bg-emerald-100 text-emerald-800',
}

/** Secuencia válida de transiciones de estado (para validar en frontend) */
export const TRANSICIONES_ESTADO: Record<EstadoOrden, EstadoOrden | null> = {
  'Registrado':   'En Cola',
  'En Cola':      'En Impresion',
  'En Impresion': 'En Acabado',
  'En Acabado':   'Finalizado',
  'Finalizado':   'Entregado',
  'Entregado':    null,
}

/** Roles que pueden crear Órdenes directas (sin proforma) */
export const ROLES_ORDEN_DIRECTA: RolSistema[] = [
  'Superadministrador',
  'Administrador',
]

/** Etiquetas legibles de los roles */
export const ETIQUETAS_ROL: Record<RolSistema, string> = {
  'Superadministrador': 'Superadmin',
  'Administrador':      'Admin / Jefe de Imprenta',
  'Operador Mostrador': 'Mostrador / Recepción',
  'Operador Taller':    'Operador de Taller',
}
