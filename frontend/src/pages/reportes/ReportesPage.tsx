import { useState } from 'react'
import { BarChart3, Download, Layers, FileText, TrendingDown, Loader2 } from 'lucide-react'
import { reportesApi } from '@/api/reportes.api'

export function ReportesPage() {
  const [cargando, setCargando] = useState<boolean>(false)
  const [reporteActivo, setReporteActivo] = useState<'consumo' | 'proformas' | 'inventario'>('consumo')
  const [datosReporte, setDatosReporte] = useState<unknown>(null)

  async function cargarReporte(tipo: 'consumo' | 'proformas' | 'inventario') {
    try {
      setCargando(true)
      setReporteActivo(tipo)
      let data: unknown
      if (tipo === 'consumo') {
        data = await reportesApi.consumo()
      } else if (tipo === 'proformas') {
        data = await reportesApi.proformas()
      } else {
        data = await reportesApi.inventario()
      }
      setDatosReporte(data)
    } catch {
      // Silencioso
    } finally {
      setCargando(false)
    }
  }

  function handleImprimir() {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#55a6bc]">Reportes Analíticos</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#263454]">
            Informes de Gestión Litográfica
          </h1>
          <p className="text-sm text-slate-500">
            Exportaciones analíticas de consumo real, mermas y recaudación por facultades.
          </p>
        </div>

        <button
          type="button"
          onClick={handleImprimir}
          className="flex items-center gap-2 rounded-xl bg-[#800000] px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-[#670000] transition"
        >
          <Download size={16} /> Imprimir / Exportar
        </button>
      </div>

      {/* Selector de Tipo de Reporte */}
      <div className="flex gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-fit">
        <button
          onClick={() => cargarReporte('consumo')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            reporteActivo === 'consumo'
              ? 'bg-[#1f2d49] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingDown size={14} /> Consumo y Mermas
        </button>
        <button
          onClick={() => cargarReporte('proformas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            reporteActivo === 'proformas'
              ? 'bg-[#1f2d49] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText size={14} /> Proformas y Finanzas
        </button>
        <button
          onClick={() => cargarReporte('inventario')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            reporteActivo === 'inventario'
              ? 'bg-[#1f2d49] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers size={14} /> Estado de Almacén
        </button>
      </div>

      {/* Visualización de Datos */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm min-h-[300px]">
        {cargando ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-[#800000]" />
            <p className="text-sm font-semibold">Generando informe analítico...</p>
          </div>
        ) : datosReporte ? (
          <pre className="p-4 bg-slate-50 rounded-xl text-xs font-mono overflow-x-auto text-slate-800">
            {JSON.stringify(datosReporte, null, 2)}
          </pre>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <BarChart3 size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-700">Selecciona un tipo de informe para visualizar los datos</p>
            <p className="text-xs text-slate-400 mt-1">Los datos se consolidan desde los registros operativos del backend.</p>
          </div>
        )}
      </div>
    </div>
  )
}