import { Link } from 'react-router-dom'
import { LogOut, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAlertas } from '@/hooks/useAlertas'
import { ETIQUETAS_ROL } from '@/utils/constants'

export function Navbar() {
  const { usuario, logout } = useAuth()
  const { cantidadAlertas } = useAlertas()

  // Extraer iniciales para el avatar
  const iniciales = usuario?.nombre_completo
    ? usuario.nombre_completo
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('')
    : 'U'

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-slate-500">Sistema Operativo</span>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-bold text-[#2a3964]">Imprenta Universitaria UAGRM</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Notificación de Stock Crítico */}
        {cantidadAlertas > 0 && (
          <Link
            to="/insumos/alertas"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold transition"
            title="Insumos con stock bajo el mínimo"
          >
            <AlertTriangle size={16} />
            <span>{cantidadAlertas} Stock Crítico</span>
          </Link>
        )}

        {/* Separador */}
        <div className="h-6 w-px bg-slate-200" />

        {/* Usuario Autenticado */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-[#263454] leading-tight">
              {usuario?.nombre_completo || 'Usuario'}
            </p>
            <p className="text-xs font-medium text-[#55a6bc]">
              {usuario?.rol ? ETIQUETAS_ROL[usuario.rol] || usuario.rol : ''}
            </p>
          </div>
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#55a6bc] text-white text-sm font-extrabold shadow-sm">
            {iniciales}
          </div>
        </div>

        {/* Botón de Logout */}
        <button
          type="button"
          onClick={logout}
          className="p-2 rounded-xl text-slate-400 hover:text-[#800000] hover:bg-red-50 transition"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  )
}