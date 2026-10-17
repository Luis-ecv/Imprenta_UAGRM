import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calculator,
  Loader2,
  Printer,
  Layers,
  Info,
} from 'lucide-react'
import { proformasApi } from '@/api/proformas.api'
import { clientesApi } from '@/api/clientes.api'
import { tarifasApi, type TipoTrabajoResponse } from '@/api/tarifas.api'
import type { ClienteResponse, Modalidad } from '@/types'
import { formatearMoneda } from '@/utils/formatters'

export function ProformaFormPage() {
  const navigate = useNavigate()

  // Estados de datos maestros
  const [clientes, setClientes] = useState<ClienteResponse[]>([])
  const [tiposTrabajo, setTiposTrabajo] = useState<TipoTrabajoResponse[]>([])
  const [cargandoMaestros, setCargandoMaestros] = useState<boolean>(true)

  // Estados del formulario
  const [clienteId, setClienteId] = useState<number | ''>('')
  const [modalidad, setModalidad] = useState<Modalidad>('insumos_imprenta')
  const [descripcionTrabajo, setDescripcionTrabajo] = useState<string>('')
  const [tipoTrabajoId, setTipoTrabajoId] = useState<number | ''>('')
  const [tiraje, setTiraje] = useState<number>(1000)
  const [numeroPaginas, setNumeroPaginas] = useState<number>(64)
  const [diasVigencia, setDiasVigencia] = useState<number>(15)

  // Estados de guardado y feedback
  const [guardando, setGuardando] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [proformaCreadaId, setProformaCreadaId] = useState<number | null>(null)

  // Cargar clientes y tipos de trabajo al montar
  useEffect(() => {
    async function cargarDatos() {
      try {
        setCargandoMaestros(true)
        const [resClientes, resTipos] = await Promise.all([
          clientesApi.listar({ por_pagina: 100 }),
          tarifasApi.listarTiposTrabajo(),
        ])
        setClientes(resClientes.datos || [])
        setTiposTrabajo(resTipos || [])
        if (resClientes.datos?.length > 0) {
          setClienteId(resClientes.datos[0].id_cliente)
        }
        if (resTipos?.length > 0) {
          setTipoTrabajoId(resTipos[0].id_tipo_trabajo)
        }
      } catch {
        setError('No se pudieron cargar los clientes o tipos de trabajo del servidor.')
      } finally {
        setCargandoMaestros(false)
      }
    }
    cargarDatos()
  }, [])

  // Cálculo técnico automático en tiempo real
  const calculos = useMemo(() => {
    const safeTiraje = Math.max(0, Number(tiraje) || 0)
    const safePaginas = Math.max(0, Number(numeroPaginas) || 0)
    // Pliegos = (Tiraje * Páginas) / 2 páginas por pliego doble cara
    const hojas = Math.ceil((safeTiraje * safePaginas) / 2)

    // Costo Papel: 0 si la modalidad es insumos_cliente
    const costoPapel = modalidad === 'insumos_imprenta' ? Number((hojas * 0.45).toFixed(2)) : 0
    const costoTinta = Number((safeTiraje * safePaginas * 0.04).toFixed(2))
    const costoPlanchas = 150 * 4 // 4 planchas CTP térmicas (CMYK) = 600 Bs
    const costoManoObra = Number((50 + safeTiraje * 0.05).toFixed(2))
    const total = Number((costoPapel + costoTinta + costoPlanchas + costoManoObra).toFixed(2))

    return {
      hojas,
      costoPapel,
      costoTinta,
      costoPlanchas,
      costoManoObra,
      total,
    }
  }, [modalidad, tiraje, numeroPaginas])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!clienteId || !tipoTrabajoId || !descripcionTrabajo.trim()) {
      setError('Por favor completa todos los campos requeridos.')
      return
    }

    try {
      setGuardando(true)
      setError(null)

      const payload = {
        cliente_id: Number(clienteId),
        modalidad,
        dias_vigencia: diasVigencia,
        detalles: [
          {
            descripcion_trabajo: descripcionTrabajo,
            tipo_trabajo_id: Number(tipoTrabajoId),
            tiraje: Number(tiraje),
            numero_paginas: Number(numeroPaginas),
            costo_papel: calculos.costoPapel,
            costo_tinta: calculos.costoTinta,
            costo_planchas: calculos.costoPlanchas,
            costo_mano_obra: calculos.costoManoObra,
            subtotal: calculos.total,
          },
        ],
      }

      const res = await proformasApi.crear(payload)
      setProformaCreadaId(res.id_proforma)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } }
        setError(axiosErr.response?.data?.detail || 'Error al emitir la proforma.')
      } else {
        setError('Error al conectar con el servidor.')
      }
    } finally {
      setGuardando(false)
    }
  }

  async function handleImprimir() {
    if (!proformaCreadaId) return
    try {
      const html = await proformasApi.obtenerImpresionHtml(proformaCreadaId)
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

  if (cargandoMaestros) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-[#800000]" />
        <p className="text-sm font-semibold">Cargando catálogos del sistema...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Link
            to="/proformas"
            className="mb-2 inline-flex items-center gap-2 text-sm font-bold text-[#800000] hover:text-[#670000] transition"
          >
            <ArrowLeft size={16} /> Volver a proformas
          </Link>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#55a6bc]">Nueva cotización</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#263454]">Crear Proforma</h1>
          <p className="text-sm text-slate-500">
            Calcula automáticamente el presupuesto litográfico según pliegos y costos vigentes.
          </p>
        </div>
      </div>

      {/* Alerta de Éxito al Crear */}
      {proformaCreadaId && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-900 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-bold">¡Proforma emitida exitosamente!</h3>
              <p className="text-xs text-emerald-700">
                El documento oficial ya está registrado en el sistema con su correlativo institucional.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleImprimir}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow transition"
            >
              <Printer size={16} /> Imprimir Oficial
            </button>
            <button
              type="button"
              onClick={() => navigate('/proformas')}
              className="flex-1 sm:flex-initial px-4 py-2 bg-white border border-emerald-300 text-emerald-800 font-bold rounded-xl text-sm hover:bg-emerald-100 transition"
            >
              Ir al listado
            </button>
          </div>
        </div>
      )}

      {/* Alerta de Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-sm">
          <AlertCircle size={20} className="shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        {/* Columna Izquierda: Parámetros del Trabajo */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText size={18} className="text-[#800000]" />
              Datos del Solicitante y Trabajo
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="cliente" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Cliente o Facultad *
                </label>
                <select
                  id="cliente"
                  required
                  value={clienteId}
                  onChange={(e) => setClienteId(Number(e.target.value))}
                  className="form-input text-sm font-semibold"
                >
                  {clientes.map((c) => (
                    <option key={c.id_cliente} value={c.id_cliente}>
                      {c.razon_social} ({c.tipo_cliente})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tipoTrabajo" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Tipo de Trabajo *
                </label>
                <select
                  id="tipoTrabajo"
                  required
                  value={tipoTrabajoId}
                  onChange={(e) => setTipoTrabajoId(Number(e.target.value))}
                  className="form-input text-sm font-semibold"
                >
                  {tiposTrabajo.map((t) => (
                    <option key={t.id_tipo_trabajo} value={t.id_tipo_trabajo}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="descripcion" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Descripción del Trabajo Litográfico *
              </label>
              <input
                id="descripcion"
                type="text"
                required
                value={descripcionTrabajo}
                onChange={(e) => setDescripcionTrabajo(e.target.value)}
                placeholder="Ej. Libro Académico 'Cálculo II' con tapa a color y anillado"
                className="form-input text-sm"
              />
            </div>

            {/* Selector de Modalidad */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Modalidad de Suministro de Insumos *
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setModalidad('insumos_imprenta')}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition ${
                    modalidad === 'insumos_imprenta'
                      ? 'border-[#800000] bg-red-50/50 text-[#800000] font-bold shadow-sm ring-1 ring-[#800000]'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="text-sm">Insumos de Imprenta</span>
                  <span className="text-[11px] font-normal text-slate-500 mt-1">La UAGRM provee el papel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalidad('insumos_cliente')}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition ${
                    modalidad === 'insumos_cliente'
                      ? 'border-[#800000] bg-red-50/50 text-[#800000] font-bold shadow-sm ring-1 ring-[#800000]'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="text-sm">Insumos del Cliente</span>
                  <span className="text-[11px] font-normal text-slate-500 mt-1">Papel provisto por solicitante (0 Bs.)</span>
                </button>
              </div>

              {modalidad === 'insumos_cliente' && (
                <div className="mt-3 flex items-start gap-2.5 p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs leading-5">
                  <Info size={16} className="text-sky-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Regla de negocio institucional:</strong> Al seleccionar insumos del cliente, el costo del papel se fija en 0.00 Bs y no se descuenta del inventario central.
                  </span>
                </div>
              )}
            </div>

            {/* Tiraje y Páginas */}
            <div className="grid gap-4 sm:grid-cols-3 pt-2">
              <div>
                <label htmlFor="tiraje" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Tiraje (Ejemplares)
                </label>
                <input
                  id="tiraje"
                  type="number"
                  min="1"
                  value={tiraje}
                  onChange={(e) => setTiraje(Math.max(1, parseInt(e.target.value) || 0))}
                  className="form-input text-right font-mono font-bold"
                />
              </div>

              <div>
                <label htmlFor="paginas" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Número de Páginas
                </label>
                <input
                  id="paginas"
                  type="number"
                  min="1"
                  value={numeroPaginas}
                  onChange={(e) => setNumeroPaginas(Math.max(1, parseInt(e.target.value) || 0))}
                  className="form-input text-right font-mono font-bold"
                />
              </div>

              <div>
                <label htmlFor="vigencia" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Vigencia (Días)
                </label>
                <input
                  id="vigencia"
                  type="number"
                  min="1"
                  max="90"
                  value={diasVigencia}
                  onChange={(e) => setDiasVigencia(Math.max(1, parseInt(e.target.value) || 0))}
                  className="form-input text-right font-mono font-bold"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Columna Derecha: Tarjeta de Desglose de Costos y Acciones */}
        <div className="space-y-6">
          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sticky top-24 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Calculator size={18} className="text-[#800000]" />
                Desglose Técnico
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
                {calculos.hojas} pliegos
              </span>
            </div>

            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between items-center text-slate-600">
                <span className="flex items-center gap-2">
                  <Layers size={14} className="text-slate-400" />
                  Papel ({modalidad === 'insumos_imprenta' ? 'Imprenta' : 'Cliente'}):
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {formatearMoneda(calculos.costoPapel)}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Tinta Offset CMYK:</span>
                <span className="font-mono font-bold text-slate-800">
                  {formatearMoneda(calculos.costoTinta)}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Planchas CTP (4 juegos):</span>
                <span className="font-mono font-bold text-slate-800">
                  {formatearMoneda(calculos.costoPlanchas)}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Mano de obra y prensa:</span>
                <span className="font-mono font-bold text-slate-800">
                  {formatearMoneda(calculos.costoManoObra)}
                </span>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-base font-extrabold text-[#263454]">Total Proforma:</span>
                <span className="text-2xl font-black font-mono text-[#800000]">
                  {formatearMoneda(calculos.total)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={guardando || !descripcionTrabajo.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#800000] py-3.5 px-4 font-bold text-white shadow-md hover:bg-[#670000] transition disabled:opacity-60 cursor-pointer"
            >
              {guardando ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Emitiendo Proforma...</span>
                </>
              ) : (
                <span>Guardar y Emitir Proforma</span>
              )}
            </button>
          </aside>
        </div>
      </form>
    </div>
  )
}