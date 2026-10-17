import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Info,
  Loader2,
  AlertOctagon,
} from 'lucide-react'
import { ordenesApi } from '@/api/ordenes.api'
import { insumosApi } from '@/api/insumos.api'
import type { OrdenTrabajoResponse, InsumoResponse } from '@/types'

export function ConsumoRealPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [orden, setOrden] = useState<OrdenTrabajoResponse | null>(null)
  const [insumos, setInsumos] = useState<InsumoResponse[]>([])
  const [cargando, setCargando] = useState<boolean>(true)
  const [guardando, setGuardando] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [insumoId, setInsumoId] = useState<number | ''>('')
  const [papelUtilizado, setPapelUtilizado] = useState<string>('500')
  const [papelMerma, setPapelMerma] = useState<string>('15')
  const [observaciones, setObservaciones] = useState<string>('')

  useEffect(() => {
    async function cargar() {
      if (!id) return
      try {
        setCargando(true)
        const [resOrden, resInsumos] = await Promise.all([
          ordenesApi.obtener(Number(id)),
          insumosApi.listar({ por_pagina: 100 }),
        ])
        setOrden(resOrden)
        setInsumos(resInsumos.datos || [])
        if (resInsumos.datos?.length > 0) {
          setInsumoId(resInsumos.datos[0].id_insumo)
        }
      } catch {
        setError('Error al cargar la orden o el catálogo de insumos.')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [id])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!orden || !insumoId) return

    try {
      setGuardando(true)
      await ordenesApi.registrarConsumoReal(orden.id_orden, {
        orden_id: orden.id_orden,
        insumo_id: Number(insumoId),
        cantidad_utilizada: parseFloat(papelUtilizado) || 0,
        cantidad_merma: parseFloat(papelMerma) || 0,
      })
      navigate('/ordenes')
    } catch {
      setError('Error al registrar el consumo real de producción.')
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-[#800000]" />
        <p className="text-sm font-semibold">Cargando datos de la orden...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/ordenes"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#800000] hover:text-[#670000] transition"
      >
        <ArrowLeft size={16} /> Volver al tablero de producción
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-4">
          <span className="font-mono text-xs font-bold text-[#800000]">{orden?.codigo_ot}</span>
          <h1 className="text-2xl font-extrabold text-[#263454] mt-1">
            Registro de Consumo Real y Mermas
          </h1>
          <p className="text-xs text-slate-500">
            {orden?.proforma?.detalles?.[0]?.descripcion_trabajo || 'Orden de Trabajo Litográfica'}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-sm">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-3 rounded-xl border border-sky-200 bg-sky-50 p-3.5 text-xs leading-5 text-sky-900">
          <Info size={18} className="shrink-0 text-sky-600 mt-0.5" />
          <span>
            Los consumos registrados se deducen del almacén central y alimentan el dataset de Machine Learning para optimizar los pedidos futuros.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
              Insumo de Sustrato
            </label>
            <select
              required
              value={insumoId}
              onChange={(e) => setInsumoId(Number(e.target.value))}
              className="form-input text-sm font-semibold"
            >
              {insumos.map((i) => (
                <option key={i.id_insumo} value={i.id_insumo}>
                  {i.codigo} - {i.descripcion} ({i.unidad_medida})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Cantidad Útil Utilizada
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={papelUtilizado}
                onChange={(e) => setPapelUtilizado(e.target.value)}
                className="form-input text-right font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-orange-700 mb-1 flex items-center gap-1">
                <AlertOctagon size={13} /> Merma (Desperdicio)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={papelMerma}
                onChange={(e) => setPapelMerma(e.target.value)}
                className="form-input text-right font-mono font-bold border-orange-300 bg-orange-50 text-orange-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Observaciones del Prensista
            </label>
            <textarea
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej. Merma por calibración de pinzas y balance agua-tinta..."
              className="form-input text-sm resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={guardando}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#800000] py-3 px-4 font-bold text-white shadow hover:bg-[#670000] transition disabled:opacity-60 cursor-pointer"
          >
            {guardando ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Registrando Consumo...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Guardar Consumo Real</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}