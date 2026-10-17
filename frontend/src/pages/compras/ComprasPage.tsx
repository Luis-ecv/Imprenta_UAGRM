import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingCart,
  Plus,
  Loader2,
  AlertCircle,
  Building2,
  Calendar,
} from 'lucide-react'
import { comprasApi } from '@/api/compras.api'
import type { OrdenCompraResponse } from '@/types'
import { formatearMoneda, formatearFecha } from '@/utils/formatters'

export function ComprasPage() {
  const [compras, setCompras] = useState<OrdenCompraResponse[]>([])
  const [cargando, setCargando] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const cargarCompras = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      const res = await comprasApi.listar({ por_pagina: 100 })
      setCompras(res.datos || [])
    } catch {
      setError('Error al sincronizar órdenes de compra.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarCompras()
  }, [cargarCompras])

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#55a6bc]">Gestión de Abastecimiento</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#263454]">
            Órdenes de Compra
          </h1>
          <p className="text-sm text-slate-500">
            Adquisición de insumos litográficos y reposición a proveedores autorizados.
          </p>
        </div>

        <Link
          to="/compras/nueva"
          className="flex items-center gap-2 rounded-xl bg-[#800000] px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-[#670000] transition"
        >
          <Plus size={16} /> Nueva Orden de Compra
        </Link>
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
          <p className="text-sm font-semibold">Cargando órdenes de compra...</p>
        </div>
      ) : compras.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <ShoppingCart size={40} className="mx-auto text-slate-300 mb-3" />
          <h2 className="text-base font-bold text-slate-700">Sin órdenes de compra</h2>
          <p className="text-xs text-slate-400 mt-1">Genera un pedido para reponer inventario de materiales.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {compras.map((c) => (
            <div
              key={c.id_orden_compra}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-[#800000]">
                    #{c.id_orden_compra}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                    {c.estado}
                  </span>
                </div>

                <h2 className="text-base font-bold text-[#263454] leading-snug flex items-center gap-1.5">
                  <Building2 size={16} className="text-slate-400 shrink-0" />
                  {c.proveedor?.razon_social || `Proveedor #${c.proveedor_id}`}
                </h2>

                <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <p className="flex items-center gap-1">
                    <Calendar size={12} className="text-slate-400" />
                    Fecha: <strong>{formatearFecha(c.fecha_generacion)}</strong>
                  </p>
                  {c.prediccion_id && (
                    <p className="text-[#55a6bc] font-semibold">
                      Generada con inferencia ML #{c.prediccion_id}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Monto Estimado</span>
                <span className="text-xl font-black font-mono text-[#800000]">
                  {formatearMoneda(c.total_estimado)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}