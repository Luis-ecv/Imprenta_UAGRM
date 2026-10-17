import type { EstadoOrden, EstadoProforma, RolSistema, PrioridadOrden } from '@/types'

export const COLORES_ESTADO_ORDEN: Record<EstadoOrden, string> = {
  REGISTRADO: 'bg-slate-100 text-slate-800 border-slate-300',
  'EN COLA': 'bg-amber-100 text-amber-800 border-amber-300',
  'EN IMPRESION': 'bg-sky-100 text-sky-800 border-sky-300',
  'EN ACABADO': 'bg-purple-100 text-purple-800 border-purple-300',
  FINALIZADO: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  ENTREGADO: 'bg-teal-100 text-teal-800 border-teal-300',
}

export const COLORES_ESTADO_PROFORMA: Record<EstadoProforma, string> = {
  EMITIDA: 'bg-blue-100 text-blue-800 border-blue-300',
  APROBADA: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  RECHAZADA: 'bg-rose-100 text-rose-800 border-rose-300',
  VENCIDA: 'bg-gray-100 text-gray-700 border-gray-300',
}

export const COLORES_PRIORIDAD: Record<PrioridadOrden, string> = {
  URGENTE: 'border-red-200 bg-red-50 text-red-700',
  NORMAL: 'border-slate-200 bg-slate-50 text-slate-700',
}

export const TRANSICIONES_ESTADO: Record<EstadoOrden, EstadoOrden | null> = {
  REGISTRADO: 'EN COLA',
  'EN COLA': 'EN IMPRESION',
  'EN IMPRESION': 'EN ACABADO',
  'EN ACABADO': 'FINALIZADO',
  FINALIZADO: 'ENTREGADO',
  ENTREGADO: null,
}

export const ETIQUETAS_ROL: Record<RolSistema, string> = {
  Superadministrador: 'Superadministrador',
  Administrador: 'Administrador / Jefe de Imprenta',
  'Operador Mostrador': 'Operador de Mostrador',
  'Operador Taller': 'Operador de Taller / Prensa',
  Cliente: 'Cliente Universitario',
}