import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="p-4 bg-red-50 text-[#800000] rounded-2xl mb-4">
        <AlertCircle size={48} />
      </div>
      <h1 className="text-4xl font-extrabold text-[#263454] mb-2">404 - Página no encontrada</h1>
      <p className="text-slate-500 max-w-md mb-6">
        La ruta a la que intentas acceder no existe en el sistema de la Imprenta UAGRM.
      </p>
      <Link
        to="/dashboard"
        className="flex items-center gap-2 px-5 py-2.5 bg-[#800000] text-white font-bold rounded-xl hover:bg-[#670000] transition shadow-sm"
      >
        <ArrowLeft size={18} />
        Volver al inicio
      </Link>
    </div>
  )
}