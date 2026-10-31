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
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { alpha } from '@mui/material/styles';
import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Edit2,
  RefreshCw,
  Building2,
  Check,
  X,
  FileText,
} from 'lucide-react';

import { proveedoresApi } from '@/api/proveedores.api';
import { UAGRM_COLORS } from '@/theme/uagrmTheme';
import type { ProveedorResponse, ProveedorCreate, ProveedorUpdate } from '@/types';

export function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<ProveedorResponse[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState<string>('');

  // Modal Dialog states
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [proveedorEditando, setProveedorEditando] = useState<ProveedorResponse | null>(null);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [notificacion, setNotificacion] = useState<{ tipo: 'success' | 'error'; mensaje: string } | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    razon_social: string;
    nit: string;
    contacto: string;
    telefono: string;
    email: string;
    direccion: string;
  }>({
    razon_social: '',
    nit: '',
    contacto: '',
    telefono: '',
    email: '',
    direccion: '',
  });

  const cargarProveedores = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const res = await proveedoresApi.listar({ por_pagina: 100 });
      setProveedores(res.datos || []);
    } catch {
      setError('Error al conectar con el servidor para obtener los proveedores.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarProveedores();
  }, [cargarProveedores]);

  const abrirModalCrear = () => {
    setProveedorEditando(null);
    setFormData({
      razon_social: '',
      nit: '',
      contacto: '',
      telefono: '',
      email: '',
      direccion: '',
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (p: ProveedorResponse) => {
    setProveedorEditando(p);
    setFormData({
      razon_social: p.razon_social || '',
      nit: p.nit || '',
      contacto: p.contacto || '',
      telefono: p.telefono || '',
      email: p.email || '',
      direccion: p.direccion || '',
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    if (!guardando) {
      setModalAbierto(false);
      setProveedorEditando(null);
    }
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.razon_social.trim() || !formData.nit.trim()) {
      setNotificacion({
        tipo: 'error',
        mensaje: 'La Razón Social y el NIT son obligatorios.',
      });
      return;
    }

    try {
      setGuardando(true);
      if (proveedorEditando) {
        const updatePayload: ProveedorUpdate = {
          razon_social: formData.razon_social.trim(),
          nit: formData.nit.trim(),
          contacto: formData.contacto.trim() || null,
          telefono: formData.telefono.trim() || null,
          email: formData.email.trim() || null,
          direccion: formData.direccion.trim() || null,
        };
        await proveedoresApi.actualizar(proveedorEditando.id_proveedor, updatePayload);
        setNotificacion({
          tipo: 'success',
          mensaje: 'Proveedor actualizado exitosamente en el sistema.',
        });
      } else {
        const createPayload: ProveedorCreate = {
          razon_social: formData.razon_social.trim(),
          nit: formData.nit.trim(),
          contacto: formData.contacto.trim() || null,
          telefono: formData.telefono.trim() || null,
          email: formData.email.trim() || null,
          direccion: formData.direccion.trim() || null,
        };
        await proveedoresApi.crear(createPayload);
        setNotificacion({
          tipo: 'success',
          mensaje: 'Proveedor registrado exitosamente en el sistema.',
        });
      }
      setModalAbierto(false);
      cargarProveedores();
    } catch {
      setNotificacion({
        tipo: 'error',
        mensaje: 'Ocurrió un error al procesar el proveedor en el servidor.',
      });
    } finally {
      setGuardando(false);
    }
  };

  // Filtrado de proveedores
  const proveedoresFiltrados = proveedores.filter((p) => {
    const q = busqueda.toLowerCase();
    return (
      p.razon_social.toLowerCase().includes(q) ||
      p.nit.toLowerCase().includes(q) ||
      (p.contacto && p.contacto.toLowerCase().includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q))
    );
  });

  // Métricas
  const totalConContacto = proveedores.filter((p) => Boolean(p.contacto)).length;
  const totalConTelefono = proveedores.filter((p) => Boolean(p.telefono)).length;

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
            Cadena de Suministro Litográfico
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
            Proveedores de Insumos
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.925rem' }}>
            Empresas proveedoras de papel, planchas CTP, tintas offset y químicos para la Imprenta Universitaria.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<RefreshCw size={16} className={cargando ? 'animate-spin' : ''} />}
            onClick={cargarProveedores}
            disabled={cargando}
            sx={{
              borderColor: UAGRM_COLORS.border,
              color: UAGRM_COLORS.blue.dark,
              backgroundColor: '#ffffff',
              fontWeight: 700,
              borderRadius: 50,
              px: 2,
              py: 0.9,
              textTransform: 'none',
              '&:hover': { backgroundColor: '#f8fafc', borderColor: '#cbd5e1' },
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
            Nuevo Proveedor
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
                <Truck size={24} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Total Registrados
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: UAGRM_COLORS.blue.dark }}>
                  {proveedores.length}
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
                <Building2 size={24} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Con Contacto Directo
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: UAGRM_COLORS.cyan.dark }}>
                  {totalConContacto}
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
                  backgroundColor: alpha(UAGRM_COLORS.blue.main, 0.1),
                  color: UAGRM_COLORS.blue.main,
                }}
              >
                <Phone size={24} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Líneas Telefónicas
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: UAGRM_COLORS.blue.main }}>
                  {totalConTelefono}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 3. Barra de Búsqueda */}
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
            placeholder="Buscar por Razón Social, NIT, Contacto o Correo..."
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
            label={`${proveedoresFiltrados.length} Proveedores`}
            size="small"
            sx={{
              fontWeight: 700,
              backgroundColor: alpha(UAGRM_COLORS.blue.main, 0.08),
              color: UAGRM_COLORS.blue.dark,
            }}
          />
        </Stack>
      </Card>

      {/* 4. Notificaciones / Errores */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* 5. Tabla de Proveedores */}
      {cargando ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <CircularProgress sx={{ color: UAGRM_COLORS.red.main, mb: 2 }} />
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
            Sincronizando proveedores litográficos...
          </Typography>
        </Box>
      ) : proveedoresFiltrados.length === 0 ? (
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
            backgroundColor: '#ffffff',
            borderRadius: 3,
            border: `1px dashed ${UAGRM_COLORS.border}`,
          }}
        >
          <Truck size={42} color="#94a3b8" style={{ marginBottom: 12 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#334155' }}>
            No se encontraron proveedores
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 400, mx: 'auto', mt: 0.5, mb: 2.5 }}>
            {busqueda
              ? 'No hay registros que coincidan con la búsqueda actual.'
              : 'Aún no se han registrado proveedores de suministros en el sistema.'}
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
            Registrar Primer Proveedor
          </Button>
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${UAGRM_COLORS.border}`,
            backgroundColor: '#ffffff',
          }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Proveedor / Razón Social
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  NIT
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Contacto Principal
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Teléfono / Correo
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Dirección
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {proveedoresFiltrados.map((p) => (
                <TableRow
                  key={p.id_proveedor}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: 2,
                          backgroundColor: alpha(UAGRM_COLORS.blue.main, 0.08),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: UAGRM_COLORS.blue.dark,
                          fontWeight: 800,
                          fontSize: '0.875rem',
                        }}
                      >
                        {p.razon_social.charAt(0).toUpperCase()}
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 780, color: '#1e293b' }}>
                          {p.razon_social}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          ID #{p.id_proveedor}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Chip
                      icon={<FileText size={13} />}
                      label={p.nit}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        backgroundColor: '#f1f5f9',
                        color: '#334155',
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
                      {p.contacto || '—'}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Stack spacing={0.5}>
                      {p.telefono && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#475569', fontSize: '0.8rem' }}>
                          <Phone size={13} color="#64748b" />
                          <span>{p.telefono}</span>
                        </Box>
                      )}
                      {p.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#475569', fontSize: '0.8rem' }}>
                          <Mail size={13} color="#64748b" />
                          <span>{p.email}</span>
                        </Box>
                      )}
                      {!p.telefono && !p.email && (
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          Sin datos de contacto
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>

                  <TableCell>
                    {p.direccion ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#475569', fontSize: '0.8rem' }}>
                        <MapPin size={13} color="#64748b" />
                        <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#475569' }}>
                          {p.direccion}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        —
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell align="right">
                    <Tooltip title="Editar proveedor">
                      <IconButton
                        size="small"
                        onClick={() => abrirModalEditar(p)}
                        sx={{
                          color: '#475569',
                          border: `1px solid ${UAGRM_COLORS.border}`,
                          '&:hover': {
                            backgroundColor: alpha(UAGRM_COLORS.blue.main, 0.08),
                            color: UAGRM_COLORS.blue.dark,
                          },
                        }}
                      >
                        <Edit2 size={15} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 6. MODAL POPUP PARA REGISTRAR / EDITAR PROVEEDOR (SIN REDIRECCIONAMIENTO) */}
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
            {proveedorEditando ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.875rem' }}>
            Gestión de Proveedores
          </Typography>
          <IconButton onClick={cerrarModal} disabled={guardando} size="small" sx={{ position: 'absolute', right: 16, top: 16, color: '#94a3b8', '&:hover': { color: '#475569' } }}>
            <X size={18} />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleGuardar}>
          <DialogContent sx={{ px: 2.5, py: 1.5 }}>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2.5, fontSize: '0.85rem' }}>
              Complete la información de la empresa proveedora de suministros para órdenes de compra litográficas.
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  required
                  size="small"
                  label="Razón Social / Nombre de Empresa"
                  placeholder="Ej: Distribuidora Gráfica Santa Cruz S.R.L."
                  value={formData.razon_social}
                  onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  size="small"
                  label="NIT"
                  placeholder="Ej: 1028475029"
                  value={formData.nit}
                  onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Persona de Contacto"
                  placeholder="Ej: Lic. Marcelo Pérez"
                  value={formData.contacto}
                  onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Teléfono / Celular"
                  placeholder="Ej: 3-3458900 / 70812345"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="email"
                  label="Correo Electrónico"
                  placeholder="ventas@proveedor.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  label="Dirección / Ubicación"
                  placeholder="Ej: Parque Industrial Mz. 14, Santa Cruz"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
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
