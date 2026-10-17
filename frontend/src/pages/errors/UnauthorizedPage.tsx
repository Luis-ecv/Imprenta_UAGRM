import { Link } from 'react-router-dom'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

export function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="p-4 bg-amber-50 text-amber-700 rounded-2xl mb-4">
        <ShieldAlert size={48} />
      </div>
      <h1 className="text-4xl font-extrabold text-[#263454] mb-2">403 - Acceso no autorizado</h1>
      <p className="text-slate-500 max-w-md mb-6">
        Tu rol actual no dispone de los permisos necesarios para visualizar o interactuar con este módulo.
      </p>
      <Link
        to="/login"
        className="flex items-center gap-2 px-5 py-2.5 bg-[#1f2d49] text-white font-bold rounded-xl hover:bg-[#17233b] transition shadow-sm"
      >
        <ArrowLeft size={18} />
        Ir al acceso principal
      </Link>
    </div>
  )
}