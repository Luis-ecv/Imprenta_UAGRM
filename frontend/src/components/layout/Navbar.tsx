import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import MenuIcon from '@mui/icons-material/Menu';
import {
  Bell,
  ChevronDown,
  ChevronUp,
  User,
  Users,
  Settings,
  LogOut,
  X,
  Mail,
  Shield,
  CheckCircle2,
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { useAlertas } from '@/hooks/useAlertas';
import { ETIQUETAS_ROL } from '@/utils/constants';

export interface NavbarProps {
  onDrawerToggle: () => void;
  drawerWidth?: number;
}

// Formateo de fecha institucional: ej. "Sáb 31 oct 2026"
function obtenerFechaActualFormateada(): string {
  const ahora = new Date();
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const diaSemana = dias[ahora.getDay()];
  const diaMes = ahora.getDate();
  const mes = meses[ahora.getMonth()];
  const anio = ahora.getFullYear();
  return `${diaSemana} ${diaMes} ${mes} ${anio}`;
}

export function Navbar({ onDrawerToggle }: NavbarProps) {
  const { usuario, logout } = useAuth();
  const { cantidadAlertas } = useAlertas();
  const fechaHoy = obtenerFechaActualFormateada();

  // Estado del Popover del Perfil
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  // Estado del Modal de Detalle de Mi Perfil
  const [modalPerfilAbierto, setModalPerfilAbierto] = useState<boolean>(false);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleAbrirMiPerfil = () => {
    handleMenuClose();
    setModalPerfilAbierto(true);
  };

  // Nombre limpio sin sufijos
  const nombreLimpio = usuario?.nombre_completo
    ? usuario.nombre_completo.replace(/\s*\([^)]*\)/g, '').trim()
    : 'Carlos Mendoza';

  // Nombre corto para el botón trigger
  const nombrePartes = nombreLimpio.split(' ').filter(Boolean);
  const nombreTrigger =
    nombrePartes.length >= 2
      ? `${nombrePartes[0]} ${nombrePartes[1]}`
      : nombreLimpio;

  // Iniciales del usuario
  const iniciales = nombrePartes.length >= 2
    ? `${nombrePartes[0][0]}${nombrePartes[1][0]}`.toUpperCase()
    : (nombreLimpio[0] || 'U').toUpperCase();

  const rolFormateado = usuario?.rol ? ETIQUETAS_ROL[usuario.rol] || usuario.rol : 'Administrador';

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          top: { xs: 8, sm: 12, md: 16 },
          mx: { xs: 1.5, sm: 2.5, md: 3.5 },
          mt: { xs: 1.5, sm: 2 },
          mb: 1.5,
          width: {
            xs: 'calc(100% - 24px)',
            sm: 'calc(100% - 40px)',
            md: 'calc(100% - 56px)',
          },
          borderRadius: '22px',
          backgroundColor: '#ffffff',
          color: '#1e293b',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
          zIndex: 1100,
        }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            px: { xs: 2, sm: 3 },
            minHeight: '66px !important',
          }}
        >
          {/* Lado Izquierdo: Botón Menú Móvil + Imprenta UAGRM + ML activo + Fecha Actual */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <IconButton
              color="inherit"
              aria-label="abrir menú lateral"
              edge="start"
              onClick={onDrawerToggle}
              sx={{
                display: { md: 'none' },
                color: '#1e2b4d',
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Nombre Institucional */}
            <Typography
              sx={{
                fontWeight: 800,
                color: '#1e2b4d',
                fontSize: { xs: '1.05rem', sm: '1.18rem' },
                letterSpacing: '-0.02em',
              }}
            >
              Imprenta UAGRM
            </Typography>

            {/* Indicador de Machine Learning */}
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                gap: 0.7,
                ml: { sm: 0.5, md: 1 },
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                }}
              />
              <Typography
                sx={{
                  color: '#64748b',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                }}
              >
                ML activo
              </Typography>
            </Box>

            {/* Fecha Actual */}
            <Typography
              sx={{
                color: '#64748b',
                fontSize: '0.82rem',
                fontWeight: 500,
                ml: { sm: 1, md: 1.5 },
                display: { xs: 'none', md: 'inline' },
              }}
            >
              {fechaHoy}
            </Typography>
          </Box>

          {/* Lado Derecho: Campana de Notificaciones + Trigger Perfil Píldora */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
            {/* Campana de Notificaciones / Alertas de Stock */}
            <Tooltip title={cantidadAlertas > 0 ? `${cantidadAlertas} Alerta(s) de stock crítico` : 'Notificaciones del sistema'}>
              <IconButton
                component={Link}
                to="/insumos/alertas"
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  color: '#64748b',
                  position: 'relative',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    backgroundColor: '#f8fafc',
                    borderColor: '#cbd5e1',
                    color: '#1e2b4d',
                  },
                }}
              >
                <Bell size={18} />
                {cantidadAlertas > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      backgroundColor: '#dc2626',
                      border: '1.5px solid #ffffff',
                    }}
                  />
                )}
              </IconButton>
            </Tooltip>

            {/* Trigger de Perfil Píldora (Exacto al Mockup: [ (IC) Carlos Mendoza  ^ ]) */}
            <Box
              component="button"
              type="button"
              onClick={handleProfileClick}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.2,
                cursor: 'pointer',
                py: 0.6,
                px: 1.2,
                borderRadius: 50,
                backgroundColor: isMenuOpen ? '#f1f5f9' : '#ffffff',
                border: '1px solid #e2e8f0',
                transition: 'all 0.15s ease',
                fontFamily: 'inherit',
                outline: 'none',
                '&:hover': {
                  backgroundColor: '#f8fafc',
                  borderColor: '#cbd5e1',
                },
              }}
            >
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  backgroundColor: '#1e2b4d',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                }}
              >
                {iniciales}
              </Avatar>

              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: '#0f172a',
                  fontSize: '0.85rem',
                  display: { xs: 'none', sm: 'inline' },
                }}
              >
                {nombreTrigger}
              </Typography>

              {isMenuOpen ? (
                <ChevronUp size={15} color="#64748b" />
              ) : (
                <ChevronDown size={15} color="#64748b" />
              )}
            </Box>

            {/* POPOVER CARD OFICIAL DEL PERFIL (Exacto al Nuevo Mockup Minimalista) */}
            <Popover
              open={isMenuOpen}
              anchorEl={anchorEl}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: {
                    width: 265,
                    mt: 1.5,
                    p: 2,
                    borderRadius: '24px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.08)',
                  },
                },
              }}
            >
              {/* Encabezado: Avatar + Nombre + Correo Horizontal */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  pb: 1.8,
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <Avatar
                  sx={{
                    width: 42,
                    height: 42,
                    backgroundColor: '#1e2b4d',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                  }}
                >
                  {iniciales}
                </Avatar>

                <Box sx={{ overflow: 'hidden' }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 800,
                      color: '#0f172a',
                      fontSize: '0.9rem',
                      lineHeight: 1.25,
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    {nombreLimpio}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      color: '#64748b',
                      fontSize: '0.78rem',
                      fontWeight: 500,
                      display: 'block',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    {usuario?.email || 'carlos@uagrm.edu.bo'}
                  </Typography>
                </Box>
              </Box>

              {/* Opciones del Menú (con Iconos Circulares) */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, py: 1.5 }}>
                {/* 1. Mi perfil */}
                <Box
                  component="button"
                  type="button"
                  onClick={handleAbrirMiPerfil}
                  sx={{
                    width: '100%',
                    py: 0.8,
                    px: 1,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    color: '#1e293b',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      backgroundColor: '#f8fafc',
                      '& .menu-icon-bubble': {
                        backgroundColor: '#e2e8f0',
                        color: '#1e2b4d',
                      },
                    },
                  }}
                >
                  <Box
                    className="menu-icon-bubble"
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b',
                      transition: 'all 0.15s ease',
                      flexShrink: 0,
                    }}
                  >
                    <User size={16} />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.88rem' }}>
                    Mi perfil
                  </Typography>
                </Box>

                {/* 2. Usuarios */}
                <Box
                  component={Link}
                  to="/administracion/usuarios"
                  onClick={handleMenuClose}
                  sx={{
                    width: '100%',
                    py: 0.8,
                    px: 1,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    textDecoration: 'none',
                    color: '#1e293b',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      backgroundColor: '#f8fafc',
                      '& .menu-icon-bubble': {
                        backgroundColor: '#e2e8f0',
                        color: '#1e2b4d',
                      },
                    },
                  }}
                >
                  <Box
                    className="menu-icon-bubble"
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b',
                      transition: 'all 0.15s ease',
                      flexShrink: 0,
                    }}
                  >
                    <Users size={16} />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.88rem' }}>
                    Usuarios
                  </Typography>
                </Box>

                {/* 3. Configuración */}
                <Box
                  component={Link}
                  to="/administracion/tarifas"
                  onClick={handleMenuClose}
                  sx={{
                    width: '100%',
                    py: 0.8,
                    px: 1,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    textDecoration: 'none',
                    color: '#1e293b',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      backgroundColor: '#f8fafc',
                      '& .menu-icon-bubble': {
                        backgroundColor: '#e2e8f0',
                        color: '#1e2b4d',
                      },
                    },
                  }}
                >
                  <Box
                    className="menu-icon-bubble"
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b',
                      transition: 'all 0.15s ease',
                      flexShrink: 0,
                    }}
                  >
                    <Settings size={16} />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.88rem' }}>
                    Configuración
                  </Typography>
                </Box>
              </Box>

              {/* Opción Inferior: Cerrar sesión con burbuja roja */}
              <Box sx={{ pt: 1.2, borderTop: '1px solid #f1f5f9' }}>
                <Box
                  component="button"
                  type="button"
                  onClick={handleLogout}
                  sx={{
                    width: '100%',
                    py: 0.8,
                    px: 1,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    color: '#991b1b',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      backgroundColor: '#fef2f2',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      backgroundColor: '#fee2e2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#b91c1c',
                      flexShrink: 0,
                    }}
                  >
                    <LogOut size={16} />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#991b1b' }}>
                    Cerrar sesión
                  </Typography>
                </Box>
              </Box>
            </Popover>
          </Box>
        </Toolbar>
      </AppBar>

      {/* DIÁLOGO MODAL: FICHA DE MI PERFIL */}
      <Dialog
        open={modalPerfilAbierto}
        onClose={() => setModalPerfilAbierto(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '24px',
              p: 1.5,
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.12)',
            },
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 2, pb: 1, position: 'relative' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e2b4d', fontSize: '1.25rem' }}>
            Ficha de Operador
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
            Imprenta Universitaria UAGRM
          </Typography>
          <IconButton
            size="small"
            onClick={() => setModalPerfilAbierto(false)}
            sx={{ position: 'absolute', right: 12, top: 12, color: '#94a3b8' }}
          >
            <X size={18} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 2, py: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 2,
              mb: 2,
              backgroundColor: '#f8fafc',
              borderRadius: 3,
              border: '1px solid #f1f5f9',
            }}
          >
            <Avatar
              sx={{
                width: 64,
                height: 64,
                backgroundColor: '#1e2b4d',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1.3rem',
                mb: 1.5,
              }}
            >
              {iniciales}
            </Avatar>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
              {nombreLimpio}
            </Typography>
            <Box
              component="span"
              sx={{
                mt: 0.5,
                backgroundColor: '#dbeafe',
                color: '#1d4ed8',
                borderRadius: 50,
                px: 2,
                py: 0.35,
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              {rolFormateado}
            </Box>
          </Box>

          <Stack spacing={1.5}>
            <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Mail size={18} color="#0284c7" />
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>
                  Correo Institucional
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                  {usuario?.email || 'carlos.mendoza@uagrm.edu.bo'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Shield size={18} color="#059669" />
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>
                  Nivel de Acceso (RBAC)
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                  {rolFormateado} • Acceso Total Taller y Administración
                </Typography>
              </Box>
            </Box>

            <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CheckCircle2 size={18} color="#047857" />
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>
                  Estado de Cuenta
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#047857' }}>
                  Cuenta Activa y Verificada
                </Typography>
              </Box>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1, justifyContent: 'center' }}>
          <Button
            onClick={() => setModalPerfilAbierto(false)}
            sx={{
              borderRadius: 50,
              backgroundColor: '#1e2b4d',
              color: '#ffffff',
              fontWeight: 700,
              px: 3.5,
              py: 0.9,
              textTransform: 'none',
              '&:hover': { backgroundColor: '#141d34' },
            }}
          >
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
