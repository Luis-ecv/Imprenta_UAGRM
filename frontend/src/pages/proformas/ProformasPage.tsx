import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FileText,
  Plus,
  Printer,
  CheckCircle,
  XCircle,
  PlayCircle,
  Search,
  Loader2,
  AlertCircle,
  Calendar,
  X,
} from 'lucide-react'
import { proformasApi } from '@/api/proformas.api'
import { ordenesApi } from '@/api/ordenes.api'
import type { ProformaResponse, EstadoProforma, PrioridadOrden } from '@/types'
import { formatearMoneda, formatearFecha } from '@/utils/formatters'
import { COLORES_ESTADO_PROFORMA } from '@/utils/constants'

export function ProformasPage() {
  const navigate = useNavigate()

  const [proformas, setProformas] = useState<ProformaResponse[]>([])
  const [cargando, setCargando] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<string>('TODAS')
  const [busqueda, setBusqueda] = useState<string>('')

  // Modal para generar Orden de Trabajo desde Proforma Aprobada
  const [proformaParaOT, setProformaParaOT] = useState<ProformaResponse | null>(null)
  const [fechaCompromiso, setFechaCompromiso] = useState<string>('')
  const [prioridad, setPrioridad] = useState<PrioridadOrden>('NORMAL')
  const [formatoCorte, setFormatoCorte] = useState<string>('Carta 21.5 x 28 cm')
  const [tipoEncuadernacion, setTipoEncuadernacion] = useState<string>('Anillado plástico')
  const [especificaciones, setEspecificaciones] = useState<string>('')
  const [creandoOT, setCreandoOT] = useState<boolean>(false)

  // Cargar proformas
  const cargarProformas = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      const params = filtroEstado !== 'TODAS' ? { estado: filtroEstado, por_pagina: 50 } : { por_pagina: 50 }
      const res = await proformasApi.listar(params)
      setProformas(res.datos || [])
    } catch {
      setError('No se pudieron cargar las proformas del servidor.')
    } finally {
      setCargando(false)
    }
  }, [filtroEstado])

  useEffect(() => {
    cargarProformas()
  }, [cargarProformas])

  async function handleCambiarEstado(id: number, nuevoEstado: EstadoProforma) {
    try {
      await proformasApi.cambiarEstado(id, nuevoEstado)
      cargarProformas()
    } catch {
      setError(`No se pudo cambiar el estado de la proforma a ${nuevoEstado}.`)
    }
  }

  async function handleImprimir(id: number) {
    try {
      const html = await proformasApi.obtenerImpresionHtml(id)
      const ventana = window.open('', '_blank')
      if (ventana) {
        ventana.document.write(html)
        ventana.document.close()
        ventana.focus()
        ventana.print()
      }
    } catch {
      setError('Error al generar el formato imprimible oficial.')
    }
  }

  async function handleCrearOT(event: React.FormEvent) {
    event.preventDefault()
    if (!proformaParaOT) return

    try {
      setCreandoOT(true)
      await ordenesApi.crear({
        proforma_id: proformaParaOT.id_proforma,
        fecha_compromiso: fechaCompromiso || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        prioridad,
        detalle_orden: {
          formato_corte: formatoCorte,
          tipo_encuadernacion: tipoEncuadernacion,
          especificaciones_taller: especificaciones || undefined,
        },
      })
      setProformaParaOT(null)
      navigate('/ordenes')
    } catch {
      setError('No se pudo generar la orden de trabajo para esta proforma.')
    } finally {
      setCreandoOT(false)
    }
  }

  const proformasFiltradas = proformas.filter((p) => {
    const coincideTexto =
      p.codigo_proforma.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.cliente?.razon_social?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.detalles?.[0]?.descripcion_trabajo?.toLowerCase().includes(busqueda.toLowerCase())
    return coincideTexto
  })

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#55a6bc]">Gestión Comercial</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#263454]">Proformas y Cotizaciones</h1>
          <p className="text-sm text-slate-500">
            Administra presupuestos emitidos, aprobaciones y emisión de órdenes de trabajo.
          </p>
        </div>
        <Link
          to="/proformas/nueva"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#800000] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#670000] transition"
        >
          <Plus size={18} /> Nueva Proforma
        </Link>
      </div>

      {/* Alerta de Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-sm">
          <AlertCircle size={20} className="shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Filtros por Estado y Búsqueda */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['TODAS', 'EMITIDA', 'APROBADA', 'RECHAZADA', 'VENCIDA'].map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                filtroEstado === estado
                  ? 'bg-[#1f2d49] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {estado}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código o cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#800000]"
          />
        </div>
      </div>

      {/* Listado de Proformas */}
      {cargando ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-[#800000]" />
          <p className="text-sm font-semibold">Cargando proformas...</p>
        </div>
      ) : proformasFiltradas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <FileText size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-700">No se encontraron proformas</h3>
          <p className="text-sm text-slate-400 mt-1">Crea una nueva cotización o ajusta los filtros.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {proformasFiltradas.map((p) => {
            const detalle = p.detalles?.[0]
            const estiloEstado = COLORES_ESTADO_PROFORMA[p.estado] || 'bg-slate-100 text-slate-800'

            return (
              <div
                key={p.id_proforma}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#800000]">
                        {p.codigo_proforma}
                      </span>
                      <h2 className="text-base font-bold text-[#263454] mt-0.5 leading-snug">
                        {detalle?.descripcion_trabajo || 'Sin descripción'}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        {p.cliente?.razon_social || `Cliente #${p.cliente_id}`}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${estiloEstado}`}>
                      {p.estado}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl mb-4">
                    <div>
                      <span className="text-slate-400 block">Tiraje:</span>
                      <strong className="text-slate-800">{detalle?.tiraje || 0} ejs.</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Páginas:</span>
                      <strong className="text-slate-800">{detalle?.numero_paginas || 0} págs.</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Modalidad:</span>
                      <strong className="text-slate-800 capitalize">
                        {p.modalidad === 'insumos_imprenta' ? 'Imprenta' : 'Cliente'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Vence:</span>
                      <span className="text-slate-800 flex items-center gap-1 font-semibold">
                        <Calendar size={12} /> {formatearFecha(p.fecha_vencimiento)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-baseline border-t border-slate-100 pt-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Presupuesto</span>
                    <span className="text-xl font-extrabold font-mono text-[#800000]">
                      {formatearMoneda(p.total_presupuesto)}
                    </span>
                  </div>
                </div>

                {/* Barra de Acciones */}
                <div className="flex items-center gap-2 pt-4 border-t border-slate-100 mt-4">
                  <button
                    type="button"
                    onClick={() => handleImprimir(p.id_proforma)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                    title="Imprimir formato oficial UAGRM"
                  >
                    <Printer size={14} /> Imprimir
                  </button>

                  {p.estado === 'EMITIDA' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleCambiarEstado(p.id_proforma, 'APROBADA')}
                        className="p-2 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                        title="Aprobar Proforma"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCambiarEstado(p.id_proforma, 'RECHAZADA')}
                        className="p-2 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                        title="Rechazar Proforma"
                      >
                        <XCircle size={16} />
                      </button>
                    </>
                  )}

                  {p.estado === 'APROBADA' && (
                    <button
                      type="button"
                      onClick={() => {
                        setProformaParaOT(p)
                        setFechaCompromiso(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0])
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-[#800000] text-white hover:bg-[#670000] transition"
                      title="Enviar a Taller / Producción"
                    >
                      <PlayCircle size={14} /> Generar OT
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal para Generar Orden de Trabajo */}
      {proformaParaOT && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17233b]/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCrearOT}
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between bg-[#1f2d49] px-6 py-4 text-white">
              <h2 className="text-base font-bold flex items-center gap-2">
                <PlayCircle size={20} className="text-emerald-400" />
                Generar Orden de Trabajo Litográfica
              </h2>
              <button
                type="button"
                onClick={() => setProformaParaOT(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-600 border border-slate-200">
                <p><strong>Proforma:</strong> {proformaParaOT.codigo_proforma}</p>
                <p><strong>Trabajo:</strong> {proformaParaOT.detalles?.[0]?.descripcion_trabajo}</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Fecha de Compromiso de Entrega *
                </label>
                <input
                  type="date"
                  required
                  value={fechaCompromiso}
                  onChange={(e) => setFechaCompromiso(e.target.value)}
                  className="form-input text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Prioridad *
                  </label>
                  <select
                    value={prioridad}
                    onChange={(e) => setPrioridad(e.target.value as PrioridadOrden)}
                    className="form-input text-sm font-semibold"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="URGENTE">Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Formato de Corte
                  </label>
                  <input
                    type="text"
                    value={formatoCorte}
                    onChange={(e) => setFormatoCorte(e.target.value)}
                    className="form-input text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Tipo de Encuadernación
                </label>
                <input
                  type="text"
                  value={tipoEncuadernacion}
                  onChange={(e) => setTipoEncuadernacion(e.target.value)}
                  className="form-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Especificaciones para el Taller
                </label>
                <textarea
                  rows={2}
                  value={especificaciones}
                  onChange={(e) => setEspecificaciones(e.target.value)}
                  placeholder="Ej. Planchas térmicas 4 colores, secado rápido..."
                  className="form-input text-sm resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 bg-slate-50 px-6 py-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setProformaParaOT(null)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={creandoOT}
                className="flex items-center gap-2 px-5 py-2 text-sm font-bold bg-[#800000] text-white rounded-xl hover:bg-[#670000] shadow transition"
              >
                {creandoOT ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
                Confirmar y Pasar a Taller
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}