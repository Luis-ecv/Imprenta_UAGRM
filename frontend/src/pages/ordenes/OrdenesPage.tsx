import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  LayoutDashboard,
  Clock3,
  Printer,
  Scissors,
  CheckCircle2,
  PackageCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  Layers,
  Droplet,
  Archive,
  Info,
  X,
  AlertOctagon,
} from 'lucide-react'
import { ordenesApi } from '@/api/ordenes.api'
import { insumosApi } from '@/api/insumos.api'
import type { OrdenTrabajoResponse, EstadoOrden, InsumoResponse } from '@/types'
import { formatearFecha } from '@/utils/formatters'
import { TRANSICIONES_ESTADO, COLORES_PRIORIDAD } from '@/utils/constants'

interface ColumnaKanban {
  id: EstadoOrden
  titulo: string
  subtitulo: string
  icono: React.ElementType
  colorBorde: string
  colorIcono: string
  colorFondo: string
}

const COLUMNAS_KANBAN: ColumnaKanban[] = [
  {
    id: 'REGISTRADO',
    titulo: 'Registradas',
    subtitulo: 'Ingreso inicial',
    icono: LayoutDashboard,
    colorBorde: 'border-slate-300',
    colorIcono: 'text-slate-500',
    colorFondo: 'bg-slate-100',
  },
  {
    id: 'EN COLA',
    titulo: 'En Cola',
    subtitulo: 'Pre-prensa / CTP',
    icono: Clock3,
    colorBorde: 'border-amber-400',
    colorIcono: 'text-amber-600',
    colorFondo: 'bg-amber-50',
  },
  {
    id: 'EN IMPRESION',
    titulo: 'En Impresión',
    subtitulo: 'Prensa Offset',
    icono: Printer,
    colorBorde: 'border-sky-500',
    colorIcono: 'text-sky-600',
    colorFondo: 'bg-sky-50',
  },
  {
    id: 'EN ACABADO',
    titulo: 'En Acabado',
    subtitulo: 'Corte y encuadernado',
    icono: Scissors,
    colorBorde: 'border-purple-500',
    colorIcono: 'text-purple-600',
    colorFondo: 'bg-purple-50',
  },
  {
    id: 'FINALIZADO',
    titulo: 'Finalizadas',
    subtitulo: 'Control de calidad',
    icono: CheckCircle2,
    colorBorde: 'border-emerald-500',
    colorIcono: 'text-emerald-600',
    colorFondo: 'bg-emerald-50',
  },
  {
    id: 'ENTREGADO',
    titulo: 'Entregadas',
    subtitulo: 'Despachado a cliente',
    icono: PackageCheck,
    colorBorde: 'border-teal-500',
    colorIcono: 'text-teal-600',
    colorFondo: 'bg-teal-50',
  },
]

