import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Printer, Loader2 } from 'lucide-react'
import { proformasApi } from '@/api/proformas.api'
import type { ProformaResponse } from '@/types'
import { formatearMoneda, formatearFecha } from '@/utils/formatters'
import { COLORES_ESTADO_PROFORMA } from '@/utils/constants'
import { imprimirDocumentoHtml } from '@/utils/impresion'

export function ProformaDetallePage() {
  const { id } = useParams<{ id: string }>()
  const [proforma, setProforma] = useState<ProformaResponse | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      if (!id) return
      try {
        setCargando(true)
        const data = await proformasApi.obtener(Number(id))
        setProforma(data)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [id])

  async function handleImprimir() {
    if (!id) return
    const html = await proformasApi.obtenerImpresionHtml(Number(id))
    imprimirDocumentoHtml(html)
  }

  if (cargando) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-[#800000]" />
      </div>
    )
  }

  if (!proforma) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>No se encontr� la proforma solicitada.</p>
        <Link to="/proformas" className="text-[#800000] font-bold mt-2 inline-block">Volver a proformas</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/proformas" className="inline-flex items-center gap-2 text-sm font-bold text-[#800000]">
        <ArrowLeft size={16} /> Volver a proformas
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="font-mono text-xs font-bold text-[#800000]">{proforma.codigo_proforma}</span>
            <h1 className="text-2xl font-black text-[#263454] mt-1">
              {proforma.detalles?.[0]?.descripcion_trabajo || 'Detalle de Proforma'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Cliente: <strong>{proforma.cliente?.razon_social || `ID #${proforma.cliente_id}`}</strong>
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${COLORES_ESTADO_PROFORMA[proforma.estado]}`}>
            {proforma.estado}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <span className="text-slate-400 block">Fecha de Emisi�n:</span>
            <strong className="text-slate-800">{formatearFecha(proforma.fecha_emision)}</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Vencimiento:</span>
            <strong className="text-slate-800">{formatearFecha(proforma.fecha_vencimiento)}</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Modalidad:</span>
            <strong className="text-slate-800 capitalize">{proforma.modalidad === 'insumos_imprenta' ? 'Insumos Imprenta' : 'Insumos Cliente'}</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Total Cotizado:</span>
            <strong className="text-lg font-mono text-[#800000]">{formatearMoneda(proforma.total_presupuesto)}</strong>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleImprimir}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1e2b4d] text-white font-bold text-xs shadow hover:bg-[#141d34] transition"
          >
            <Printer size={16} /> Imprimir Formato Oficial UAGRM
          </button>
        </div>
      </div>
    </div>
  )
}
