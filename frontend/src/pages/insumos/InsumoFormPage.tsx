import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Layers, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { insumosApi } from '@/api/insumos.api'

export function InsumoFormPage() {
  const navigate = useNavigate()

  const [codigo, setCodigo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const categoriaId = 1
  const [stockMinimo, setStockMinimo] = useState(50)
  const [stockActual, setStockActual] = useState(100)
  const [costoReposicion, setCostoReposicion] = useState(38.5)
  const [unidadMedida, setUnidadMedida] = useState('PLIEGOS')

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    try {
      setGuardando(true)
      await insumosApi.crear({
        categoria_id: Number(categoriaId),
        codigo,
        descripcion,
        stock_minimo: Number(stockMinimo),
        stock_actual: Number(stockActual),
        costo_reposicion: Number(costoReposicion),
        unidad_medida: unidadMedida,
      })
      navigate('/insumos')
    } catch {
      setError('Error al registrar el nuevo insumo en el sistema.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        to="/insumos"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#800000] hover:text-[#670000] transition"
      >
        <ArrowLeft size={16} /> Volver a insumos
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h1 className="text-2xl font-extrabold text-[#263454] flex items-center gap-2">
            <Layers size={22} className="text-[#800000]" />
            Registrar Nuevo Insumo
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Alta de material litográfico en el catálogo central de la UAGRM.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-sm">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Código Institucional *
              </label>
              <input
                type="text"
                required
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ej. PAP-BOND-75"
                className="form-input text-sm font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Unidad de Medida *
              </label>
              <input
                type="text"
                required
                value={unidadMedida}
                onChange={(e) => setUnidadMedida(e.target.value)}
                placeholder="PLIEGOS, KG, UNIDADES..."
                className="form-input text-sm font-bold uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Descripción del Insumo *
            </label>
            <input
              type="text"
              required
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej. Papel Bond 75g tamaño 65 x 90 cm"
              className="form-input text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Stock Inicial
              </label>
              <input
                type="number"
                min="0"
                value={stockActual}
                onChange={(e) => setStockActual(parseFloat(e.target.value) || 0)}
                className="form-input text-right font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Stock Mínimo
              </label>
              <input
                type="number"
                min="0"
                value={stockMinimo}
                onChange={(e) => setStockMinimo(parseFloat(e.target.value) || 0)}
                className="form-input text-right font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Costo Reposición (Bs.)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costoReposicion}
                onChange={(e) => setCostoReposicion(parseFloat(e.target.value) || 0)}
                className="form-input text-right font-mono font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={guardando}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#800000] py-3 px-4 font-bold text-white shadow hover:bg-[#670000] transition disabled:opacity-60 cursor-pointer pt-3"
          >
            {guardando ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            <span>Guardar Insumo</span>
          </button>
        </form>
      </div>
    </div>
  )
}
