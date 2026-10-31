import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { alpha } from '@mui/material/styles';
import {
  Users,
  Plus,
  Search,
  Mail,
  ShieldCheck,
  Edit2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  X,
  Lock,
  UserCheck,
  Check,
} from 'lucide-react';

import { usuariosApi } from '@/api/usuarios.api';
import { UAGRM_COLORS } from '@/theme/uagrmTheme';
import type { UsuarioResponse, UsuarioCreate, UsuarioUpdate, RolResponse } from '@/types';
import { formatearFechaHora } from '@/utils/formatters';

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([]);
  const [roles, setRoles] = useState<RolResponse[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState<string>('');

  // Modal Dialog states
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioResponse | null>(null);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [notificacion, setNotificacion] = useState<{ tipo: 'success' | 'error'; mensaje: string } | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    nombre_completo: string;
    email: string;
    rol_id: number;
    password: string;
    activo: boolean;
  }>({
    nombre_completo: '',
    email: '',
    rol_id: 3, // Operador Mostrador por defecto
    password: '',
    activo: true,
  });

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const [resUsuarios, listaRoles] = await Promise.all([
        usuariosApi.listar({ por_pagina: 100 }),
        usuariosApi.listarRoles(),
      ]);
      setUsuarios(resUsuarios.datos || []);
      setRoles(listaRoles || []);
    } catch {
      setError('Error al sincronizar cuentas de usuario institucional desde el servidor.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const abrirModalCrear = () => {
    setUsuarioEditando(null);
    setFormData({
      nombre_completo: '',
      email: '',
      rol_id: roles.length > 0 ? roles[0].id_rol : 3,
      password: '',
      activo: true,
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (u: UsuarioResponse) => {
    setUsuarioEditando(u);
    setFormData({
      nombre_completo: u.nombre_completo || '',
      email: u.email || '',
      rol_id: u.rol_id,
      password: '',
      activo: u.activo ?? true,
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    if (!guardando) {
      setModalAbierto(false);
      setUsuarioEditando(null);
    }
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre_completo.trim() || !formData.email.trim()) {
      setNotificacion({
        tipo: 'error',
        mensaje: 'El nombre completo y correo electrónico son obligatorios.',
      });
      return;
    }

    if (!usuarioEditando && !formData.password.trim()) {
      setNotificacion({
        tipo: 'error',
        mensaje: 'Debe ingresar una contraseña para el nuevo usuario.',
      });
      return;
    }

    try {
      setGuardando(true);
      if (usuarioEditando) {
        const updatePayload: UsuarioUpdate = {
          nombre_completo: formData.nombre_completo.trim(),
          email: formData.email.trim(),
          rol_id: formData.rol_id,
          activo: formData.activo,
        };
        if (formData.password.trim()) {
          updatePayload.password = formData.password.trim();
        }
        await usuariosApi.actualizar(usuarioEditando.id_usuario, updatePayload);
        setNotificacion({
          tipo: 'success',
          mensaje: 'Usuario institucional actualizado con éxito.',
        });
      } else {
        const createPayload: UsuarioCreate = {
          nombre_completo: formData.nombre_completo.trim(),
          email: formData.email.trim(),
          rol_id: formData.rol_id,
          activo: formData.activo,
          password: formData.password.trim(),
        };
        await usuariosApi.crear(createPayload);
        setNotificacion({
          tipo: 'success',
          mensaje: 'Usuario institucional registrado exitosamente.',
        });
      }
      setModalAbierto(false);
      cargarDatos();
    } catch {
      setNotificacion({
        tipo: 'error',
        mensaje: 'Ocurrió un error al guardar la cuenta de usuario en el servidor.',
      });
    } finally {
      setGuardando(false);
    }
  };

  // Filtrado
  const usuariosFiltrados = usuarios.filter((u) => {
    const q = busqueda.toLowerCase();
    const nombreRol = u.rol?.nombre?.toLowerCase() || '';
    return (
      u.nombre_completo.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      nombreRol.includes(q)
    );
  });

  // Métricas
  const totalActivos = usuarios.filter((u) => u.activo).length;
  const totalOperadores = usuarios.filter((u) => u.rol?.nombre?.includes('Operador')).length;

  const obtenerColorRol = (nombreRol?: string) => {
    switch (nombreRol) {
      case 'Superadministrador':
        return { color: UAGRM_COLORS.red.main, bg: alpha(UAGRM_COLORS.red.main, 0.1) };
      case 'Administrador':
        return { color: UAGRM_COLORS.blue.main, bg: alpha(UAGRM_COLORS.blue.main, 0.1) };
      case 'Operador Mostrador':
        return { color: UAGRM_COLORS.cyan.dark, bg: alpha(UAGRM_COLORS.cyan.main, 0.15) };
      case 'Operador Taller':
        return { color: '#0d9488', bg: alpha('#0d9488', 0.1) };
      default:
        return { color: '#475569', bg: '#f1f5f9' };
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 }, backgroundColor: UAGRM_COLORS.background.default, minHeight: '100%' }}>
      {/* 1. Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3.5 }}>
        <Box>
          {/* <Typography
            variant="overline"
            sx={{
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: UAGRM_COLORS.cyan.main,
              display: 'block',
              lineHeight: 1.2,
            }}
          >
            Control de Accesos Institucionales (RBAC)
          </Typography> */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 780,
              color: UAGRM_COLORS.blue.dark,
              letterSpacing: '-0.02em',
              mb: 0.5,
            }}
          >
            Usuarios del Sistema
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.925rem' }}>
            Administración de credenciales, roles operativos y estados de cuenta de la Imprenta Universitaria.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            onClick={cargarDatos}
            disabled={cargando}
            startIcon={<RefreshCw size={16} className={cargando ? 'animate-spin' : ''} />}
            sx={{
              borderRadius: 50,
              textTransform: 'none',
              fontWeight: 700,
              color: '#475569',
              borderColor: '#e2e8f0',
              backgroundColor: '#ffffff',
              px: 2.2,
              py: 0.9,
              '&:hover': {
                borderColor: '#cbd5e1',
                backgroundColor: '#f8fafc',
              },
            }}
          >
            Actualizar
          </Button>

          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={abrirModalCrear}
            sx={{
              backgroundColor: '#1e2b4d',
              color: '#ffffff',
              fontWeight: 700,
              px: 2.5,
              py: 1.1,
              borderRadius: 50,
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(30, 43, 77, 0.25)',
              '&:hover': {
                backgroundColor: '#141d34',
              },
            }}
          >
            Nuevo Usuario
          </Button>
        </Stack>
      </Box>

      {/* 2. Tarjetas KPI */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${UAGRM_COLORS.border}`,
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            }}
          >
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  backgroundColor: alpha(UAGRM_COLORS.blue.main, 0.1),
                  color: UAGRM_COLORS.blue.main,
                }}
              >
                <Users size={24} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Cuentas Registradas
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: UAGRM_COLORS.blue.dark }}>
                  {usuarios.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${UAGRM_COLORS.border}`,
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            }}
          >
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  backgroundColor: alpha('#10b981', 0.1),
                  color: '#059669',
                }}
              >
                <UserCheck size={24} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Usuarios Habilitados
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#059669' }}>
                  {totalActivos}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${UAGRM_COLORS.border}`,
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            }}
          >
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  backgroundColor: alpha(UAGRM_COLORS.cyan.main, 0.15),
                  color: UAGRM_COLORS.cyan.dark,
                }}
              >
                <ShieldCheck size={24} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Operadores de Imprenta
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: UAGRM_COLORS.cyan.dark }}>
                  {totalOperadores}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 3. Buscador */}
      <Card
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${UAGRM_COLORS.border}`,
          backgroundColor: '#ffffff',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar usuario por nombre, correo institucional o rol..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} color="#94a3b8" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              maxWidth: { sm: 450 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                backgroundColor: '#f8fafc',
              },
            }}
          />

          <Chip
            label={`${usuariosFiltrados.length} Usuarios`}
            size="small"
            sx={{
              fontWeight: 700,
              backgroundColor: alpha(UAGRM_COLORS.blue.main, 0.08),
              color: UAGRM_COLORS.blue.dark,
            }}
          />
        </Stack>
      </Card>

      {/* 4. Notificaciones de error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* 5. Cuadrícula de Usuarios */}
      {cargando ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <CircularProgress sx={{ color: UAGRM_COLORS.red.main, mb: 2 }} />
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
            Sincronizando cuentas institucionales...
          </Typography>
        </Box>
      ) : usuariosFiltrados.length === 0 ? (
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
            backgroundColor: '#ffffff',
            borderRadius: 3,
            border: `1px dashed ${UAGRM_COLORS.border}`,
          }}
        >
          <Users size={42} color="#94a3b8" style={{ marginBottom: 12 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#334155' }}>
            No se encontraron usuarios
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 400, mx: 'auto', mt: 0.5, mb: 2.5 }}>
            {busqueda
              ? 'No hay registros que coincidan con la búsqueda.'
              : 'Registre nuevos operadores o jefes de taller para gestionar la imprenta.'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={abrirModalCrear}
            sx={{
              backgroundColor: UAGRM_COLORS.red.main,
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              '&:hover': { backgroundColor: UAGRM_COLORS.red.dark },
            }}
          >
            Registrar Primer Usuario
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {usuariosFiltrados.map((u) => {
            const nombreRol = u.rol?.nombre;
            const estiloRol = obtenerColorRol(nombreRol);

            return (
              <Grid key={u.id_usuario} size={{ xs: 12, md: 6, lg: 4 }}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${UAGRM_COLORS.border}`,
                    backgroundColor: '#ffffff',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                      borderColor: alpha(UAGRM_COLORS.blue.main, 0.3),
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            backgroundColor: estiloRol.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: estiloRol.color,
                            fontWeight: 800,
                            fontSize: '1.05rem',
                          }}
                        >
                          {u.nombre_completo.charAt(0).toUpperCase()}
                        </Box>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
                            {u.nombre_completo}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            ID #{u.id_usuario}
                          </Typography>
                        </Box>
                      </Box>

                      <Chip
                        icon={u.activo ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        label={u.activo ? 'Activo' : 'Inactivo'}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          backgroundColor: u.activo ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                          color: u.activo ? '#059669' : '#dc2626',
                        }}
                      />
                    </Box>

                    <Stack spacing={1.2} sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#475569', fontSize: '0.85rem' }}>
                        <Mail size={15} color="#94a3b8" />
                        <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
                          {u.email}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ShieldCheck size={15} color="#94a3b8" />
                        <Chip
                          label={nombreRol || `Rol #${u.rol_id}`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            backgroundColor: estiloRol.bg,
                            color: estiloRol.color,
                          }}
                        />
                      </Box>

                      {u.ultimo_acceso && (
                        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', pt: 0.5 }}>
                          Último ingreso: {formatearFechaHora(u.ultimo_acceso)}
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>

                  <Box
                    sx={{
                      p: 1.5,
                      px: 2.5,
                      backgroundColor: '#f8fafc',
                      borderTop: `1px solid ${UAGRM_COLORS.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Button
                      size="small"
                      startIcon={<Edit2 size={14} />}
                      onClick={() => abrirModalEditar(u)}
                      sx={{
                        color: UAGRM_COLORS.blue.main,
                        fontWeight: 700,
                        textTransform: 'none',
                        fontSize: '0.8rem',
                        '&:hover': { backgroundColor: alpha(UAGRM_COLORS.blue.main, 0.08) },
                      }}
                    >
                      Editar Usuario
                    </Button>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* 6. MODAL POPUP PARA REGISTRAR / EDITAR USUARIO (SIN REDIRECCIONAMIENTO) */}
      <Dialog
        open={modalAbierto}
        onClose={cerrarModal}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3.5,
              p: 1,
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3, position: 'relative', textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e2b4d', fontSize: '1.5rem', mb: 0.5 }}>
            {usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.875rem' }}>
            Control de Accesos y Seguridad
          </Typography>
          <IconButton onClick={cerrarModal} disabled={guardando} size="small" sx={{ position: 'absolute', right: 16, top: 16, color: '#94a3b8', '&:hover': { color: '#475569' } }}>
            <X size={18} />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleGuardar}>
          <DialogContent sx={{ px: 2.5, py: 1.5 }}>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2.5, fontSize: '0.85rem' }}>
              Configure los datos de acceso y el nivel de autorización correspondiente en la plataforma.
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  required
                  size="small"
                  label="Nombre Completo"
                  placeholder="Ej: Lic. Walter Justiniano"
                  value={formData.nombre_completo}
                  onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  required
                  size="small"
                  type="email"
                  label="Correo Electrónico Institucional"
                  placeholder="w.justiniano@uagrm.edu.bo"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Rol Asignado"
                  value={formData.rol_id}
                  onChange={(e) => setFormData({ ...formData, rol_id: Number(e.target.value) })}
                >
                  {roles.map((r) => (
                    <MenuItem key={r.id_rol} value={r.id_rol}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {r.nombre}
                        </Typography>
                        {r.descripcion && (
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                            {r.descripcion}
                          </Typography>
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="password"
                  required={!usuarioEditando}
                  label={usuarioEditando ? 'Nueva Contraseña (opcional)' : 'Contraseña de Acceso'}
                  placeholder={usuarioEditando ? 'Dejar en blanco para mantener la actual' : 'Mínimo 8 caracteres'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={16} color="#94a3b8" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                      Cuenta Activa y Habilitada para Iniciar Sesión
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, pt: 2, borderTop: `1px solid ${UAGRM_COLORS.border}`, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2.5 }}>
            <Button
              onClick={cerrarModal}
              disabled={guardando}
              sx={{
                backgroundColor: '#607285',
                color: '#ffffff',
                fontWeight: 700,
                px: 3.5,
                py: 1.1,
                borderRadius: 50.5,
                textTransform: 'none',
                fontSize: '0.875rem',
                minWidth: 125,
                '&:hover': {
                  backgroundColor: '#4f5e6d',
                },
              }}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={guardando}
              endIcon={guardando ? <CircularProgress size={16} color="inherit" /> : <Check size={18} />}
              sx={{
                backgroundColor: '#1e2b4d',
                color: '#ffffff',
                fontWeight: 700,
                px: 3.5,
                py: 1.1,
                borderRadius: 2.5,
                textTransform: 'none',
                fontSize: '0.875rem',
                minWidth: 165,
                boxShadow: '0 2px 8px rgba(30, 43, 77, 0.25)',
                '&:hover': {
                  backgroundColor: '#141d34',
                },
                '&.Mui-disabled': {
                  backgroundColor: '#1e2b4d',
                  color: '#ffffff',
                  opacity: 0.65,
                },
              }}
            >
              {guardando ? 'Confirmando...' : 'Confirmar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar de retroalimentación */}
      <Snackbar
        open={Boolean(notificacion)}
        autoHideDuration={4000}
        onClose={() => setNotificacion(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {notificacion ? (
          <Alert
            severity={notificacion.tipo}
            onClose={() => setNotificacion(null)}
            sx={{ width: '100%', borderRadius: 2 }}
          >
            {notificacion.mensaje}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
