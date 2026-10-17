import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Search,
  AlertTriangle,
  ArrowUpDown,
  Loader2,
  AlertCircle,
  X,
  CheckCircle2,
} from 'lucide-react'
import { insumosApi } from '@/api/insumos.api'
import type { InsumoResponse } from '@/types'
import { formatearMoneda } from '@/utils/formatters'

export function InsumosPage() {
  const [insumos, setInsumos] = useState<InsumoResponse[]>([])
  const [cargando, setCargando] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState<string>('')

  // Modal para registrar movimiento de almacén
  const [insumoParaMovimiento, setInsumoParaMovimiento] = useState<InsumoResponse | null>(null)
  const [tipoMovimiento, setTipoMovimiento] = useState<'INGRESO_COMPRA' | 'AJUSTE' | 'MERMA'>('INGRESO_COMPRA')
  const [cantidad, setCantidad] = useState<string>('10')
  const [referencia, setReferencia] = useState<string>('')
  const [guardandoMovimiento, setGuardandoMovimiento] = useState<boolean>(false)

  const cargarInsumos = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      const res = await insumosApi.listar({ por_pagina: 100 })
      setInsumos(res.datos || [])
    } catch {
      setError('Error al cargar catálogo de insumos.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarInsumos()
  }, [cargarInsumos])

  async function handleGuardarMovimiento(event: React.FormEvent) {
    event.preventDefault()
    if (!insumoParaMovimiento) return

    try {
      setGuardandoMovimiento(true)
      await insumosApi.registrarMovimiento({
        insumo_id: insumoParaMovimiento.id_insumo,
        tipo_movimiento: tipoMovimiento,
        cantidad: Math.abs(parseFloat(cantidad) || 0),
        referencia: referencia || undefined,
      })
      setInsumoParaMovimiento(null)
      cargarInsumos()
    } catch {
      setError('Error al registrar el movimiento de inventario.')
    } finally {
      setGuardandoMovimiento(false)
    }
  }

  const insumosFiltrados = insumos.filter((i) =>
    i.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
    i.codigo.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#55a6bc]">Gestión de Almacén</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#263454]">
            Insumos y Materiales
          </h1>
          <p className="text-sm text-slate-500">
            Control de stocks, costos de reposición y movimientos de inventario litográfico.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/insumos/nuevo"
            className="flex items-center gap-2 rounded-xl bg-[#800000] px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-[#670000] transition"
          >
            <Plus size={16} /> Nuevo Insumo
          </Link>
          <Link
            to="/insumos/alertas"
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-2.5 text-xs font-bold hover:bg-red-100 transition"
          >
            <AlertTriangle size={16} /> Stock Crítico
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-sm">
          <AlertCircle size={18} className="shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Barra de Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#800000]"
          />
        </div>
        <span className="text-xs font-bold text-slate-400">
          {insumosFiltrados.length} Registros
        </span>
      </div>

      {/* Tabla de Insumos */}
      {cargando ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-[#800000]" />
          <p className="text-sm font-semibold">Cargando catálogo de materiales...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Código</th>
                <th className="py-3.5 px-4">Descripción</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4 text-right">Stock Actual</th>
                <th className="py-3.5 px-4 text-right">Mínimo</th>
                <th className="py-3.5 px-4 text-right">Reposición</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {insumosFiltrados.map((i) => {
                const esCritico = Number(i.stock_actual) <= Number(i.stock_minimo)
                const esAlerta = Number(i.stock_actual) <= Number(i.stock_minimo) * 1.5 && !esCritico

                return (
                  <tr key={i.id_insumo} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#800000]">
                      {i.codigo}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#263454]">
                      {i.descripcion}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {i.categoria?.nombre || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                      {i.stock_actual} <span className="text-xs font-normal text-slate-400">{i.unidad_medida}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                      {i.stock_minimo}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                      {formatearMoneda(i.costo_reposicion)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {esCritico ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                          <AlertTriangle size={11} /> Crítico
                        </span>
                      ) : esAlerta ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Preventivo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Óptimo
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setInsumoParaMovimiento(i)
                          setCantidad('10')
                          setReferencia('')
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
                      >
                        <ArrowUpDown size={12} /> Movimiento
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para Registrar Movimiento de Almacén */}
      {insumoParaMovimiento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17233b]/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleGuardarMovimiento}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between bg-[#1f2d49] px-6 py-4 text-white">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <ArrowUpDown size={16} className="text-[#55a6bc]" />
                Registrar Movimiento de Inventario
              </h2>
              <button
                type="button"
                onClick={() => setInsumoParaMovimiento(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <p><strong>Insumo:</strong> {insumoParaMovimiento.codigo} - {insumoParaMovimiento.descripcion}</p>
                <p><strong>Saldo Actual:</strong> {insumoParaMovimiento.stock_actual} {insumoParaMovimiento.unidad_medida}</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Tipo de Movimiento *
                </label>
                <select
                  value={tipoMovimiento}
                  onChange={(e) => setTipoMovimiento(e.target.value as 'INGRESO_COMPRA' | 'AJUSTE' | 'MERMA')}
                  className="form-input text-sm font-semibold"
                >
                  <option value="INGRESO_COMPRA">Ingreso por Compra (+)</option>
                  <option value="AJUSTE">Ajuste de Auditoría (+/-)</option>
                  <option value="MERMA">Deducción por Merma (-)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Cantidad ({insumoParaMovimiento.unidad_medida}) *
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className="form-input text-right font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Referencia / N° Factura o Nota
                </label>
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Ej. Factura 2049 Proveedor Papeles del Oriente"
                  className="form-input text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 bg-slate-50 px-6 py-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setInsumoParaMovimiento(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardandoMovimiento}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-[#800000] text-white rounded-xl hover:bg-[#670000] shadow transition"
              >
                {guardandoMovimiento ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Confirmar Registro
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
