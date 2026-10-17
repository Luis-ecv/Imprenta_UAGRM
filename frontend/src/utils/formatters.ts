/**
 * Formateadores de fecha, moneda y números para la Imprenta UAGRM.
 */

export function formatearMoneda(monto: number | string | null | undefined): string {
  const numero = typeof monto === 'string' ? parseFloat(monto) : Number(monto ?? 0)
  if (isNaN(numero)) return '0.00 Bs.'
  return new Intl.NumberFormat('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numero) + ' Bs.'
}

export function formatearFecha(fechaStr: string | null | undefined): string {
  if (!fechaStr) return '-'
  try {
    const fecha = new Date(fechaStr)
    return new Intl.DateTimeFormat('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(fecha)
  } catch {
    return fechaStr
  }
}

export function formatearFechaHora(fechaStr: string | null | undefined): string {
  if (!fechaStr) return '-'
  try {
    const fecha = new Date(fechaStr)
    return new Intl.DateTimeFormat('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(fecha)
  } catch {
    return fechaStr
  }
}