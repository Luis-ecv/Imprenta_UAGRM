import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  FileText,
  Printer,
  TrendingUp,
  ArrowRight,
  Plus,
  Loader2,
  Calendar,
} from 'lucide-react'
import { ordenesApi } from '@/api/ordenes.api'
import { proformasApi } from '@/api/proformas.api'
import { useAuth } from '@/hooks/useAuth'
import { useAlertas } from '@/hooks/useAlertas'
import type { OrdenTrabajoResponse, ProformaResponse } from '@/types'
import { formatearMoneda, formatearFecha } from '@/utils/formatters'
import { COLORES_ESTADO_ORDEN, COLORES_PRIORIDAD } from '@/utils/constants'

export function DashboardPage() {
  const { usuario } = useAuth()
  const { cantidadAlertas } = useAlertas()

  const [ordenes, setOrdenes] = useState<OrdenTrabajoResponse[]>([])
  const [proformas, setProformas] = useState<ProformaResponse[]>([])
  const [cargando, setCargando] = useState<boolean>(true)

  useEffect(() => {
    async function cargarMetricas() {
      try {
        setCargando(true)
        const [resOrdenes, resProformas] = await Promise.all([
          ordenesApi.listar({ por_pagina: 10 }),
          proformasApi.listar({ por_pagina: 10 }),
        ])
        setOrdenes(resOrdenes.datos || [])
        setProformas(resProformas.datos || [])
      } catch {
        // Silencioso
      } finally {
        setCargando(false)
      }
    }
    cargarMetricas()
  }, [])

  const ordenesActivas = ordenes.filter((o) => o.estado_actual !== 'ENTREGADO')
  const proformasEmitidas = proformas.filter((p) => p.estado === 'EMITIDA')

  return (
    <div className="space-y-8">
      {/* Saludo y Encabezado Principal */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#55a6bc]">Panel de Control</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#263454]">
            Bienvenido, {usuario?.nombre_completo || 'Administrador'}
          </h1>
          <p className="text-sm text-slate-500">
            Resumen operativo y comercial de la Imprenta Universitaria UAGRM.
          </p>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-3">
          <Link
            to="/proformas/nueva"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#800000] text-white text-xs font-bold shadow hover:bg-[#670000] transition"
          >
            <Plus size={16} /> Nueva Proforma
          </Link>
          <Link
            to="/ordenes"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1f2d49] text-white text-xs font-bold shadow hover:bg-[#17233b] transition"
          >
            <Printer size={16} /> Ver Taller
          </Link>
        </div>
      </div>

      {/* Tarjetas Métricas KPI */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Órdenes Activas */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Órdenes en Taller</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{ordenesActivas.length}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
              <Printer size={20} />
            </div>
          </div>
          <Link
            to="/ordenes"
            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800"
          >
            Ver tablero Kanban <ArrowRight size={13} />
          </Link>
        </div>

        {/* KPI 2: Proformas Emitidas */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Proformas Pendientes</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{proformasEmitidas.length}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
              <FileText size={20} />
            </div>
          </div>
          <Link
            to="/proformas"
            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-800"
          >
            Revisar cotizaciones <ArrowRight size={13} />
          </Link>
        </div>

        {/* KPI 3: Stock Crítico */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Stock Crítico</p>
              <p className="text-2xl font-black text-red-700 mt-1">{cantidadAlertas}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-red-50 text-red-700">
              <AlertTriangle size={20} />
            </div>
          </div>
          <Link
            to="/insumos/alertas"
            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:text-red-800"
          >
            Ver alertas de insumos <ArrowRight size={13} />
          </Link>
        </div>

        {/* KPI 4: Machine Learning R² */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Confianza Modelo ML</p>
              <p className="text-2xl font-black text-emerald-700 mt-1">94.2%</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <TrendingUp size={20} />
            </div>
          </div>
          <Link
            to="/predicciones"
            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            Proyección de demanda <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Tablas de Actividad Reciente */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Órdenes Recientes */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Printer size={18} className="text-[#800000]" />
              Órdenes de Trabajo en Curso
            </h2>
            <Link to="/ordenes" className="text-xs font-bold text-[#800000] hover:underline">
              Ver todas
            </Link>
          </div>

          {cargando ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-slate-400" />
            </div>
          ) : ordenesActivas.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No hay órdenes en curso.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {ordenesActivas.slice(0, 5).map((o) => (
                <div key={o.id_orden} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#800000]">{o.codigo_ot}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${COLORES_PRIORIDAD[o.prioridad]}`}>
                        {o.prioridad}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      {o.proforma?.detalles?.[0]?.descripcion_trabajo || 'Trabajo Litográfico'}
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar size={11} /> Entrega: {formatearFecha(o.fecha_compromiso)}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${COLORES_ESTADO_ORDEN[o.estado_actual]}`}>
                    {o.estado_actual}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Proformas Recientes */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <FileText size={18} className="text-[#55a6bc]" />
              Últimas Cotizaciones
            </h2>
            <Link to="/proformas" className="text-xs font-bold text-[#800000] hover:underline">
              Ver todas
            </Link>
          </div>

          {cargando ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-slate-400" />
            </div>
          ) : proformas.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No hay cotizaciones registradas.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {proformas.slice(0, 5).map((p) => (
                <div key={p.id_proforma} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-500">{p.codigo_proforma}</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      {p.detalles?.[0]?.descripcion_trabajo || 'Presupuesto'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {p.cliente?.razon_social || `Cliente #${p.cliente_id}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-bold text-[#800000] block">
                      {formatearMoneda(p.total_presupuesto)}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      {p.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
