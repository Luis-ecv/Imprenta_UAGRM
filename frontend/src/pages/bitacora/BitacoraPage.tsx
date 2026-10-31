import { useState, useEffect, useMemo, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
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
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import {
  History,
  RefreshCw,
  Search,
  Eye,
  X,
  AlertCircle,
  ShieldCheck,
  Terminal,
  Laptop,
} from 'lucide-react';

import { reportesApi } from '@/api/reportes.api';
import { UAGRM_COLORS } from '@/theme/uagrmTheme';
import type { BitacoraResponse } from '@/types';
import { formatearFechaHora } from '@/utils/formatters';

export function BitacoraPage() {
  const [registros, setRegistros] = useState<BitacoraResponse[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [horaActual, setHoraActual] = useState<string>('');

  // Búsqueda y Pestañas de Filtrado
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroModulo, setFiltroModulo] = useState<string>('TODOS');

  // Modal para Inspección de Evento
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState<boolean>(false);
  const [registroSeleccionado, setRegistroSeleccionado] = useState<BitacoraResponse | null>(null);

  const cargarBitacora = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const res = await reportesApi.bitacora({ por_pagina: 150 });
      setRegistros(res.datos || []);
      const ahora = new Date();
      setHoraActual(ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch {
      setError('Error al consultar los registros de auditoría y seguridad.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarBitacora();
  }, [cargarBitacora]);

  // Handler para ver detalle
  const handleVerDetalle = (item: BitacoraResponse) => {
    setRegistroSeleccionado(item);
    setModalDetalleAbierto(true);
  };

  // Conteo exacto para las pestañas minimalistas (Estándar Imagen 2)
  const countTodos = registros.length;
  const countOrdenes = registros.filter((r) => {
    const m = (r.modulo || '').toUpperCase();
    return m.includes('ORDEN') || m.includes('TALLER');
  }).length;
  const countInsumos = registros.filter((r) => {
    const m = (r.modulo || '').toUpperCase();
    return m.includes('INSUMO') || m.includes('STOCK') || m.includes('COMPRA');
  }).length;
  const countProformas = registros.filter((r) => {
    const m = (r.modulo || '').toUpperCase();
    return m.includes('PROFORMA') || m.includes('CLIENTE');
  }).length;
  const countSeguridad = registros.filter((r) => {
    const m = (r.modulo || '').toUpperCase();
    return m.includes('AUTH') || m.includes('USUARIO') || m.includes('LOGIN');
  }).length;

  const tabsFiltro = [
    { key: 'TODOS', label: 'Todos', count: countTodos },
    { key: 'ORDENES', label: 'Taller & OT', count: countOrdenes },
    { key: 'INSUMOS', label: 'Insumos & Compras', count: countInsumos },
    { key: 'PROFORMAS', label: 'Proformas & Clientes', count: countProformas },
    { key: 'SEGURIDAD', label: 'Seguridad & Auth', count: countSeguridad },
  ];

  // Filtrado reactivo de registros
  const registrosFiltrados = useMemo(() => {
    return registros.filter((r) => {
      const q = busqueda.toLowerCase().trim();
      const coincideBusqueda =
        !q ||
        r.accion.toLowerCase().includes(q) ||
        r.modulo.toLowerCase().includes(q) ||
        (r.detalle && r.detalle.toLowerCase().includes(q)) ||
        (r.ip_origen && r.ip_origen.toLowerCase().includes(q)) ||
        `#${r.usuario_id}`.includes(q);

      if (!coincideBusqueda) return false;

      const m = (r.modulo || '').toUpperCase();
      if (filtroModulo === 'ORDENES') return m.includes('ORDEN') || m.includes('TALLER');
      if (filtroModulo === 'INSUMOS') return m.includes('INSUMO') || m.includes('STOCK') || m.includes('COMPRA');
      if (filtroModulo === 'PROFORMAS') return m.includes('PROFORMA') || m.includes('CLIENTE');
      if (filtroModulo === 'SEGURIDAD') return m.includes('AUTH') || m.includes('USUARIO') || m.includes('LOGIN');

      return true;
    });
  }, [registros, busqueda, filtroModulo]);

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
      {/* ===================================================================
          1. ENCABEZADO OFICIAL CON JERARQUÍA Y BOTONES ACCIÓN
          =================================================================== */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          {/* <Typography
            variant="caption"
            sx={{
              color: '#0284c7',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              display: 'block',
              mb: 0.5,
              fontSize: '0.75rem',
            }}
          >
            SEGURIDAD Y AUDITORÍA
          </Typography> */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#1e2b4d',
              letterSpacing: '-0.02em',
              fontSize: { xs: '1.65rem', sm: '2rem' },
              mb: 0.5,
            }}
          >
            Bitácora de Eventos del Sistema
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
            Registro inmutable de trazabilidad y operaciones críticas de la Imprenta UAGRM.
            {horaActual ? ` · Actualizado ${horaActual}` : ''}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={cargarBitacora}
          disabled={cargando}
          startIcon={<RefreshCw size={16} className={cargando ? 'animate-spin' : ''} />}
          sx={{
            borderRadius: 50,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.86rem',
            color: '#1e293b',
            borderColor: '#e2e8f0',
            backgroundColor: '#ffffff',
            px: 2.4,
            py: 0.85,
            '&:hover': {
              borderColor: '#cbd5e1',
              backgroundColor: '#f8fafc',
            },
          }}
        >
          Actualizar
        </Button>
      </Box>

      {/* ===================================================================
          2. NOTIFICACIÓN DE ERROR
          =================================================================== */}
      {error && (
        <Box
          sx={{
            mb: 2.5,
            p: 1.5,
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
          }}
        >
          <AlertCircle size={18} className="shrink-0 text-rose-600" />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {error}
          </Typography>
        </Box>
      )}

      {/* ===================================================================
          3. BUSCADOR Y PESTAÑAS HORIZONTALES CON LÍNEA ACTIVA (Estándar Imagen 2)
          =================================================================== */}
      <Box sx={{ mb: 2.5 }}>
        {/* Buscador */}
        <TextField
          size="small"
          placeholder="Buscar por módulo, acción, detalle o IP de origen..."
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

        {/* Pestañas horizontales idénticas a la Imagen 2: Activo y hover en negro/negrita con subrayado */}
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
            const isActive = filtroModulo === tab.key;
            return (
              <Box
                key={tab.key}
                component="button"
                onClick={() => setFiltroModulo(tab.key)}
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
                    fontSize: '0.86rem',
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? '#000000' : '#64748b',
                  }}
                >
                  {tab.count}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* ===================================================================
          4. TABLA PRINCIPAL MODERNA EN TARJETA ELEVADA
          =================================================================== */}
      {cargando ? (
        <Box
          sx={{
            py: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #e8e4dc',
          }}
        >
          <CircularProgress size={36} sx={{ color: UAGRM_COLORS.blue.main }} />
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
            Consultando registros de auditoría de la bitácora...
          </Typography>
        </Box>
      ) : registrosFiltrados.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            py: 8,
            px: 3,
            textAlign: 'center',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1px dashed #cbd5e1',
          }}
        >
          <History size={44} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e2b4d', mb: 0.5 }}>
            No hay eventos registrados en esta categoría
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 440, mx: 'auto' }}>
            Las operaciones ejecutadas por los operadores y administradores quedarán registradas de manera inmutable.
          </Typography>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          sx={{
            borderRadius: '24px',
            border: '1px solid #e8e4dc',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
            overflow: 'hidden',
          }}
        >
          <TableContainer>
            <Table sx={{ minWidth: 700 }}>
              <TableHead
                sx={{
                  backgroundColor: '#faf8f5',
                  borderBottom: '1px solid #e8e4dc',
                  '& .MuiTableCell-head': {
                    color: '#475569 !important',
                    fontWeight: '800 !important',
                    fontSize: '0.78rem',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    py: 1.8,
                  },
                }}
              >
                <TableRow>
                  <TableCell>Fecha y Hora</TableCell>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Módulo</TableCell>
                  <TableCell>Acción Realizada</TableCell>
                  <TableCell>IP Origen</TableCell>
                  <TableCell>Detalle</TableCell>
                  <TableCell align="center">Acción</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {registrosFiltrados.map((item) => {
                  return (
                    <TableRow
                      key={item.id_bitacora}
                      hover
                      sx={{
                        transition: 'background-color 0.15s ease',
                        '&:hover': { backgroundColor: '#f8fafc' },
                        borderBottom: '1px solid #f1f5f9',
                      }}
                    >
                      {/* Fecha y Hora en Negro Puro con Fuente del Sistema */}
                      <TableCell sx={{ py: 2, whiteSpace: 'nowrap' }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: '#000000',
                            fontSize: '0.84rem',
                          }}
                        >
                          {formatearFechaHora(item.created_at)}
                        </Typography>
                      </TableCell>

                      {/* Usuario: Texto simple en negro, sin tarjeta ni fuente monospace */}
                      <TableCell sx={{ py: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: '#000000',
                            fontSize: '0.84rem',
                          }}
                        >
                          ID #{item.usuario_id}
                        </Typography>
                      </TableCell>

                      {/* Módulo: Badge limpio neutral con letras negras y fuente del sistema */}
                      <TableCell sx={{ py: 2 }}>
                        <Box
                          component="span"
                          sx={{
                            display: 'inline-block',
                            backgroundColor: '#ffffff',
                            color: '#000000',
                            border: '1px solid #cbd5e1',
                            borderRadius: 50,
                            px: 1.5,
                            py: 0.25,
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                          }}
                        >
                          {item.modulo}
                        </Box>
                      </TableCell>

                      {/* Acción en Negro Puro con Fuente del Sistema */}
                      <TableCell sx={{ py: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            color: '#000000',
                            fontSize: '0.84rem',
                          }}
                        >
                          {item.accion}
                        </Typography>
                      </TableCell>

                      {/* IP Origen en Negro Puro con Fuente del Sistema */}
                      <TableCell sx={{ py: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: '#000000',
                            fontSize: '0.84rem',
                          }}
                        >
                          {item.ip_origen || '127.0.0.1'}
                        </Typography>
                      </TableCell>

                      {/* Detalle en Negro Puro con Fuente del Sistema */}
                      <TableCell sx={{ py: 2, maxWidth: 260 }}>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{
                            color: '#000000',
                            fontSize: '0.84rem',
                            fontWeight: 500,
                          }}
                          title={item.detalle || ''}
                        >
                          {item.detalle || 'Sin detalle adicional'}
                        </Typography>
                      </TableCell>

                      {/* Botón Inspeccionar */}
                      <TableCell align="center" sx={{ py: 2 }}>
                        <Tooltip title="Inspeccionar registro de auditoría" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleVerDetalle(item)}
                            sx={{
                              color: '#000000',
                              borderRadius: '50%',
                              '&:hover': {
                                backgroundColor: '#f1f5f9',
                              },
                            }}
                          >
                            <Eye size={17} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* ===================================================================
          5. MODAL DE INSPECCIÓN DETALLADA DEL EVENTO
          =================================================================== */}
      <Dialog
        open={modalDetalleAbierto}
        onClose={() => setModalDetalleAbierto(false)}
        maxWidth="sm"
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
            Registro de Auditoría Inmutable
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
            Seguridad y Trazabilidad Operativa
          </Typography>
          <IconButton
            size="small"
            onClick={() => setModalDetalleAbierto(false)}
            sx={{ position: 'absolute', right: 12, top: 12, color: '#94a3b8' }}
          >
            <X size={18} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 2, py: 1.5 }}>
          {registroSeleccionado && (
            <Stack spacing={2}>
              {/* Tarjeta superior con datos primarios */}
              <Box
                sx={{
                  p: 2,
                  backgroundColor: '#f8fafc',
                  borderRadius: 3,
                  border: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1.5,
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>
                    EVENTO AUDITADO
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    {registroSeleccionado.accion}
                  </Typography>
                </Box>

                <Box
                  component="span"
                  sx={{
                    backgroundColor: '#dbeafe',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    borderRadius: 50,
                    px: 1.8,
                    py: 0.4,
                    fontSize: '0.78rem',
                    fontWeight: 800,
                  }}
                >
                  {registroSeleccionado.modulo}
                </Box>
              </Box>

              {/* Fila con detalles técnicos */}
              <Box sx={{ p: 2, borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <ShieldCheck size={18} color="#059669" />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>
                        ID de Registro / Usuario
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                        Registro #{registroSeleccionado.id_bitacora} • Operador ID #{registroSeleccionado.usuario_id}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Terminal size={18} color="#0284c7" />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>
                        Fecha y Hora del Evento
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>
                        {formatearFechaHora(registroSeleccionado.created_at)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Laptop size={18} color="#64748b" />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>
                        Dirección IP de Conexión
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>
                        {registroSeleccionado.ip_origen || '127.0.0.1'}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>

              {/* Contenido completo del detalle */}
              <Box>
                <Typography variant="caption" sx={{ color: '#1e293b', fontWeight: 700, mb: 0.8, display: 'block' }}>
                  Detalle de la Operación
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    fontFamily: 'monospace',
                    fontSize: '0.84rem',
                    color: '#334155',
                    maxHeight: 180,
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {registroSeleccionado.detalle || 'No se registraron parámetros adicionales para esta acción.'}
                </Box>
              </Box>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1, justifyContent: 'center' }}>
          <Button
            onClick={() => setModalDetalleAbierto(false)}
            variant="contained"
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
    </Box>
  );
}

export default BitacoraPage;
