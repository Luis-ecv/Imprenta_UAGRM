/**
 * Componente de ruta restringida por rol.
 * Redirige a la página de no autorizado si el rol no tiene acceso.
 */
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { RolSistema } from '@/types/common.types'

interface RoleRouteProps {
  rolesPermitidos: RolSistema[]
}

export function RoleRoute({ rolesPermitidos }: RoleRouteProps) {
  const { rol } = useAuth()
  const tienePermiso = rol !== null && rolesPermitidos.includes(rol)
  return tienePermiso ? <Outlet /> : <Navigate to="/no-autorizado" replace />
}
