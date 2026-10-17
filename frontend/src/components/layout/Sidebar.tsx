import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Layers,
  AlertTriangle,
  Users,
  FileText,
  Printer,
  ShoppingCart,
  BrainCircuit,
  BarChart3,
  ShieldCheck,
  History,
  BookOpen,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAlertas } from '@/hooks/useAlertas'
import type { RolSistema } from '@/types'

interface NavItem {
  nombre: string
  ruta: string
  icono: React.ElementType
  rolesPermitidos: RolSistema[]
  mostrarAlerta?: boolean
}

const NAV_ITEMS: NavItem[] = [
  {
    nombre: 'Dashboard',
    ruta: '/dashboard',
    icono: LayoutDashboard,
    rolesPermitidos: ['Superadministrador', 'Administrador'],
  },
  {
    nombre: 'Insumos',
    ruta: '/insumos',
    icono: Layers,
    rolesPermitidos: ['Superadministrador', 'Administrador', 'Operador Mostrador', 'Operador Taller'],
  },
  {
    nombre: 'Alertas de Stock',
    ruta: '/insumos/alertas',
    icono: AlertTriangle,
    rolesPermitidos: ['Superadministrador', 'Administrador', 'Operador Mostrador', 'Operador Taller'],
    mostrarAlerta: true,
  },
  {
    nombre: 'Clientes',
    ruta: '/clientes',
    icono: Users,
    rolesPermitidos: ['Superadministrador', 'Administrador', 'Operador Mostrador'],
  },
  {
    nombre: 'Proformas',
    ruta: '/proformas',
    icono: FileText,
    rolesPermitidos: ['Superadministrador', 'Administrador', 'Operador Mostrador', 'Cliente'],
  },
  {
    nombre: 'Órdenes de Trabajo',
    ruta: '/ordenes',
    icono: Printer,
    rolesPermitidos: ['Superadministrador', 'Administrador', 'Operador Taller', 'Cliente'],
  },
  {
    nombre: 'Compras',
    ruta: '/compras',
    icono: ShoppingCart,
    rolesPermitidos: ['Superadministrador', 'Administrador'],
  },
  {
    nombre: 'Predicciones ML',
    ruta: '/predicciones',
    icono: BrainCircuit,
    rolesPermitidos: ['Superadministrador', 'Administrador'],
  },
  {
    nombre: 'Reportes',
    ruta: '/reportes',
    icono: BarChart3,
    rolesPermitidos: ['Superadministrador', 'Administrador'],
  },
  {
    nombre: 'Usuarios',
    ruta: '/administracion/usuarios',
    icono: ShieldCheck,
    rolesPermitidos: ['Superadministrador', 'Administrador'],
  },
  {
    nombre: 'Bitácora',
    ruta: '/bitacora',
    icono: History,
    rolesPermitidos: ['Superadministrador'],
  },
]

export function Sidebar() {
  const { rol } = useAuth()
  const location = useLocation()
  const { cantidadAlertas } = useAlertas()

  // Filtrar las opciones según el rol del usuario autenticado
  const itemsVisibles = NAV_ITEMS.filter((item) =>
    rol ? item.rolesPermitidos.includes(rol) : false
  )

  return (
    <aside className="flex flex-col w-64 bg-[#1f2d49] text-white min-h-screen border-r border-slate-700 select-none">
      {/* Encabezado del Sidebar con Identidad UAGRM */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/60 bg-[#17233b]">
        <div className="rounded-xl bg-[#800000] p-2.5 text-white shadow-md">
          <BookOpen size={24} aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-base font-extrabold tracking-wider text-white">EIU UAGRM</h1>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#55a6bc]">
            Imprenta Universitaria
          </p>
        </div>
      </div>

      {/* Navegación por Módulos */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Módulos del Sistema
        </div>
        {itemsVisibles.map((item) => {
          const Icono = item.icono
          const activo = location.pathname === item.ruta || (item.ruta !== '/' && location.pathname.startsWith(item.ruta))

          return (
            <Link
              key={item.ruta}
              to={item.ruta}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activo
                  ? 'bg-[#800000] text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icono size={18} className={activo ? 'text-white' : 'text-[#55a6bc]'} />
                <span>{item.nombre}</span>
              </div>
              {item.mostrarAlerta && cantidadAlertas > 0 && (
                <span className="flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded-full">
                  {cantidadAlertas}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Pie del Sidebar con versión */}
      <div className="p-4 border-t border-slate-700/60 text-xs text-slate-400 text-center">
        <p className="font-semibold text-slate-300">UAGRM © 2026</p>
        <p className="text-[10px] text-slate-500">Gestión de Imprenta & ML</p>
      </div>
    </aside>
  )
}