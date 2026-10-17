import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { usuariosApi } from '@/api/usuarios.api'
import type { RolResponse } from '@/types'

export function UsuarioFormPage() {
  const navigate = useNavigate()

  const [nombreCompleto, setNombreCompleto] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rolId, setRolId] = useState<number | ''>('')
  const [roles, setRoles] = useState<RolResponse[]>([])

  const [guardando, setGuardando] = useState(false)
  const [cargandoRoles, setCargandoRoles] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function cargarRoles() {
      try {
        setCargandoRoles(true)
        const data = await usuariosApi.listarRoles()
        setRoles(data || [])
        if (data?.length > 0) {
          setRolId(data[0].id_rol)
        }
      } catch {
        setError('Error al cargar la lista de roles del sistema.')
      } finally {
        setCargandoRoles(false)
      }
    }
    cargarRoles()
  }, [])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!rolId) return

    try {
      setGuardando(true)
      await usuariosApi.crear({
        nombre_completo: nombreCompleto,
        email,
        password,
        rol_id: Number(rolId),
        activo: true,
      })
      navigate('/administracion/usuarios')
    } catch {
      setError('Error al registrar el nuevo usuario institucional.')
    } finally {
      setGuardando(false)
    }
  }

  if (cargandoRoles) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-[#800000]" />
        <p className="text-sm font-semibold">Cargando roles del sistema...</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link
        to="/administracion/usuarios"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#800000] hover:text-[#670000] transition"
      >
        <ArrowLeft size={16} /> Volver a usuarios
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h1 className="text-2xl font-extrabold text-[#263454] flex items-center gap-2">
            <ShieldCheck size={22} className="text-[#800000]" />
            Registrar Usuario Institucional
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Alta de cuenta de usuario con credenciales y rol RBAC.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-sm">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              required
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              placeholder="Ej. Ing. Juan Pérez Ortiz"
              className="form-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Correo Electrónico Institucional *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@uagrm.edu.bo"
              className="form-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Contraseña de Acceso *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Rol del Sistema (RBAC) *
            </label>
            <select
              required
              value={rolId}
              onChange={(e) => setRolId(Number(e.target.value))}
              className="form-input text-sm font-semibold"
            >
              {roles.map((r) => (
                <option key={r.id_rol} value={r.id_rol}>
                  {r.nombre} {r.descripcion ? `- ${r.descripcion}` : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={guardando}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#800000] py-3 px-4 font-bold text-white shadow hover:bg-[#670000] transition disabled:opacity-60 cursor-pointer pt-3"
          >
            {guardando ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            <span>Guardar Cuenta de Usuario</span>
          </button>
        </form>
      </div>
    </div>
  )
}