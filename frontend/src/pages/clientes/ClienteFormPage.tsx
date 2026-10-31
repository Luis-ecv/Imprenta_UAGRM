import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Check, AlertCircle, Loader2 } from 'lucide-react'
import { clientesApi } from '@/api/clientes.api'
import type { TipoCliente } from '@/types'

export function ClienteFormPage() {
  const navigate = useNavigate()

  const [razonSocial, setRazonSocial] = useState('')
  const [tipoCliente, setTipoCliente] = useState<TipoCliente>('facultad')
  const [nitCi, setNitCi] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [contacto, setContacto] = useState('')

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    try {
      setGuardando(true)
      await clientesApi.crear({
        razon_social: razonSocial,
        tipo_cliente: tipoCliente,
        nit_ci: nitCi || undefined,
        telefono: telefono || undefined,
        email: email || undefined,
        contacto_responsable: contacto || undefined,
      })
      navigate('/clientes')
    } catch {
      setError('Error al registrar el cliente en el sistema.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        to="/clientes"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#800000] hover:text-[#670000] transition"
      >
        <ArrowLeft size={16} /> Volver a clientes
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h1 className="text-2xl font-extrabold text-[#263454] flex items-center gap-2">
            <Users size={22} className="text-[#800000]" />
            Registrar Solicitante / Cliente
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Alta de facultad, unidad académica o cliente particular.
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
              Razón Social / Nombre de Unidad o Facultad *
            </label>
            <input
              type="text"
              required
              value={razonSocial}
              onChange={(e) => setRazonSocial(e.target.value)}
              placeholder="Ej. Facultad de Ciencias Exactas y Tecnología"
              className="form-input text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Tipo de Solicitante *
              </label>
              <select
                value={tipoCliente}
                onChange={(e) => setTipoCliente(e.target.value as TipoCliente)}
                className="form-input text-sm font-semibold"
              >
                <option value="facultad">Facultad / Carrera UAGRM</option>
                <option value="docente">Docente Universitario</option>
                <option value="autoridad">Autoridad / Rectorado</option>
                <option value="estudiante">Estudiante</option>
                <option value="particular">Particular / Externo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                NIT o Cédula de Identidad
              </label>
              <input
                type="text"
                value={nitCi}
                onChange={(e) => setNitCi(e.target.value)}
                placeholder="Ej. 1028374023"
                className="form-input text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Teléfono / Celular
              </label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej. 76012345"
                className="form-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contacto@uagrm.edu.bo"
                className="form-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Nombre de Contacto / Responsable
            </label>
            <input
              type="text"
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
              placeholder="Ej. Lic. Carlos Valdivia (Director de Carrera)"
              className="form-input text-sm"
            />
          </div>

          <div className="flex items-center justify-center gap-3 pt-3">
            <Link
              to="/clientes"
              className="flex items-center justify-center rounded-full bg-[#607285] px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-[#4f5e6d] transition min-w-[125px]"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={guardando}
              className="flex items-center justify-center gap-2 rounded-full bg-[#1e2b4d] px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-[#141d34] transition disabled:opacity-60 cursor-pointer min-w-[165px]"
            >
              {guardando ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} />}
              <span>Confirmar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}