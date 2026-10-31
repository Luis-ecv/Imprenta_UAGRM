import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import {
  LayoutDashboard,
  Layers,
  AlertTriangle,
  Users,
  FileText,
  Printer,
  ShoppingCart,
  Truck,
  BrainCircuit,
  BarChart3,
  ShieldCheck,
  History,
  Tag,
  ChevronDown,
  ChevronRight,
  Menu,
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { useAlertas } from '@/hooks/useAlertas';
import type { RolSistema } from '@/types';

export const SIDEBAR_EXPANDED_WIDTH = 264;
export const SIDEBAR_COLLAPSED_WIDTH = 76;

interface NavItem {
  nombre: string;
  ruta: string;
  icono: React.ElementType;
  rolesPermitidos: RolSistema[];
  mostrarAlerta?: boolean;
}

interface SubNavItem {
  nombre: string;
  ruta: string;
  icono: React.ElementType;
  rolesPermitidos: RolSistema[];
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
    nombre: 'Proveedores',
    ruta: '/proveedores',
    icono: Truck,
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
];

// Submódulos del bloque colapsable de Administración
const ADMIN_SUBITEMS: SubNavItem[] = [
  {
    nombre: 'Usuarios',
    ruta: '/administracion/usuarios',
    icono: Users,
    rolesPermitidos: ['Superadministrador', 'Administrador'],
  },
  {
    nombre: 'Tarifario Litográfico',
    ruta: '/administracion/tarifas',
    icono: Tag,
    rolesPermitidos: ['Superadministrador', 'Administrador'],
  },
  {
    nombre: 'Bitácora',
    ruta: '/bitacora',
    icono: History,
    rolesPermitidos: ['Superadministrador'],
  },
];

export interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  mobileOpen,
  onMobileClose,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const { rol, usuario } = useAuth();
  const location = useLocation();
  const { cantidadAlertas } = useAlertas();

  const currentWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;

  const itemsVisibles = NAV_ITEMS.filter((item) =>
    rol ? item.rolesPermitidos.includes(rol) : false
  );

  const adminSubitemsVisibles = ADMIN_SUBITEMS.filter((item) =>
    rol ? item.rolesPermitidos.includes(rol) : false
  );
  const mostrarSeccionAdmin = adminSubitemsVisibles.length > 0;

  const esRutaAdminActiva =
    location.pathname.startsWith('/administracion') ||
    location.pathname.startsWith('/bitacora');

  const [adminOpen, setAdminOpen] = useState<boolean>(esRutaAdminActiva);

  // Auto-expandir si el usuario navega dentro del módulo de administración
  useEffect(() => {
    if (esRutaAdminActiva) {
      setAdminOpen(true);
    }
  }, [esRutaAdminActiva]);

  const nombreUsuario = usuario?.nombre_completo
    ? usuario.nombre_completo.replace(/\s*\([^)]*\)/g, '').trim()
    : 'Ing. Carlos Mendoza';

  const inicialesUsuario = nombreUsuario
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'CM';

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: { xs: '100%', md: 'calc(100vh - 24px)' },
        backgroundColor: '#ffffff',
        borderRadius: { xs: 0, md: '24px' },
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        position: 'relative',
        transition: 'width 0.24s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
      }}
    >
      {/* ===================================================================
          CABECERA: Logo Squircle + Identidad Institucional
          =================================================================== */}
      <Box
        sx={{
          pt: 2.2,
          px: collapsed ? 1.5 : 2.2,
          pb: 2,
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.6,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          {/* Squircle blanco con logo de la Imprenta */}
          <Tooltip title={collapsed ? 'Editorial e Imprenta Universitaria UAGRM' : ''} placement="right">
            <Box
              sx={{
                width: collapsed ? 44 : 48,
                height: collapsed ? 44 : 48,
                minWidth: collapsed ? 44 : 48,
                borderRadius: '14px',
                backgroundColor: '#ffffff',
                border: '1.5px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 0.6,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                },
              }}
            >
              <Box
                component="img"
                src="/logo_imprenta.png"
                alt="EIU UAGRM"
                sx={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            </Box>
          </Tooltip>

          {/* Textos de la marca */}
          {!collapsed && (
            <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
              <Typography
                variant="subtitle1"
                noWrap
                sx={{
                  fontWeight: 800,
                  color: '#141f36',
                  letterSpacing: '-0.01em',
                  fontSize: '1.08rem',
                  lineHeight: 1.15,
                }}
              >
                EIU UAGRM
              </Typography>
              <Typography
                variant="caption"
                noWrap
                sx={{
                  display: 'block',
                  color: '#64748b',
                  fontSize: '0.80rem',
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                  mt: 0.2,
                }}
              >
                Imprenta Universitaria
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* ===================================================================
          LISTA DE NAVEGACIÓN
          =================================================================== */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          px: 1.4,
          py: 1.8,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
          {/* Módulos Principales */}
          {itemsVisibles.map((item) => {
            const Icono = item.icono;
            const activo =
              location.pathname === item.ruta ||
              (item.ruta !== '/' && location.pathname.startsWith(item.ruta));

            const itemBtn = (
              <ListItemButton
                component={Link}
                to={item.ruta}
                onClick={onMobileClose}
                selected={activo}
                sx={{
                  position: 'relative',
                  borderRadius: 3,
                  px: collapsed ? 1.5 : 1.8,
                  py: 1.1,
                  minHeight: 44,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  transition: 'all 0.16s ease-in-out',
                  backgroundColor: activo ? '#0f172a !important' : 'transparent',
                  color: activo ? '#ffffff' : '#334155',
                  boxShadow: activo ? '0 4px 14px rgba(15, 23, 42, 0.28)' : 'none',
                  '&:hover': {
                    backgroundColor: activo
                      ? '#0f172a'
                      : '#f8fafc',
                    color: activo ? '#ffffff' : '#0f172a',
                    '& .nav-icon': {
                      color: activo ? '#ffffff' : '#0f172a',
                    },
                  },
                }}
              >
                {/* Ícono */}
                <ListItemIcon
                  className="nav-icon"
                  sx={{
                    minWidth: collapsed ? 0 : 34,
                    color: activo ? '#ffffff' : '#64748b',
                    justifyContent: 'center',
                    transition: 'color 0.16s ease',
                  }}
                >
                  <Icono size={19} strokeWidth={activo ? 2.4 : 2} />
                </ListItemIcon>

                {/* Texto (solo en modo expandido) */}
                {!collapsed && (
                  <>
                    <ListItemText
                      primary={
                        <Typography
                          sx={{
                            fontSize: '0.88rem',
                            fontWeight: activo ? 750 : 600,
                            letterSpacing: '0.01em',
                            color: activo ? '#ffffff' : '#334155',
                          }}
                        >
                          {item.nombre}
                        </Typography>
                      }
                    />

                    {/* Badge de alerta de stock */}
                    {item.mostrarAlerta && cantidadAlertas > 0 && (
                      <Chip
                        size="small"
                        label={cantidadAlertas}
                        sx={{
                          height: 20,
                          minWidth: 20,
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                          border: 'none',
                        }}
                      />
                    )}
                  </>
                )}

                {/* Dot indicador de alerta en modo colapsado */}
                {collapsed && item.mostrarAlerta && cantidadAlertas > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 12,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#ef4444',
                      border: '1.5px solid #ffffff',
                    }}
                  />
                )}
              </ListItemButton>
            );

            return (
              <Box key={item.ruta}>
                {collapsed ? (
                  <Tooltip title={item.nombre} placement="right" arrow>
                    {itemBtn}
                  </Tooltip>
                ) : (
                  itemBtn
                )}
              </Box>
            );
          })}

          {/* ===================================================================
              SUBMÓDULO: ADMINISTRACIÓN (Acordeón con Usuarios, Tarifario y Bitácora)
              =================================================================== */}
          {mostrarSeccionAdmin && (
            <>
              {!collapsed ? (
                <Box sx={{ mt: 0.5 }}>
                  {/* Cabecera del Grupo Administración (Acordeón) */}
                  <ListItemButton
                    onClick={() => setAdminOpen(!adminOpen)}
                    sx={{
                      borderRadius: 3,
                      px: 1.8,
                      py: 1.1,
                      minHeight: 44,
                      transition: 'all 0.16s ease-in-out',
                      backgroundColor: esRutaAdminActiva && !adminOpen ? '#f1f5f9' : 'transparent',
                      color: esRutaAdminActiva ? '#0f172a' : '#334155',
                      '&:hover': {
                        backgroundColor: '#f8fafc',
                        color: '#0f172a',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 34,
                        color: esRutaAdminActiva ? '#1e2b4d' : '#64748b',
                        justifyContent: 'center',
                      }}
                    >
                      <ShieldCheck size={19} strokeWidth={esRutaAdminActiva ? 2.4 : 2} />
                    </ListItemIcon>

                    <ListItemText
                      primary={
                        <Typography
                          sx={{
                            fontSize: '0.88rem',
                            fontWeight: esRutaAdminActiva ? 750 : 600,
                            letterSpacing: '0.01em',
                            color: esRutaAdminActiva ? '#0f172a' : '#334155',
                          }}
                        >
                          Administración
                        </Typography>
                      }
                    />

                    <Box sx={{ color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                      {adminOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </Box>
                  </ListItemButton>

                  {/* Submódulos Anidados */}
                  <Collapse in={adminOpen} timeout="auto" unmountOnExit>
                    <List
                      disablePadding
                      sx={{
                        pl: 1.5,
                        ml: 2.2,
                        my: 0.5,
                        borderLeft: '2px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                      }}
                    >
                      {adminSubitemsVisibles.map((subItem) => {
                        const SubIcono = subItem.icono;
                        const subActivo =
                          location.pathname === subItem.ruta ||
                          (subItem.ruta !== '/' && location.pathname.startsWith(subItem.ruta));

                        return (
                          <ListItemButton
                            key={subItem.ruta}
                            component={Link}
                            to={subItem.ruta}
                            onClick={onMobileClose}
                            selected={subActivo}
                            sx={{
                              borderRadius: 2.5,
                              px: 1.5,
                              py: 0.85,
                              minHeight: 38,
                              transition: 'all 0.16s ease-in-out',
                              backgroundColor: subActivo ? '#0f172a !important' : 'transparent',
                              color: subActivo ? '#ffffff' : '#475569',
                              boxShadow: subActivo ? '0 4px 12px rgba(15, 23, 42, 0.22)' : 'none',
                              '&:hover': {
                                backgroundColor: subActivo ? '#0f172a' : '#f8fafc',
                                color: subActivo ? '#ffffff' : '#0f172a',
                                '& .subnav-icon': {
                                  color: subActivo ? '#ffffff' : '#0f172a',
                                },
                              },
                            }}
                          >
                            <ListItemIcon
                              className="subnav-icon"
                              sx={{
                                minWidth: 28,
                                color: subActivo ? '#ffffff' : '#64748b',
                                justifyContent: 'center',
                              }}
                            >
                              <SubIcono size={16} strokeWidth={subActivo ? 2.3 : 2} />
                            </ListItemIcon>

                            <ListItemText
                              primary={
                                <Typography
                                  sx={{
                                    fontSize: '0.82rem',
                                    fontWeight: subActivo ? 750 : 600,
                                    color: subActivo ? '#ffffff' : '#475569',
                                  }}
                                >
                                  {subItem.nombre}
                                </Typography>
                              }
                            />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                </Box>
              ) : (
                /* Modo Colapsado: Iconos directos con Tooltip bajo un separador sutil */
                <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #f1f5f9' }}>
                  {adminSubitemsVisibles.map((subItem) => {
                    const SubIcono = subItem.icono;
                    const subActivo =
                      location.pathname === subItem.ruta ||
                      (subItem.ruta !== '/' && location.pathname.startsWith(subItem.ruta));

                    const iconBtn = (
                      <ListItemButton
                        component={Link}
                        to={subItem.ruta}
                        onClick={onMobileClose}
                        selected={subActivo}
                        sx={{
                          borderRadius: 3,
                          px: 1.5,
                          py: 1.1,
                          minHeight: 44,
                          justifyContent: 'center',
                          transition: 'all 0.16s ease-in-out',
                          backgroundColor: subActivo ? '#0f172a !important' : 'transparent',
                          color: subActivo ? '#ffffff' : '#334155',
                          boxShadow: subActivo ? '0 4px 14px rgba(15, 23, 42, 0.28)' : 'none',
                          '&:hover': {
                            backgroundColor: subActivo ? '#0f172a' : '#f8fafc',
                            color: subActivo ? '#ffffff' : '#0f172a',
                            '& .nav-icon': {
                              color: subActivo ? '#ffffff' : '#0f172a',
                            },
                          },
                        }}
                      >
                        <ListItemIcon
                          className="nav-icon"
                          sx={{
                            minWidth: 0,
                            color: subActivo ? '#ffffff' : '#64748b',
                            justifyContent: 'center',
                          }}
                        >
                          <SubIcono size={19} strokeWidth={subActivo ? 2.4 : 2} />
                        </ListItemIcon>
                      </ListItemButton>
                    );

                    return (
                      <Tooltip
                        key={subItem.ruta}
                        title={`Administración: ${subItem.nombre}`}
                        placement="right"
                        arrow
                      >
                        <Box sx={{ mb: 0.8 }}>{iconBtn}</Box>
                      </Tooltip>
                    );
                  })}
                </Box>
              )}
            </>
          )}
        </List>
      </Box>

      {/* ===================================================================
          PIE DEL SIDEBAR: Botón Menú + Perfil
          =================================================================== */}
      <Box
        sx={{
          borderTop: '1px solid #f1f5f9',
          p: collapsed ? 1.5 : 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {/* Botón Menú para colapsar / expandir */}
        <Box
          component="button"
          onClick={onToggleCollapse}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.2,
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            p: 1,
            borderRadius: 2,
            color: '#475569',
            fontFamily: 'inherit',
            transition: 'all 0.15s ease',
            '&:hover': {
              backgroundColor: '#f8fafc',
              color: '#0f172a',
            },
          }}
        >
          <Menu size={18} />
          {!collapsed && (
            <Typography sx={{ fontSize: '0.86rem', fontWeight: 700 }}>
              Menú
            </Typography>
          )}
        </Box>

        {/* Perfil del Usuario */}
        {!collapsed ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, px: 0.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.82rem',
                flexShrink: 0,
              }}
            >
              {inicialesUsuario}
            </Box>
            <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
              <Typography variant="body2" sx={{ fontWeight: 750, color: '#141f36', fontSize: '0.86rem' }} noWrap>
                {nombreUsuario}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, display: 'block' }} noWrap>
                UAGRM &copy; 2026
              </Typography>
            </Box>
          </Box>
        ) : (
          <Tooltip title={nombreUsuario} placement="right" arrow>
            <Box
              sx={{
                width: 36,
                height: 36,
                mx: 'auto',
                borderRadius: '50%',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.82rem',
              }}
            >
              {inicialesUsuario}
            </Box>
          </Tooltip>
        )}
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { md: currentWidth },
        flexShrink: { md: 0 },
        transition: 'width 0.24s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Drawer Móvil (Temporary) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: SIDEBAR_EXPANDED_WIDTH,
            border: 'none',
            backgroundColor: 'transparent',
            boxShadow: '4px 0 24px rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Drawer Escritorio (Permanent) */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: currentWidth,
            border: 'none',
            backgroundColor: 'transparent',
            p: 1.5,
            overflow: 'visible',
            transition: 'width 0.24s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}

export default Sidebar;
