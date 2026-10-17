import { useState, useEffect, useCallback } from 'react'
import { History, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { reportesApi } from '@/api/reportes.api'
import type { BitacoraResponse } from '@/types'
import { formatearFechaHora } from '@/utils/formatters'

export function BitacoraPage() {
  const [registros, setRegistros] = useState<BitacoraResponse[]>([])
  const [cargando, setCargando] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const cargarBitacora = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      const res = await reportesApi.bitacora({ por_pagina: 100 })
      setRegistros(res.datos || [])
    } catch {
      setError('Error al consultar registros de auditoría de la bitácora.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarBitacora()
  }, [cargarBitacora])

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#800000]">Auditoría Inmutable</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#263454]">
            Bitácora de Seguridad del Sistema
          </h1>
          <p className="text-sm text-slate-500">
            Registro de trazabilidad y operaciones críticas para el Superadministrador.
          </p>
        </div>

        <button
          type="button"
          onClick={cargarBitacora}
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
          <p className="text-sm font-semibold">Cargando registros de auditoría...</p>
        </div>
      ) : registros.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <History size={40} className="mx-auto text-slate-300 mb-3" />
          <h2 className="text-base font-bold text-slate-700">Sin eventos en la bitácora</h2>
          <p className="text-xs text-slate-400 mt-1">Las operaciones realizadas en el sistema se registrarán aquí.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Fecha y Hora</th>
                <th className="py-3.5 px-4">Usuario ID</th>
                <th className="py-3.5 px-4">Módulo</th>
                <th className="py-3.5 px-4">Acción Realizada</th>
                <th className="py-3.5 px-4">IP Origen</th>
                <th className="py-3.5 px-4">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {registros.map((b) => (
                <tr key={b.id_bitacora} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4 text-slate-600 font-semibold whitespace-nowrap">
                    {formatearFechaHora(b.created_at)}
                  </td>
                  <td className="py-3.5 px-4 text-[#800000] font-bold">
                    #{b.usuario_id}
                  </td>
                  <td className="py-3.5 px-4 font-sans font-bold text-slate-700 uppercase">
                    {b.modulo}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold border border-slate-200">
                      {b.accion}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {b.ip_origen}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-sans max-w-xs truncate" title={b.detalle || ''}>
                    {b.detalle || '-'}
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
