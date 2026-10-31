import { useLocation, Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

interface BreadcrumbItem {
  label: string
  to?: string
}

export function Breadcrumbs() {
  const location = useLocation()
  const pathname = location.pathname

  // Raíz contextual no navegable (evita redirecciones accidentales)
  const items: BreadcrumbItem[] = [
    { label: 'Sistema de gestión' },
  ]

  // Jerarquía estricta basada exclusivamente en los nombres oficiales del Sidebar
  if (pathname === '/' || pathname === '/dashboard') {
    items.push({ label: 'Dashboard' })
  } else if (pathname === '/insumos') {
    items.push({ label: 'Insumos' })
  } else if (pathname === '/insumos/nuevo') {
    items.push({ label: 'Insumos', to: '/insumos' })
    items.push({ label: 'Nuevo Insumo' })
  } else if (pathname.startsWith('/insumos/alertas')) {
    items.push({ label: 'Alertas de Stock' })
  } else if (pathname.startsWith('/insumos/')) {
    items.push({ label: 'Insumos', to: '/insumos' })
    items.push({ label: 'Detalle de Insumo' })
  } else if (pathname === '/clientes') {
    items.push({ label: 'Clientes' })
  } else if (pathname === '/clientes/nuevo') {
    items.push({ label: 'Clientes', to: '/clientes' })
    items.push({ label: 'Nuevo Cliente' })
  } else if (pathname.startsWith('/clientes/')) {
    items.push({ label: 'Clientes', to: '/clientes' })
    items.push({ label: 'Detalle de Cliente' })
  } else if (pathname === '/proformas') {
    items.push({ label: 'Proformas' })
  } else if (pathname === '/proformas/nueva') {
    items.push({ label: 'Proformas', to: '/proformas' })
    items.push({ label: 'Nueva Proforma' })
  } else if (pathname.startsWith('/proformas/')) {
    items.push({ label: 'Proformas', to: '/proformas' })
    items.push({ label: 'Detalle de Proforma' })
  } else if (pathname === '/ordenes') {
    items.push({ label: 'Órdenes de Trabajo' })
  } else if (pathname.endsWith('/consumo')) {
    items.push({ label: 'Órdenes de Trabajo', to: '/ordenes' })
    items.push({ label: 'Consumo Real' })
  } else if (pathname.startsWith('/ordenes/')) {
    items.push({ label: 'Órdenes de Trabajo', to: '/ordenes' })
    items.push({ label: 'Detalle de Orden' })
  } else if (pathname === '/compras') {
    items.push({ label: 'Compras' })
  } else if (pathname === '/compras/nueva') {
    items.push({ label: 'Compras', to: '/compras' })
    items.push({ label: 'Nueva Compra' })
  } else if (pathname.startsWith('/compras/')) {
    items.push({ label: 'Compras', to: '/compras' })
    items.push({ label: 'Detalle de Compra' })
  } else if (pathname.startsWith('/proveedores')) {
    items.push({ label: 'Proveedores' })
  } else if (pathname.startsWith('/predicciones')) {
    items.push({ label: 'Predicciones ML' })
  } else if (pathname.startsWith('/reportes')) {
    items.push({ label: 'Reportes' })
  } else if (pathname === '/administracion/usuarios') {
    items.push({ label: 'Administración' })
    items.push({ label: 'Usuarios' })
  } else if (pathname === '/administracion/usuarios/nuevo') {
    items.push({ label: 'Administración' })
    items.push({ label: 'Usuarios', to: '/administracion/usuarios' })
    items.push({ label: 'Nuevo Usuario' })
  } else if (pathname.startsWith('/administracion/tarifas')) {
    items.push({ label: 'Administración' })
    items.push({ label: 'Tarifario Litográfico' })
  } else if (pathname.startsWith('/bitacora')) {
    items.push({ label: 'Administración' })
    items.push({ label: 'Bitácora' })
  } else {
    items.push({ label: 'Módulo' })
  }

  return (
    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.8 }}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1

        return (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'center' }}>
            {idx > 0 && (
              <Typography
                component="span"
                sx={{
                  color: '#94a3b8',
                  mx: 1,
                  fontSize: '0.85rem',
                  userSelect: 'none',
                }}
              >
                /
              </Typography>
            )}

            {isLast ? (
              <Typography
                component="span"
                sx={{
                  color: '#0f172a',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                {item.label}
              </Typography>
            ) : item.to ? (
              <Typography
                component={Link}
                to={item.to}
                sx={{
                  color: '#64748b',
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  fontWeight: 500,
                  transition: 'color 0.15s ease',
                  '&:hover': { color: '#1e2b4d' },
                }}
              >
                {item.label}
              </Typography>
            ) : (
              <Typography
                component="span"
                sx={{
                  color: '#64748b',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                }}
              >
                {item.label}
              </Typography>
            )}
          </Box>
        )
      })}
    </Box>
  )
}
