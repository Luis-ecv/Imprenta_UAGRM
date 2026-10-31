import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { useAuth } from '@/hooks/useAuth'

// Auth & Errors
import { LoginPage } from '@/pages/auth/LoginPage'
import { NotFoundPage } from '@/pages/errors/NotFoundPage'
import { UnauthorizedPage } from '@/pages/errors/UnauthorizedPage'

// Modulos
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { InsumosPage } from '@/pages/insumos/InsumosPage'
import { InsumoFormPage } from '@/pages/insumos/InsumoFormPage'
import { StockAlertasPage } from '@/pages/insumos/StockAlertasPage'
import { ClientesPage } from '@/pages/clientes/ClientesPage'
import { ClienteFormPage } from '@/pages/clientes/ClienteFormPage'
import { ProformasPage } from '@/pages/proformas/ProformasPage'
import { ProformaFormPage } from '@/pages/proformas/ProformaFormPage'
import { ProformaDetallePage } from '@/pages/proformas/ProformaDetallePage'
import { OrdenesPage } from '@/pages/ordenes/OrdenesPage'
import { OrdenDetallePage } from '@/pages/ordenes/OrdenDetallePage'
import { ConsumoRealPage } from '@/pages/ordenes/ConsumoRealPage'
import { ComprasPage } from '@/pages/compras/ComprasPage'
import { CompraFormPage } from '@/pages/compras/CompraFormPage'
import { CompraDetallePage } from '@/pages/compras/CompraDetallePage'
import { ProveedoresPage } from '@/pages/proveedores/ProveedoresPage'
import { PrediccionesPage } from '@/pages/predicciones/PrediccionesPage'
import { ReportesPage } from '@/pages/reportes/ReportesPage'
import { UsuariosPage } from '@/pages/administracion/UsuariosPage'
import { UsuarioFormPage } from '@/pages/administracion/UsuarioFormPage'
import { TarifasPage } from '@/pages/administracion/TarifasPage'
import { BitacoraPage } from '@/pages/bitacora/BitacoraPage'

function HomeRedirect() {
  const { rol } = useAuth()
  if (rol === 'Operador Taller') return <Navigate to="/ordenes" replace />
  if (rol === 'Operador Mostrador' || rol === 'Cliente') return <Navigate to="/proformas" replace />
  return <Navigate to="/dashboard" replace />
}

export function AppRouter() {
  return (
    <Routes>
      {/* Rutas Publicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/no-autorizado" element={<UnauthorizedPage />} />

      {/* Rutas Privadas / Protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomeRedirect />} />

          {/* Dashboard (Admin & Superadmin) */}
          <Route element={<RoleRoute rolesPermitidos={['Superadministrador', 'Administrador']} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          {/* Insumos & Inventario */}
          <Route path="/insumos" element={<InsumosPage />} />
          <Route path="/insumos/nuevo" element={<InsumoFormPage />} />
          <Route path="/insumos/:id" element={<InsumoFormPage />} />
          <Route path="/insumos/alertas" element={<StockAlertasPage />} />

          {/* Clientes */}
          <Route element={<RoleRoute rolesPermitidos={['Superadministrador', 'Administrador', 'Operador Mostrador']} />}>
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/clientes/nuevo" element={<ClienteFormPage />} />
            <Route path="/clientes/:id" element={<ClienteFormPage />} />
          </Route>

          {/* Proformas */}
          <Route path="/proformas" element={<ProformasPage />} />
          <Route path="/proformas/nueva" element={<ProformaFormPage />} />
          <Route path="/proformas/:id" element={<ProformaDetallePage />} />

          {/* Ordenes de Trabajo y Taller */}
          <Route path="/ordenes" element={<OrdenesPage />} />
          <Route path="/ordenes/:id" element={<OrdenDetallePage />} />
          <Route path="/ordenes/:id/consumo" element={<ConsumoRealPage />} />

          {/* Compras & Proveedores */}
          <Route element={<RoleRoute rolesPermitidos={['Superadministrador', 'Administrador']} />}>
            <Route path="/compras" element={<ComprasPage />} />
            <Route path="/compras/nueva" element={<CompraFormPage />} />
            <Route path="/compras/:id" element={<CompraDetallePage />} />
            <Route path="/proveedores" element={<ProveedoresPage />} />
          </Route>

          {/* Predicciones Machine Learning */}
          <Route element={<RoleRoute rolesPermitidos={['Superadministrador', 'Administrador']} />}>
            <Route path="/predicciones" element={<PrediccionesPage />} />
          </Route>

          {/* Reportes */}
          <Route element={<RoleRoute rolesPermitidos={['Superadministrador', 'Administrador']} />}>
            <Route path="/reportes" element={<ReportesPage />} />
          </Route>

          {/* Administracion */}
          <Route element={<RoleRoute rolesPermitidos={['Superadministrador', 'Administrador']} />}>
            <Route path="/administracion/usuarios" element={<UsuariosPage />} />
            <Route path="/administracion/usuarios/nuevo" element={<UsuarioFormPage />} />
            <Route path="/administracion/tarifas" element={<TarifasPage />} />
          </Route>

          {/* Bitacora (Solo Superadmin) */}
          <Route element={<RoleRoute rolesPermitidos={['Superadministrador']} />}>
            <Route path="/bitacora" element={<BitacoraPage />} />
          </Route>
        </Route>
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}