export function OrdenesPage() {
  const [ordenes, setOrdenes] = useState<OrdenTrabajoResponse[]>([])
  const [insumos, setInsumos] = useState<InsumoResponse[]>([])
  const [cargando, setCargando] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [ordenParaCierre, setOrdenParaCierre] = useState<OrdenTrabajoResponse | null>(null)

  // Estados del modal de cierre técnico
  const [insumoId, setInsumoId] = useState<number | ''>('')
  const [papelUtilizado, setPapelUtilizado] = useState<string>('500')
  const [papelMerma, setPapelMerma] = useState<string>('15')
  const [tintaUtilizada, setTintaUtilizada] = useState<string>('0.8')
  const [planchasUtilizadas, setPlanchasUtilizadas] = useState<string>('4')
  const [planchasMerma, setPlanchasMerma] = useState<string>('0')
  const [observacionesCierre, setObservacionesCierre] = useState<string>('')
  const [guardandoCierre, setGuardandoCierre] = useState<boolean>(false)

  const cargarOrdenes = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      const [resOrdenes, resInsumos] = await Promise.all([
        ordenesApi.listar({ por_pagina: 100 }),
        insumosApi.listar({ por_pagina: 100 }),
      ])
      setOrdenes(resOrdenes.datos || [])
      setInsumos(resInsumos.datos || [])
      if (resInsumos.datos?.length > 0) {
        setInsumoId(resInsumos.datos[0].id_insumo)
      }
    } catch {
      setError('No se pudieron sincronizar las órdenes de trabajo del servidor.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarOrdenes()
  }, [cargarOrdenes])

  async function handleAvanzarEstado(orden: OrdenTrabajoResponse) {
    const siguienteEstado = TRANSICIONES_ESTADO[orden.estado_actual]
    if (!siguienteEstado) return

    // Si avanza a FINALIZADO, requerir cierre técnico y registro de consumo real
    if (siguienteEstado === 'FINALIZADO') {
      setOrdenParaCierre(orden)
      return
    }

    try {
      await ordenesApi.cambiarEstado(orden.id_orden, {
        estado_nuevo: siguienteEstado,
        observaciones: `Avance operativo a ${siguienteEstado}`,
      })
      cargarOrdenes()
    } catch {
      setError(`Error al cambiar el estado de la orden ${orden.codigo_ot} a ${siguienteEstado}.`)
    }
  }

  // Totales calculados en el modal de cierre técnico
  const totalesModal = useMemo(() => {
    const pU = Math.max(0, parseFloat(papelUtilizado) || 0)
    const pM = Math.max(0, parseFloat(papelMerma) || 0)
    const plU = Math.max(0, parseFloat(planchasUtilizadas) || 0)
    const plM = Math.max(0, parseFloat(planchasMerma) || 0)
    return {
      papelTotal: pU + pM,
      planchasTotal: plU + plM,
    }
  }, [papelUtilizado, papelMerma, planchasUtilizadas, planchasMerma])

  async function handleConfirmarCierre(event: React.FormEvent) {
    event.preventDefault()
    if (!ordenParaCierre) return

    try {
      setGuardandoCierre(true)

      // 1. Registrar el consumo real de sustrato y merma
      if (insumoId) {
        await ordenesApi.registrarConsumoReal(ordenParaCierre.id_orden, {
          orden_id: ordenParaCierre.id_orden,
          insumo_id: Number(insumoId),
          cantidad_utilizada: parseFloat(papelUtilizado) || 0,
          cantidad_merma: parseFloat(papelMerma) || 0,
        })
      }

      // 2. Avanzar estado a FINALIZADO
      await ordenesApi.cambiarEstado(ordenParaCierre.id_orden, {
        estado_nuevo: 'FINALIZADO',
        observaciones: observacionesCierre || 'Cierre técnico de taller con registro de consumo real y merma.',
      })

      setOrdenParaCierre(null)
      cargarOrdenes()
    } catch {
      setError('Error al registrar el consumo real y finalizar la orden.')
    } finally {
      setGuardandoCierre(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#55a6bc]">Centro de Operaciones</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#263454]">
            Tablero de Producción Litográfica
          </h1>
          <p className="text-sm text-slate-500">
            Supervisa el flujo secuencial de los trabajos en prensa offset, acabados y registro de mermas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700">
            {ordenes.length} Órdenes Activas
          </span>
        </div>
      </div>

      {/* Alerta de Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-sm">
          <AlertCircle size={20} className="shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Tablero Kanban */}
      {cargando ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-[#800000]" />
          <p className="text-sm font-semibold">Cargando tablero operativo de taller...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
          {COLUMNAS_KANBAN.map((columna) => {
            const IconoColumna = columna.icono
            const ordenesEnColumna = ordenes.filter((o) => o.estado_actual === columna.id)

            return (
              <div
                key={columna.id}
                className="flex flex-col rounded-2xl bg-slate-100/80 border border-slate-200 p-3 min-h-[550px]"
              >
                {/* Cabecera de la Columna */}
                <div className={`flex items-center justify-between p-2.5 rounded-xl border-l-4 ${columna.colorBorde} bg-white shadow-sm mb-3`}>
                  <div className="flex items-center gap-2">
                    <IconoColumna size={18} className={columna.colorIcono} />
                    <div>
                      <h2 className="text-xs font-bold text-slate-800 leading-tight">{columna.titulo}</h2>
                      <p className="text-[10px] text-slate-400">{columna.subtitulo}</p>
                    </div>
                  </div>
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-[11px] font-bold text-slate-700">
                    {ordenesEnColumna.length}
                  </span>
                </div>

                {/* Tarjetas de la Columna */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {ordenesEnColumna.map((orden) => {
                    const detalle = orden.detalles_orden?.[0]
                    const proformaDetalle = orden.proforma?.detalles?.[0]
                    const siguienteEstado = TRANSICIONES_ESTADO[orden.estado_actual]
                    const estiloPrioridad = COLORES_PRIORIDAD[orden.prioridad] || 'bg-slate-100 text-slate-700'

                    return (
                      <div
                        key={orden.id_orden}
                        className="flex flex-col justify-between p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="font-mono text-xs font-bold text-[#800000]">
                              {orden.codigo_ot}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${estiloPrioridad}`}>
                              {orden.prioridad}
                            </span>
                          </div>

                          <h3 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">
                            {proformaDetalle?.descripcion_trabajo || `Trabajo OT #${orden.id_orden}`}
                          </h3>

                          <p className="text-[11px] text-slate-500 mt-1">
                            {orden.proforma?.cliente?.razon_social || 'Cliente UAGRM'}
                          </p>

                          {detalle && (
                            <div className="mt-2 text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <p><strong>Corte:</strong> {detalle.formato_corte}</p>
                              <p><strong>Acabado:</strong> {detalle.tipo_encuadernacion}</p>
                            </div>
                          )}

                          <div className="mt-2 text-[10px] text-slate-400">
                            Compromiso: <span className="font-semibold text-slate-600">{formatearFecha(orden.fecha_compromiso)}</span>
                          </div>
                        </div>

                        {/* Botón de Avance de Estado */}
                        {siguienteEstado && (
                          <button
                            type="button"
                            onClick={() => handleAvanzarEstado(orden)}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-[#1f2d49] hover:bg-[#17233b] text-white text-xs font-bold transition shadow-sm cursor-pointer"
                          >
                            <span>
                              {siguienteEstado === 'FINALIZADO' ? 'Cierre Técnico' : siguienteEstado}
                            </span>
                            <ArrowRight size={13} />
                          </button>
                        )}
                      </div>
                    )
                  })}

                  {ordenesEnColumna.length === 0 && (
                    <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                      Sin órdenes en esta etapa
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de Cierre Técnico de Producción y Mermas (Basado en ModalCierreMermas.jsx) */}
      {ordenParaCierre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17233b]/70 p-4 backdrop-blur-sm" role="presentation">
          <form
            onSubmit={handleConfirmarCierre}
            className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <header className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-[#1f2d49] px-6 py-5 text-white">
              <div className="flex gap-3">
                <div className="rounded-xl bg-emerald-400/15 p-2 text-emerald-300">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold">Cierre Técnico de Producción</h2>
                  <p className="mt-0.5 text-xs text-slate-300">
                    {ordenParaCierre.codigo_ot} ? {ordenParaCierre.proforma?.detalles?.[0]?.descripcion_trabajo || 'Trabajo'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOrdenParaCierre(null)}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            </header>

            <div className="space-y-6 p-6">
              <div className="flex gap-3 rounded-xl border border-sky-200 bg-sky-50 p-3.5 text-xs leading-5 text-sky-900">
                <Info className="mt-0.5 shrink-0 text-sky-600" size={18} />
                <p>
                  Registra el consumo real y las mermas generadas. Los datos se descontarán automáticamente del inventario y alimentarán el dataset de predicción de Machine Learning.
                </p>
              </div>

              {/* Insumo Principal a Deducir */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Insumo de Sustrato Principal *
                </label>
                <select
                  required
                  value={insumoId}
                  onChange={(e) => setInsumoId(Number(e.target.value))}
                  className="form-input text-sm font-semibold"
                >
                  {insumos.map((i) => (
                    <option key={i.id_insumo} value={i.id_insumo}>
                      {i.codigo} - {i.descripcion} (Stock: {i.stock_actual} {i.unidad_medida})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sección de Sustrato / Pliegos */}
              <section>
                <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Layers size={16} className="text-[#800000]" />
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Sustrato (Papel / Cartulina)</h3>
                    <p className="text-[11px] text-slate-500">Consumo y calibración en pliegos</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Útil (Ejemplares OK)</label>
                    <input
                      type="number"
                      min="0"
                      value={papelUtilizado}
                      onChange={(e) => setPapelUtilizado(e.target.value)}
                      className="form-input text-right font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-orange-700 mb-1 flex items-center gap-1">
                      <AlertOctagon size={13} /> Merma (Calibración)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={papelMerma}
                      onChange={(e) => setPapelMerma(e.target.value)}
                      className="form-input text-right font-mono font-bold border-orange-300 bg-orange-50 text-orange-800"
                    />
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 flex flex-col justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Total a Deducir</span>
                    <strong className="text-right font-mono text-lg text-[#800000]">{totalesModal.papelTotal} pliegos</strong>
                  </div>
                </div>
              </section>

              {/* Tinta y Planchas */}
              <div className="grid gap-4 sm:grid-cols-2">
                <section>
                  <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Droplet size={16} className="text-[#2f8298]" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Tinta CMYK (kg)</h3>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={tintaUtilizada}
                    onChange={(e) => setTintaUtilizada(e.target.value)}
                    className="form-input text-right font-mono font-bold"
                  />
                </section>

                <section>
                  <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Archive size={16} className="text-slate-500" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Planchas CTP (Juegos)</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      value={planchasUtilizadas}
                      onChange={(e) => setPlanchasUtilizadas(e.target.value)}
                      className="form-input text-right font-mono font-bold"
                      placeholder="OK"
                    />
                    <input
                      type="number"
                      min="0"
                      value={planchasMerma}
                      onChange={(e) => setPlanchasMerma(e.target.value)}
                      className="form-input text-right font-mono font-bold border-orange-300 bg-orange-50 text-orange-800"
                      placeholder="Merma"
                    />
                  </div>
                </section>
              </div>

              {/* Observaciones Técnicas */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Observaciones Técnicas <span className="text-slate-400 font-normal">(Opcional)</span>
                </label>
                <textarea
                  rows={2}
                  value={observacionesCierre}
                  onChange={(e) => setObservacionesCierre(e.target.value)}
                  placeholder="Ej. Merma de 15 pliegos por ajuste de registro en pinzas y secado rápido..."
                  className="form-input text-sm resize-none"
                />
              </div>
            </div>

            <footer className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setOrdenParaCierre(null)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardandoCierre}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
              >
                {guardandoCierre ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Confirmar Consumo y Finalizar OT
              </button>
            </footer>
          </form>
        </div>
      )}
    </div>
  )
}