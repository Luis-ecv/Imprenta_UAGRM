import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Layers,
  ShoppingCart,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { insumosApi } from '@/api/insumos.api'
import type { InsumoResponse } from '@/types'
import { formatearMoneda } from '@/utils/formatters'

export function StockAlertasPage() {
  const [alertas, setAlertas] = useState<InsumoResponse[]>([])
  const [cargando, setCargando] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  async function cargarAlertas() {
    try {
      setCargando(true)
      setError(null)
      const data = await insumosApi.obtenerAlertas()
      setAlertas(data || [])
    } catch {
      setError('Error al sincronizar alertas de stock crítico.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarAlertas()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#800000]">Gestión de Almacén</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#263454]">
            Alertas de Stock Crítico
          </h1>
          <p className="text-sm text-slate-500">
            Materiales e insumos litográficos con saldo actual por debajo del stock mínimo de seguridad.
          </p>
        </div>

        <button
          type="button"
          onClick={cargarAlertas}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition"
        >
          <RefreshCw size={14} className={cargando ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-sm">
          <AlertCircle size={18} className="shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {cargando ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-[#800000]" />
          <p className="text-sm font-semibold">Consultando inventario en tiempo real...</p>
        </div>
      ) : alertas.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <Layers size={24} />
          </div>
          <h2 className="text-base font-bold text-slate-800">Inventario Óptimo</h2>
          <p className="text-xs text-slate-400 mt-1">
            Todos los insumos se encuentran por encima del umbral de stock mínimo.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {alertas.map((insumo) => (
            <div
              key={insumo.id_insumo}
              className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-[#800000]">{insumo.codigo}</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                    <AlertTriangle size={11} /> Crítico
                  </span>
                </div>
                <h2 className="text-base font-bold text-[#263454] leading-snug">{insumo.descripcion}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{insumo.categoria?.nombre || 'Insumo de Imprenta'}</p>

                <div className="grid grid-cols-2 gap-2 text-xs bg-red-50/50 p-3 rounded-xl border border-red-100 mt-4">
                  <div>
                    <span className="text-slate-500 block">Stock Actual:</span>
                    <strong className="text-red-700 text-base font-mono">{insumo.stock_actual} {insumo.unidad_medida}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Mínimo Requerido:</span>
                    <strong className="text-slate-700 text-base font-mono">{insumo.stock_minimo} {insumo.unidad_medida}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Reposición</span>
                  <span className="font-mono font-bold text-slate-800 text-xs">
                    {formatearMoneda(insumo.costo_reposicion)} / {insumo.unidad_medida}
                  </span>
                </div>
                <Link
                  to="/compras/nueva"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#800000] text-white text-xs font-bold hover:bg-[#670000] transition"
                >
                  <ShoppingCart size={13} /> Pedir
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}