import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, Calendar, CheckCircle2 } from 'lucide-react'
import { ordenesApi } from '@/api/ordenes.api'
import type { OrdenTrabajoResponse } from '@/types'
import { formatearFecha } from '@/utils/formatters'
import { COLORES_ESTADO_ORDEN, COLORES_PRIORIDAD } from '@/utils/constants'

export function OrdenDetallePage() {
  const { id } = useParams<{ id: string }>()
  const [orden, setOrden] = useState<OrdenTrabajoResponse | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      if (!id) return
      try {
        setCargando(true)
        const data = await ordenesApi.obtener(Number(id))
        setOrden(data)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [id])

  if (cargando) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-[#800000]" />
      </div>
    )
  }

  if (!orden) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>No se encontró la orden solicitada.</p>
        <Link to="/ordenes" className="text-[#800000] font-bold mt-2 inline-block">Volver a taller</Link>
      </div>
    )
  }

  const detalle = orden.detalles_orden?.[0]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/ordenes" className="inline-flex items-center gap-2 text-sm font-bold text-[#800000]">
        <ArrowLeft size={16} /> Volver al tablero
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="font-mono text-xs font-bold text-[#800000]">{orden.codigo_ot}</span>
            <h1 className="text-2xl font-black text-[#263454] mt-1">
              {orden.proforma?.detalles?.[0]?.descripcion_trabajo || 'Orden de Producción'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Cliente: <strong>{orden.proforma?.cliente?.razon_social || 'UAGRM'}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${COLORES_PRIORIDAD[orden.prioridad]}`}>
              {orden.prioridad}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${COLORES_ESTADO_ORDEN[orden.estado_actual]}`}>
              {orden.estado_actual}
            </span>
          </div>
        </div>

        {detalle && (
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
            <p><strong>Formato de Corte:</strong> {detalle.formato_corte}</p>
            <p><strong>Encuadernación:</strong> {detalle.tipo_encuadernacion}</p>
            {detalle.especificaciones_taller && (
              <p><strong>Especificaciones Taller:</strong> {detalle.especificaciones_taller}</p>
            )}
            <p className="flex items-center gap-1 text-slate-600">
              <Calendar size={13} /> Fecha de Compromiso: <strong>{formatearFecha(orden.fecha_compromiso)}</strong>
            </p>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <Link
            to={`/ordenes/${orden.id_orden}/consumo`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow hover:bg-emerald-700 transition"
          >
            <CheckCircle2 size={16} /> Registrar Consumo Real y Mermas
          </Link>
        </div>
      </div>
    </div>
  )
}
