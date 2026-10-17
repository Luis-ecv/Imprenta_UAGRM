import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { comprasApi } from '@/api/compras.api'
import type { ProveedorResponse } from '@/types'

export function CompraFormPage() {
  const navigate = useNavigate()

  const [proveedores, setProveedores] = useState<ProveedorResponse[]>([])
  const [proveedorId, setProveedorId] = useState<number | ''>('')
  const [totalEstimado, setTotalEstimado] = useState<string>('1500')
  const [estado, setEstado] = useState<string>('SUGERIDA')

  const [guardando, setGuardando] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function cargarProveedores() {
      try {
        setCargando(true)
        const data = await comprasApi.listarProveedores()
        setProveedores(data || [])
        if (data?.length > 0) {
          setProveedorId(data[0].id_proveedor)
        }
      } catch {
        setError('Error al cargar proveedores autorizados.')
      } finally {
        setCargando(false)
      }
    }
    cargarProveedores()
  }, [])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!proveedorId) return

    try {
      setGuardando(true)
      await comprasApi.crear({
        proveedor_id: Number(proveedorId),
        total_estimado: parseFloat(totalEstimado) || 0,
        estado,
      })
      navigate('/compras')
    } catch {
      setError('Error al generar la orden de compra.')
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-[#800000]" />
        <p className="text-sm font-semibold">Cargando proveedores...</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link
        to="/compras"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#800000] hover:text-[#670000] transition"
      >
        <ArrowLeft size={16} /> Volver a compras
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h1 className="text-2xl font-extrabold text-[#263454] flex items-center gap-2">
            <ShoppingCart size={22} className="text-[#800000]" />
            Generar Orden de Compra
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Emisión de pedido de reposición para el almacén de la imprenta.
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
              Proveedor Autorizado *
            </label>
            <select
              required
              value={proveedorId}
              onChange={(e) => setProveedorId(Number(e.target.value))}
              className="form-input text-sm font-semibold"
            >
              {proveedores.map((p) => (
                <option key={p.id_proveedor} value={p.id_proveedor}>
                  {p.razon_social} (NIT: {p.nit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Monto Total Estimado (Bs.) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={totalEstimado}
              onChange={(e) => setTotalEstimado(e.target.value)}
              className="form-input text-right font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Estado Inicial
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="form-input text-sm font-semibold"
            >
              <option value="SUGERIDA">Sugerida por ML / Preventiva</option>
              <option value="ENVIADA">Enviada al Proveedor</option>
              <option value="APROBADA">Aprobada por Administración</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={guardando}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#800000] py-3 px-4 font-bold text-white shadow hover:bg-[#670000] transition disabled:opacity-60 cursor-pointer pt-3"
          >
            {guardando ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            <span>Emitir Pedido de Compra</span>
          </button>
        </form>
      </div>
    </div>
  )
}