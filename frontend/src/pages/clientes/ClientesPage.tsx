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
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { alpha } from '@mui/material/styles';
import {
  Users,
  Plus,
  Search,
  Building,
  GraduationCap,
  Edit2,
  RefreshCw,
  X,
  Check,
} from 'lucide-react';

import { clientesApi } from '@/api/clientes.api';
import { UAGRM_COLORS } from '@/theme/uagrmTheme';
import type { ClienteResponse, ClienteCreate, ClienteUpdate, TipoCliente } from '@/types';

const TIPOS_CLIENTE_OPCIONES: { valor: TipoCliente; label: string }[] = [
  { valor: 'facultad', label: 'Facultad / Unidad Académica' },
  { valor: 'docente', label: 'Docente Universitario' },
  { valor: 'autoridad', label: 'Autoridad / Directivo' },
  { valor: 'estudiante', label: 'Estudiante / Centro de Estudiantes' },
  { valor: 'particular', label: 'Cliente Particular / Externo' },
];

export function ClientesPage() {
  const [clientes, setClientes] = useState<ClienteResponse[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');

  // Modal Dialog states
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [clienteEditando, setClienteEditando] = useState<ClienteResponse | null>(null);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [notificacion, setNotificacion] = useState<{ tipo: 'success' | 'error'; mensaje: string } | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    razon_social: string;
    tipo_cliente: TipoCliente;
    ci_nit: string;
    telefono: string;
    email: string;
    direccion: string;
    codigo_facultad: string;
    dependencia: string;
  }>({
    razon_social: '',
    tipo_cliente: 'facultad',
    ci_nit: '',
    telefono: '',
    email: '',
    direccion: '',
    codigo_facultad: '',
    dependencia: '',
  });

  const cargarClientes = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const res = await clientesApi.listar({ por_pagina: 100 });
      setClientes(res.datos || []);
    } catch {
      setError('Error al sincronizar clientes universitarios desde el servidor.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  const abrirModalCrear = () => {
    setClienteEditando(null);
    setFormData({
      razon_social: '',
      tipo_cliente: 'facultad',
      ci_nit: '',
      telefono: '',
      email: '',
      direccion: '',
      codigo_facultad: '',
      dependencia: '',
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (c: ClienteResponse) => {
    setClienteEditando(c);
    setFormData({
      razon_social: c.razon_social || '',
      tipo_cliente: c.tipo_cliente || 'particular',
      ci_nit: c.ci_nit || c.nit_ci || '',
      telefono: c.telefono || '',
      email: c.email || '',
      direccion: c.direccion || '',
      codigo_facultad: c.codigo_facultad || '',
      dependencia: c.dependencia || '',
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    if (!guardando) {
      setModalAbierto(false);
      setClienteEditando(null);
    }
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.razon_social.trim()) {
      setNotificacion({
        tipo: 'error',
        mensaje: 'La Razón Social / Nombre del Solicitante es obligatoria.',
      });
      return;
    }

    try {
      setGuardando(true);
      if (clienteEditando) {
        const updatePayload: ClienteUpdate = {
          razon_social: formData.razon_social.trim(),
          tipo_cliente: formData.tipo_cliente,
          ci_nit: formData.ci_nit.trim() || null,
          nit_ci: formData.ci_nit.trim() || null,
          telefono: formData.telefono.trim() || null,
          email: formData.email.trim() || null,
          direccion: formData.direccion.trim() || null,
          codigo_facultad: formData.codigo_facultad.trim() || null,
          dependencia: formData.dependencia.trim() || null,
        };
        await clientesApi.actualizar(clienteEditando.id_cliente, updatePayload);
        setNotificacion({
          tipo: 'success',
          mensaje: 'Cliente universitario actualizado con éxito.',
        });
      } else {
        const createPayload: ClienteCreate = {
          razon_social: formData.razon_social.trim(),
          tipo_cliente: formData.tipo_cliente,
          ci_nit: formData.ci_nit.trim() || null,
          nit_ci: formData.ci_nit.trim() || null,
          telefono: formData.telefono.trim() || null,
          email: formData.email.trim() || null,
          direccion: formData.direccion.trim() || null,
          codigo_facultad: formData.codigo_facultad.trim() || null,
          dependencia: formData.dependencia.trim() || null,
        };
        await clientesApi.crear(createPayload);
        setNotificacion({
          tipo: 'success',
          mensaje: 'Cliente universitario registrado exitosamente.',
        });
      }
      setModalAbierto(false);
      cargarClientes();
    } catch {
      setNotificacion({
        tipo: 'error',
        mensaje: 'Ocurrió un error al guardar la información del cliente.',
      });
    } finally {
      setGuardando(false);
    }
  };

  // Normalizador tolerante para tipos de cliente
  const normalizeTipo = (tipo?: string | null): TipoCliente => {
    if (!tipo) return 'particular';
    const t = tipo.toLowerCase().trim();
    if (t.includes('facultad')) return 'facultad';
    if (t.includes('docente')) return 'docente';
    if (t.includes('autoridad')) return 'autoridad';
    if (t.includes('estudiante')) return 'estudiante';
    if (t.includes('particular')) return 'particular';
    return 'particular';
  };

  // Filtrado
  const clientesFiltrados = clientes.filter((c) => {
    const q = busqueda.toLowerCase();
    const coincideTexto =
      c.razon_social.toLowerCase().includes(q) ||
      (c.nit_ci && c.nit_ci.toLowerCase().includes(q)) ||
      (c.ci_nit && c.ci_nit.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.dependencia && c.dependencia.toLowerCase().includes(q));

    const coincideTipo = filtroTipo === 'todos' || normalizeTipo(c.tipo_cliente) === filtroTipo;

    return coincideTexto && coincideTipo;
  });

  // Métricas
  const totalFacultades = clientes.filter((c) => {
    const t = normalizeTipo(c.tipo_cliente);
    return t === 'facultad' || t === 'autoridad';
  }).length;
  const totalAcademicos = clientes.filter((c) => {
    const t = normalizeTipo(c.tipo_cliente);
    return t === 'docente' || t === 'estudiante';
  }).length;

  // Tabs con conteo exacto según diseño
  const countTodos = clientes.length;
  const countFacultad = clientes.filter((c) => normalizeTipo(c.tipo_cliente) === 'facultad').length;
  const countDocente = clientes.filter((c) => normalizeTipo(c.tipo_cliente) === 'docente').length;
  const countAutoridad = clientes.filter((c) => normalizeTipo(c.tipo_cliente) === 'autoridad').length;
  const countEstudiante = clientes.filter((c) => normalizeTipo(c.tipo_cliente) === 'estudiante').length;
  const countParticular = clientes.filter((c) => normalizeTipo(c.tipo_cliente) === 'particular').length;

  const tabsFiltro = [
    { key: 'todos', label: 'Todos', count: countTodos },
    { key: 'facultad', label: 'Facultad', count: countFacultad },
    { key: 'docente', label: 'Docente', count: countDocente },
    { key: 'autoridad', label: 'Autoridad', count: countAutoridad },
    { key: 'estudiante', label: 'Estudiante', count: countEstudiante },
    { key: 'particular', label: 'Particular', count: countParticular },
  ];

  // Renderizador de Badge de Tipo de Cliente (todos celestes)
  const renderTipoBadge = (tipo: TipoCliente | string) => {
    let label = 'Particular';
    switch (tipo) {
      case 'facultad':
        label = 'Facultad';
        break;
      case 'docente':
        label = 'Docente';
        break;
      case 'autoridad':
        label = 'Autoridad';
        break;
      case 'estudiante':
        label = 'Estudiante';
        break;
      default:
        label = 'Particular';
    }

    return (
      <Box
        sx={{
          display: 'inline-block',
          px: 1.6,
          py: 0.35,
          borderRadius: 50,
          backgroundColor: '#eef8fc',
          color: '#0284c7',
          fontWeight: 700,
          fontSize: '0.78rem',
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Box>
    );
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
            Padrón Institucional
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
            Clientes y Solicitantes
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.925rem' }}>
            Registro de facultades, carreras, docentes y público universitario solicitante de impresiones.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<RefreshCw size={16} className={cargando ? 'animate-spin' : ''} />}
            onClick={cargarClientes}
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
            Nuevo Cliente
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
                  Total Solicitantes
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: UAGRM_COLORS.blue.dark }}>
                  {clientes.length}
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
                <Building size={24} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Facultades y Unidades
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: UAGRM_COLORS.blue.main }}>
                  {totalFacultades}
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
                <GraduationCap size={24} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Comunidad Universitaria
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: UAGRM_COLORS.cyan.dark }}>
                  {totalAcademicos}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

            {/* 3. Búsqueda y Navegación por Pestañas */}
      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Buscar por Nombre, CI/NIT, Carrera o Correo..."
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
            maxWidth: { xs: '100%', md: 740 },
            width: '100%',
            mb: 2.5,
            backgroundColor: '#ffffff',
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: '#ffffff',
              '& fieldset': {
                borderColor: '#e2e8f0',
              },
              '&:hover fieldset': {
                borderColor: '#cbd5e1',
              },
            },
          }}
        />

        {/* Pestañas horizontales idénticas al diseño: activo y hover en negro y negrita */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 2.5, sm: 4 },
            borderBottom: '1px solid #e8e4dc',
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            msOverflowStyle: 'none',
            pb: 0,
          }}
        >
          {tabsFiltro.map((tab) => {
            const isActive = filtroTipo === tab.key;
            return (
              <Box
                key={tab.key}
                component="button"
                onClick={() => setFiltroTipo(tab.key)}
                sx={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  pb: 1.2,
                  px: 0.5,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.8,
                  fontFamily: 'inherit',
                  fontSize: '0.925rem',
                  fontWeight: isActive ? 800 : 500,
                  color: isActive ? '#000000' : '#64748b',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    color: '#000000',
                    fontWeight: 800,
                  },
                  '&:hover span': {
                    color: '#000000',
                    fontWeight: 800,
                  },
                  '&::after': isActive
                    ? {
                        content: '""',
                        position: 'absolute',
                        bottom: -1,
                        left: 0,
                        right: 0,
                        height: '2.5px',
                        backgroundColor: '#000000',
                        borderRadius: '2px 2px 0 0',
                      }
                    : undefined,
                }}
              >
                <span>{tab.label}</span>
                <Typography
                  component="span"
                  sx={{
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 800 : 500,
                    color: isActive ? '#000000' : '#64748b',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.count}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* 4. Notificaciones de error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* 5. Tabla de Clientes */}
      {cargando ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <CircularProgress sx={{ color: UAGRM_COLORS.blue.main, mb: 2 }} />
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
            Cargando padrón de clientes y dependencias...
          </Typography>
        </Box>
      ) : clientesFiltrados.length === 0 ? (
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
            No se encontraron clientes registrados
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 400, mx: 'auto', mt: 0.5, mb: 2.5 }}>
            {busqueda
              ? 'No hay solicitantes que coincidan con los criterios de búsqueda.'
              : 'Empiece registrando una facultad, docente o solicitante para emitir proformas.'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={abrirModalCrear}
            sx={{
              backgroundColor: '#1e2b4d',
              color: '#ffffff',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 50,
              px: 3,
              py: 1,
              boxShadow: '0 4px 12px rgba(30, 43, 77, 0.2)',
              '&:hover': { backgroundColor: '#141d34' },
            }}
          >
            Registrar Primer Solicitante
          </Button>
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid #ebe6df',
            backgroundColor: '#ffffff',
            overflow: 'hidden',
          }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: '#f7f4ee' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df' }}>
                  Solicitante / Razón Social
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df' }}>
                  Tipo
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df' }}>
                  CI / NIT
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df' }}>
                  Dependencia
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df' }}>
                  Contacto
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df', pr: 3 }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientesFiltrados.map((c) => {
                const nitCi = c.ci_nit || c.nit_ci;

                return (
                  <TableRow
                    key={c.id_cliente}
                    hover
                    sx={{
                      '&:hover': { backgroundColor: '#faf8f5' },
                      '& td': { borderBottom: '1px solid #f0ede6', py: 1.8 },
                      '&:last-child td': { borderBottom: 0 },
                    }}
                  >
                    {/* 1. Solicitante / Razón Social (Mayúsculas y Negrita, sin encapsular en círculo/caja) */}
                    <TableCell>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 800,
                            color: '#1a1a1a',
                            fontSize: '0.92rem',
                            textTransform: 'uppercase',
                            lineHeight: 1.3,
                            letterSpacing: '0.01em',
                          }}
                        >
                          {c.razon_social}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#88847e',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            mt: 0.3,
                            display: 'block',
                          }}
                        >
                          Registro N.º {c.id_cliente}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* 2. Tipo */}
                    <TableCell>
                      {renderTipoBadge(normalizeTipo(c.tipo_cliente))}
                    </TableCell>

                    {/* 3. CI / NIT */}
                    <TableCell>
                      <Typography sx={{ color: '#2d2b28', fontWeight: 600, fontSize: '0.88rem' }}>
                        {nitCi || '—'}
                      </Typography>
                    </TableCell>

                    {/* 4. Dependencia */}
                    <TableCell>
                      {c.codigo_facultad ? (
                        <Box>
                          <Typography sx={{ fontWeight: 750, color: '#1a1a1a', fontSize: '0.88rem' }}>
                            {c.codigo_facultad}
                          </Typography>
                          <Typography sx={{ color: '#88847e', fontSize: '0.8rem', fontWeight: 500, mt: 0.2 }}>
                            {c.dependencia || 'Sin dependencia asignada'}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography sx={{ color: c.dependencia ? '#2d2b28' : '#88847e', fontSize: '0.85rem', fontWeight: c.dependencia ? 600 : 500, maxWidth: 220 }}>
                          {c.dependencia || 'Sin dependencia asignada'}
                        </Typography>
                      )}
                    </TableCell>

                    {/* 5. Contacto */}
                    <TableCell>
                      <Box>
                        {c.telefono ? (
                          <Typography sx={{ color: '#1a1a1a', fontWeight: 600, fontSize: '0.88rem' }}>
                            {c.telefono}
                          </Typography>
                        ) : null}
                        {c.email ? (
                          <Typography sx={{ color: '#88847e', fontSize: '0.82rem', mt: c.telefono ? 0.3 : 0 }}>
                            {c.email}
                          </Typography>
                        ) : null}
                        {!c.telefono && !c.email && (
                          <Typography sx={{ color: '#b0aba2', fontSize: '0.82rem' }}>
                            Sin contacto registrado
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* 6. Acciones */}
                    <TableCell align="right" sx={{ pr: 3 }}>
                      <Tooltip title="Editar Solicitante">
                        <IconButton
                          size="small"
                          onClick={() => abrirModalEditar(c)}
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            border: '1px solid #dcd8d0',
                            backgroundColor: '#ffffff',
                            color: '#55514a',
                            transition: 'all 0.15s ease',
                            '&:hover': {
                              backgroundColor: '#f7f5f0',
                              borderColor: '#c5c0b6',
                              color: '#1a1918',
                            },
                          }}
                        >
                          <Edit2 size={16} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 6. MODAL POPUP PARA REGISTRAR / EDITAR CLIENTE (SIN REDIRECCIONAMIENTO) */}
      <Dialog
        open={modalAbierto}
        onClose={cerrarModal}
        maxWidth="md"
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
            {clienteEditando ? 'Editar Cliente' : 'Nuevo Cliente o Solicitante'}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.875rem' }}>
            Directorio Litográfico
          </Typography>
          <IconButton onClick={cerrarModal} disabled={guardando} size="small" sx={{ position: 'absolute', right: 16, top: 16, color: '#94a3b8', '&:hover': { color: '#475569' } }}>
            <X size={18} />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleGuardar}>
          <DialogContent sx={{ px: 2.5, py: 1.5 }}>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2.5, fontSize: '0.85rem' }}>
              Complete los datos del solicitante institucional para cotizaciones, proformas y facturación litográfica.
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Tipo de Solicitante"
                  value={formData.tipo_cliente}
                  onChange={(e) => setFormData({ ...formData, tipo_cliente: e.target.value as TipoCliente })}
                >
                  {TIPOS_CLIENTE_OPCIONES.map((opt) => (
                    <MenuItem key={opt.valor} value={opt.valor}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  size="small"
                  label="Razón Social / Nombre Completo"
                  placeholder="Ej: Facultad de Ciencias de la Computación"
                  value={formData.razon_social}
                  onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="CI / NIT"
                  placeholder="Ej: 8934521 SCZ / 102938475"
                  value={formData.ci_nit}
                  onChange={(e) => setFormData({ ...formData, ci_nit: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Código de Facultad"
                  placeholder="Ej: FICCT, FINOR, FCE, etc."
                  value={formData.codigo_facultad}
                  onChange={(e) => setFormData({ ...formData, codigo_facultad: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Dependencia / Carrera / Dirección"
                  placeholder="Ej: Dirección de Carrera Ingeniería Informática"
                  value={formData.dependencia}
                  onChange={(e) => setFormData({ ...formData, dependencia: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Teléfono / Interno / Celular"
                  placeholder="Ej: 3-3564789 / 76543210"
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
                  placeholder="solicitante@uagrm.edu.bo"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Dirección / Campus / Módulo"
                  placeholder="Ej: Ciudad Universitaria Módulo 236"
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
                borderRadius: 50,
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
              disabled={guardando}
              endIcon={<Check size={18} />}
              sx={{
                backgroundColor: '#1e2b4d',
                color: '#ffffff',
                fontWeight: 700,
                px: 3.5,
                py: 1.1,
                borderRadius: 50,
                textTransform: 'none',
                fontSize: '0.875rem',
                minWidth: 135,
                boxShadow: '0 4px 14px rgba(30, 43, 77, 0.25)',
                '&:hover': {
                  backgroundColor: '#141d34',
                },
              }}
            >
              {guardando ? (
                <CircularProgress size={18} sx={{ color: '#ffffff' }} />
              ) : (
                'Confirmar'
              )}
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
