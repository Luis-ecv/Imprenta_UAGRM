import { useState, useEffect } from 'react'
import { Calculator, Loader2, AlertCircle } from 'lucide-react'
import { tarifasApi, type TarifaResponse } from '@/api/tarifas.api'
import { formatearMoneda } from '@/utils/formatters'

export function TarifasPage() {
  const [tarifas, setTarifas] = useState<TarifaResponse[]>([])
  const [cargando, setCargando] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function cargar() {
      try {
        setCargando(true)
        const data = await tarifasApi.listar()
        setTarifas(data || [])
      } catch {
        setError('Error al sincronizar tarifas y aranceles de impresión.')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#55a6bc]">Configuración Comercial</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#263454]">
          Tarifas y Aranceles Litográficos
        </h1>
        <p className="text-sm text-slate-500">
          Valores unitarios de impresión, mano de obra y acabados vigentes en la UAGRM.
        </p>
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
          <p className="text-sm font-semibold">Cargando tarifas...</p>
        </div>
      ) : tarifas.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Calculator size={40} className="mx-auto text-slate-300 mb-3" />
          <h2 className="text-base font-bold text-slate-700">Sin tarifas registradas</h2>
          <p className="text-xs text-slate-400 mt-1">Configura las tarifas en el backend para cotizaciones automáticas.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Concepto</th>
                <th className="py-3.5 px-4">Tipo Trabajo ID</th>
                <th className="py-3.5 px-4">Unidad</th>
                <th className="py-3.5 px-4 text-right">Costo Unitario</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tarifas.map((t) => (
                <tr key={t.id_tarifa} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4 font-bold text-[#263454]">{t.concepto}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-500">#{t.tipo_trabajo_id}</td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs uppercase">{t.unidad}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#800000]">
                    {formatearMoneda(t.costo_unitario)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Activa
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}