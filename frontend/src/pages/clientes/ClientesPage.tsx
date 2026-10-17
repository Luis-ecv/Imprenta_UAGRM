import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Search,
  Phone,
  Mail,
  Loader2,
  AlertCircle,
  Building,
} from 'lucide-react'
import { clientesApi } from '@/api/clientes.api'
import type { ClienteResponse } from '@/types'

const COLORES_TIPO_CLIENTE: Record<string, string> = {
  facultad: 'bg-blue-100 text-blue-800 border-blue-200',
  docente: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  autoridad: 'bg-purple-100 text-purple-800 border-purple-200',
  estudiante: 'bg-amber-100 text-amber-800 border-amber-200',
  particular: 'bg-slate-100 text-slate-700 border-slate-200',
}

export function ClientesPage() {
  const [clientes, setClientes] = useState<ClienteResponse[]>([])
  const [cargando, setCargando] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState<string>('')

  const cargarClientes = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      const res = await clientesApi.listar({ por_pagina: 100 })
      setClientes(res.datos || [])
    } catch {
      setError('Error al sincronizar clientes del servidor.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarClientes()
  }, [cargarClientes])

  const clientesFiltrados = clientes.filter((c) =>
    c.razon_social.toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.nit_ci && c.nit_ci.toLowerCase().includes(busqueda.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(busqueda.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#55a6bc]">Padrón Universitario</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#263454]">
            Clientes y Solicitantes
          </h1>
          <p className="text-sm text-slate-500">
            Registro de facultades, carreras, docentes y público universitario.
          </p>
        </div>

        <Link
          to="/clientes/nuevo"
          className="flex items-center gap-2 rounded-xl bg-[#800000] px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-[#670000] transition"
        >
          <Plus size={16} /> Nuevo Cliente
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-sm">
          <AlertCircle size={18} className="shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Buscador */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, NIT/CI o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#800000]"
          />
        </div>
        <span className="text-xs font-bold text-slate-400">
          {clientesFiltrados.length} Solicitantes
        </span>
      </div>

      {/* Listado de Clientes */}
      {cargando ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-[#800000]" />
          <p className="text-sm font-semibold">Cargando solicitantes...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clientesFiltrados.map((c) => {
            const estiloTipo = COLORES_TIPO_CLIENTE[c.tipo_cliente] || 'bg-slate-100 text-slate-700'

            return (
              <div
                key={c.id_cliente}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-[#800000]">
                      #{c.id_cliente}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${estiloTipo}`}>
                      {c.tipo_cliente}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-[#263454] leading-snug flex items-center gap-1.5">
                    <Building size={16} className="text-slate-400 shrink-0" />
                    {c.razon_social}
                  </h2>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p><strong>NIT/CI:</strong> {c.nit_ci || 'S/N'}</p>
                    {c.contacto_responsable && (
                      <p><strong>Responsable:</strong> {c.contacto_responsable}</p>
                    )}
                    {c.telefono && (
                      <p className="flex items-center gap-1 text-slate-500">
                        <Phone size={12} /> {c.telefono}
                      </p>
                    )}
                    {c.email && (
                      <p className="flex items-center gap-1 text-slate-500">
                        <Mail size={12} /> {c.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <Link
                    to={`/clientes/${c.id_cliente}`}
                    className="text-xs font-bold text-[#800000] hover:underline"
                  >
                    Editar datos ?
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
