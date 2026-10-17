import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Loader2,
  AlertCircle,
  User,
  Mail,
  Check,
  X,
} from 'lucide-react'
import { usuariosApi } from '@/api/usuarios.api'
import type { UsuarioResponse } from '@/types'
import { formatearFechaHora } from '@/utils/formatters'
import { ETIQUETAS_ROL } from '@/utils/constants'

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([])
  const [cargando, setCargando] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const cargarUsuarios = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      const res = await usuariosApi.listar({ por_pagina: 100 })
      setUsuarios(res.datos || [])
    } catch {
      setError('Error al cargar la lista de usuarios del sistema.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarUsuarios()
  }, [cargarUsuarios])

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#55a6bc]">Control de Accesos (RBAC)</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#263454]">
            Usuarios del Sistema
          </h1>
          <p className="text-sm text-slate-500">
            Administración de cuentas institucionales y asignación de roles operativos.
          </p>
        </div>

        <Link
          to="/administracion/usuarios/nuevo"
          className="flex items-center gap-2 rounded-xl bg-[#800000] px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-[#670000] transition"
        >
          <Plus size={16} /> Nuevo Usuario
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
          <p className="text-sm font-semibold">Cargando usuarios...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {usuarios.map((u) => {
            const nombreRol = u.rol?.nombre as keyof typeof ETIQUETAS_ROL | undefined
            const etiquetaRol = (nombreRol && ETIQUETAS_ROL[nombreRol]) || u.rol?.nombre || `Rol #${u.rol_id}`

            return (
              <div
                key={u.id_usuario}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-[#800000]">
                      #{u.id_usuario}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.activo
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {u.activo ? <Check size={11} /> : <X size={11} />}
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-[#263454] leading-snug flex items-center gap-2">
                    <User size={16} className="text-slate-400 shrink-0" />
                    {u.nombre_completo}
                  </h2>

                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <Mail size={12} className="text-slate-400" />
                    {u.email}
                  </p>

                  <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Rol Asignado:</span>
                    <strong className="text-slate-800 font-semibold">{etiquetaRol}</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                  Último acceso: <span className="text-slate-600 font-semibold">{formatearFechaHora(u.ultimo_acceso)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
