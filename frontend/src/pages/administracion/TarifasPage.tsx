import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Search,
  Plus,
  RefreshCw,
  Edit3,
  X,
  CheckCircle2,
  AlertCircle,
  Calculator,
} from 'lucide-react';

import { tarifasApi, type TarifaResponse } from '@/api/tarifas.api';
import { UAGRM_COLORS } from '@/theme/uagrmTheme';
import { formatearMoneda } from '@/utils/formatters';

export function TarifasPage() {
  const [tarifas, setTarifas] = useState<TarifaResponse[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [horaActual, setHoraActual] = useState<string>('');

  // Búsqueda y Filtros de Categoría
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');

  // Modal de Edición de Tarifa
  const [modalEditarAbierto, setModalEditarAbierto] = useState<boolean>(false);
  const [tarifaSeleccionada, setTarifaSeleccionada] = useState<TarifaResponse | null>(null);
  const [nuevoCosto, setNuevoCosto] = useState<number>(0);
  const [nuevaUnidad, setNuevaUnidad] = useState<string>('Millar');
  const [guardando, setGuardando] = useState<boolean>(false);

  // Modal de Nueva Tarifa
  const [modalNuevaAbierto, setModalNuevaAbierto] = useState<boolean>(false);
  const [nuevoConcepto, setNuevoConcepto] = useState<string>('');
  const [nuevoTipoTarifa, setNuevoTipoTarifa] = useState<string>('Tirada Offset');
  const [nuevoPrecio, setNuevoPrecio] = useState<number>(0);
  const [nuevaVigencia, setNuevaVigencia] = useState<string>('2026-12-31');
  const [creandoTarifa, setCreandoTarifa] = useState<boolean>(false);

  // Notificación de Éxito / Error
  const [notificacion, setNotificacion] = useState<{ tipo: 'success' | 'error'; mensaje: string } | null>(null);

  const cargarTarifas = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await tarifasApi.listar();
      setTarifas(data || []);
      const ahora = new Date();
      setHoraActual(ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch {
      setError('Error al sincronizar tarifas y aranceles litográficos del servidor.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarTarifas();
  }, [cargarTarifas]);

  // Limpiar notificación tras 4 segundos
  useEffect(() => {
    if (notificacion) {
      const timer = setTimeout(() => setNotificacion(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notificacion]);

  // Handler para Crear Nueva Tarifa
  const handleGuardarNuevaTarifa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoConcepto.trim()) {
      setNotificacion({ tipo: 'error', mensaje: 'El concepto de la tarifa es obligatorio.' });
      return;
    }
    if (Number(nuevoPrecio) <= 0) {
      setNotificacion({ tipo: 'error', mensaje: 'El costo o precio unitario debe ser mayor a 0 Bs.' });
      return;
    }

    try {
      setCreandoTarifa(true);
      await tarifasApi.crear({
        concepto: nuevoConcepto.trim(),
        precio_unitario: Number(nuevoPrecio),
        tipo_tarifa: nuevoTipoTarifa,
        vigencia_hasta: nuevaVigencia || '2026-12-31',
      });
      setNotificacion({
        tipo: 'success',
        mensaje: `Tarifa "${nuevoConcepto.trim()}" registrada exitosamente en el sistema.`,
      });
      setModalNuevaAbierto(false);
      setNuevoConcepto('');
      setNuevoPrecio(0);
      cargarTarifas();
    } catch {
      setNotificacion({
        tipo: 'error',
        mensaje: 'Error al registrar la nueva tarifa en el servidor.',
      });
    } finally {
      setCreandoTarifa(false);
    }
  };

  // Handlers para Edición
  const handleAbrirEditar = (tarifa: TarifaResponse) => {
    setTarifaSeleccionada(tarifa);
    setNuevoCosto(Number(tarifa.costo_unitario ?? tarifa.precio_unitario ?? 0));
    setNuevaUnidad(tarifa.unidad || 'Millar');
    setModalEditarAbierto(true);
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tarifaSeleccionada) return;

    try {
      setGuardando(true);
      await tarifasApi.actualizar(tarifaSeleccionada.id_tarifa, {
        costo_unitario: Number(nuevoCosto),
        precio_unitario: Number(nuevoCosto),
        unidad: nuevaUnidad,
      });

      setNotificacion({
        tipo: 'success',
        mensaje: `Tarifa "${tarifaSeleccionada.concepto}" actualizada correctamente.`,
      });
      setModalEditarAbierto(false);
      cargarTarifas();
    } catch {
      setNotificacion({
        tipo: 'error',
        mensaje: 'No se pudo guardar la tarifa en el servidor.',
      });
    } finally {
      setGuardando(false);
    }
  };

  // Tabs con conteo exacto idéntico al estándar de los otros módulos (Imagen 2)
  const countTodas = tarifas.length;
  const countOffset = tarifas.filter(
    (t) => t.concepto.toLowerCase().includes('offset') || (t.tipo_tarifa && t.tipo_tarifa.includes('OFFSET'))
  ).length;
  const countCorte = tarifas.filter(
    (t) => t.concepto.toLowerCase().includes('guillotina') || t.concepto.toLowerCase().includes('corte')
  ).length;
  const countAcabados = tarifas.filter(
    (t) =>
      t.concepto.toLowerCase().includes('doblado') ||
      t.concepto.toLowerCase().includes('encuadernaci') ||
      t.concepto.toLowerCase().includes('alzado')
  ).length;

  const tabsFiltro = [
    { key: 'TODAS', label: 'Todas', count: countTodas },
    { key: 'OFFSET', label: 'Tirada Offset', count: countOffset },
    { key: 'CORTE', label: 'Guillotina y Corte', count: countCorte },
    { key: 'ACABADO', label: 'Acabados y Fresado', count: countAcabados },
  ];

  // Filtrado reactivo de tarifas
  const tarifasFiltradas = useMemo(() => {
    return tarifas.filter((t) => {
      const q = busqueda.toLowerCase().trim();
      const coincideBusqueda =
        !q ||
        t.concepto.toLowerCase().includes(q) ||
        (t.unidad && t.unidad.toLowerCase().includes(q)) ||
        (t.tipo_tarifa && t.tipo_tarifa.toLowerCase().includes(q));

      if (!coincideBusqueda) return false;

      if (filtroCategoria === 'OFFSET') {
        return t.concepto.toLowerCase().includes('offset') || (t.tipo_tarifa && t.tipo_tarifa.includes('OFFSET'));
      }
      if (filtroCategoria === 'CORTE') {
        return t.concepto.toLowerCase().includes('guillotina') || t.concepto.toLowerCase().includes('corte');
      }
      if (filtroCategoria === 'ACABADO') {
        return (
          t.concepto.toLowerCase().includes('doblado') ||
          t.concepto.toLowerCase().includes('encuadernaci') ||
          t.concepto.toLowerCase().includes('alzado')
        );
      }

      return true;
    });
  }, [tarifas, busqueda, filtroCategoria]);

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
            CONFIGURACIÓN COMERCIAL
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
            Tarifas y Aranceles Litográficos
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
            Valores unitarios de impresión, mano de obra y acabados vigentes en la UAGRM.
            {horaActual ? ` · Actualizado ${horaActual}` : ''}
          </Typography>
        </Box>

        {/* Botones Píldora de Acción */}
        <Stack direction="row" spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            onClick={cargarTarifas}
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
              px: 2.2,
              py: 0.85,
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
            onClick={() => setModalNuevaAbierto(true)}
            startIcon={<Plus size={16} />}
            sx={{
              borderRadius: 50,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.86rem',
              backgroundColor: '#1e2b4d',
              color: '#ffffff',
              px: 2.4,
              py: 0.85,
              boxShadow: '0 4px 14px rgba(30, 43, 77, 0.25)',
              '&:hover': {
                backgroundColor: '#141d34',
              },
            }}
          >
            Nueva Tarifa
          </Button>
        </Stack>
      </Box>

      {/* ===================================================================
          2. NOTIFICACIÓN DE ERROR DEL SERVIDOR
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
          3. NOTIFICACIÓN DE FEEDBACK
          =================================================================== */}
      {notificacion && (
        <Box
          sx={{
            mb: 2.5,
            p: 1.5,
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            backgroundColor: notificacion.tipo === 'success' ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${notificacion.tipo === 'success' ? '#a7f3d0' : '#fecaca'}`,
            color: notificacion.tipo === 'success' ? '#065f46' : '#991b1b',
          }}
        >
          {notificacion.tipo === 'success' ? (
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
          )}
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {notificacion.mensaje}
          </Typography>
        </Box>
      )}

      {/* ===================================================================
          4. BUSCADOR Y PESTAÑAS HORIZONTALES CON LÍNEA ACTIVA (Estándar Imagen 2)
          =================================================================== */}
      <Box sx={{ mb: 2.5 }}>
        {/* Buscador */}
        <TextField
          size="small"
          placeholder="Buscar por concepto o proceso litográfico..."
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
            const isActive = filtroCategoria === tab.key;
            return (
              <Box
                key={tab.key}
                component="button"
                onClick={() => setFiltroCategoria(tab.key)}
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
            Sincronizando tarifario litográfico oficial...
          </Typography>
        </Box>
      ) : tarifasFiltradas.length === 0 ? (
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
          <Calculator size={44} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e2b4d', mb: 0.5 }}>
            No se encontraron tarifas registradas
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 440, mx: 'auto' }}>
            Prueba cambiando los términos de búsqueda o registra un nuevo concepto de mano de obra y acabados.
          </Typography>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid #ebe6df',
            backgroundColor: '#ffffff',
            overflow: 'hidden',
          }}
        >
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ backgroundColor: '#faf8f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df' }}>
                    Concepto / Proceso Litográfico
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df' }}>
                    Tipo Trabajo
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df' }}>
                    Unidad de Cobro
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df' }}>
                    Costo Unitario
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df' }}>
                    Estado
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df' }}>
                    Acción
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {tarifasFiltradas.map((t) => {
                  const costo = Number(t.costo_unitario ?? t.precio_unitario ?? 0);
                  const unidadLabel = t.unidad || 'Millar';
                  const tipoLabel = t.tipo_tarifa || (t.tipo_trabajo_id ? `ID #${t.tipo_trabajo_id}` : 'General');

                  return (
                    <TableRow
                      key={t.id_tarifa}
                      hover
                      sx={{
                        '&:hover': { backgroundColor: '#faf8f5' },
                        '& td': { borderBottom: '1px solid #f0ede6', py: 1.8 },
                        '&:last-child td': { borderBottom: 0 },
                      }}
                    >
                      {/* Concepto sin caja ni icono, texto negro */}
                      <TableCell>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 800,
                              color: '#000000',
                              fontSize: '0.92rem',
                              lineHeight: 1.3,
                            }}
                          >
                            {t.concepto}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#88847e', fontWeight: 600, fontSize: '0.8rem', mt: 0.3, display: 'block' }}>
                            Arancel de taller litográfico
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Tipo de Trabajo como texto limpio en negro */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#000000', fontSize: '0.88rem' }}>
                          {tipoLabel}
                        </Typography>
                      </TableCell>

                      {/* Unidad */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#000000', fontSize: '0.88rem' }}>
                          {unidadLabel}
                        </Typography>
                      </TableCell>

                      {/* Costo Unitario en Bs. */}
                      <TableCell align="right">
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 800,
                            color: '#000000',
                            fontSize: '0.92rem',
                          }}
                        >
                          {formatearMoneda(costo)}
                        </Typography>
                      </TableCell>

                      {/* Estado */}
                      <TableCell align="center">
                        <Box
                          component="span"
                          sx={{
                            display: 'inline-block',
                            backgroundColor: '#ecfdf5',
                            color: '#047857',
                            borderRadius: 50,
                            px: 1.6,
                            py: 0.35,
                            fontSize: '0.74rem',
                            fontWeight: 700,
                          }}
                        >
                          Activa
                        </Box>
                      </TableCell>

                      {/* Botón de Ajuste / Edición */}
                      <TableCell align="center">
                        <Tooltip title="Ajustar valor de la tarifa" arrow>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleAbrirEditar(t)}
                            startIcon={<Edit3 size={14} />}
                            sx={{
                              borderRadius: 50,
                              textTransform: 'none',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              color: '#0f172a',
                              borderColor: '#e2e8f0',
                              backgroundColor: '#ffffff',
                              px: 1.6,
                              py: 0.45,
                              '&:hover': {
                                backgroundColor: '#f1f5f9',
                                borderColor: '#cbd5e1',
                              },
                            }}
                          >
                            Editar
                          </Button>
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
          5. MODAL DE AJUSTE / EDICIÓN DE TARIFA
          =================================================================== */}
      <Dialog
        open={modalEditarAbierto}
        onClose={() => setModalEditarAbierto(false)}
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
            Ajustar Tarifa Litográfica
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
            Configuración comercial de mano de obra y acabados
          </Typography>
          <IconButton
            size="small"
            onClick={() => setModalEditarAbierto(false)}
            sx={{ position: 'absolute', right: 12, top: 12, color: '#94a3b8' }}
          >
            <X size={18} />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleGuardarEdicion}>
          <DialogContent sx={{ px: 2, py: 1.5 }}>
            {tarifaSeleccionada && (
              <Box
                sx={{
                  p: 2,
                  mb: 2,
                  backgroundColor: '#f8fafc',
                  borderRadius: 3,
                  border: '1px solid #f1f5f9',
                }}
              >
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', mb: 0.3 }}>
                  CONCEPTO DE SERVICIO
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  {tarifaSeleccionada.concepto}
                </Typography>
              </Box>
            )}

            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" sx={{ color: '#1e293b', fontWeight: 700, mb: 0.8, display: 'block' }}>
                  Costo Unitario (Bs.)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={nuevoCosto}
                  onChange={(e) => setNuevoCosto(parseFloat(e.target.value) || 0)}
                  slotProps={{
                    input: {
                      endAdornment: <InputAdornment position="end">Bs.</InputAdornment>,
                      sx: { borderRadius: 3, fontWeight: 700, fontFamily: 'monospace' },
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#1e293b', fontWeight: 700, mb: 0.8, display: 'block' }}>
                  Unidad de Cobro
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={nuevaUnidad}
                  onChange={(e) => setNuevaUnidad(e.target.value)}
                  placeholder="Ej. Millar, Pliego, Hora..."
                  slotProps={{
                    input: { sx: { borderRadius: 3, fontWeight: 600 } },
                  }}
                />
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2, pt: 1, justifyContent: 'flex-end', gap: 1 }}>
            <Button
              onClick={() => setModalEditarAbierto(false)}
              sx={{ borderRadius: 50, color: '#64748b', fontWeight: 700, textTransform: 'none' }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={guardando}
              sx={{
                borderRadius: 50,
                backgroundColor: '#1e2b4d',
                color: '#ffffff',
                fontWeight: 700,
                px: 3,
                textTransform: 'none',
                '&:hover': { backgroundColor: '#141d34' },
              }}
            >
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ===================================================================
          6. MODAL DE NUEVA TARIFA (Conectado a POST /tarifas)
          =================================================================== */}
      <Dialog
        open={modalNuevaAbierto}
        onClose={() => !creandoTarifa && setModalNuevaAbierto(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 1,
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.12)',
            },
          },
        }}
      >
        <form onSubmit={handleGuardarNuevaTarifa}>
          <DialogTitle sx={{ px: 3, pt: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#000000', fontSize: '1.2rem' }}>
                Registrar Nueva Tarifa Litográfica
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                Nuevo arancel oficial para presupuestos y órdenes de trabajo
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setModalNuevaAbierto(false)}
              disabled={creandoTarifa}
              sx={{ color: '#94a3b8' }}
            >
              <X size={18} />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ px: 3, py: 2 }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, display: 'block', mb: 0.8, textTransform: 'uppercase', fontSize: '0.74rem' }}>
                  Concepto / Proceso Litográfico *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  required
                  value={nuevoConcepto}
                  onChange={(e) => setNuevoConcepto(e.target.value)}
                  placeholder="Ej. Encuadernación Rústica Fresada, Barniz UV Sectorizado..."
                  slotProps={{
                    input: { sx: { borderRadius: 2.5, fontWeight: 600 } },
                  }}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, display: 'block', mb: 0.8, textTransform: 'uppercase', fontSize: '0.74rem' }}>
                    Tipo de Tarifa / Categoría *
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={nuevoTipoTarifa}
                    onChange={(e) => setNuevoTipoTarifa(e.target.value)}
                    slotProps={{
                      input: { sx: { borderRadius: 2.5, fontWeight: 600 } },
                    }}
                  >
                    <MenuItem value="Tirada Offset">Tirada Offset</MenuItem>
                    <MenuItem value="Guillotina y Corte">Guillotina y Corte</MenuItem>
                    <MenuItem value="Acabados y Fresado">Acabados y Fresado</MenuItem>
                    <MenuItem value="Diseño y CTP">Diseño y CTP</MenuItem>
                    <MenuItem value="General">General</MenuItem>
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, display: 'block', mb: 0.8, textTransform: 'uppercase', fontSize: '0.74rem' }}>
                    Costo / Precio Unitario (Bs.) *
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    required
                    value={nuevoPrecio || ''}
                    onChange={(e) => setNuevoPrecio(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    slotProps={{
                      htmlInput: { step: '0.01', min: '0.01' },
                      input: {
                        endAdornment: <InputAdornment position="end">Bs.</InputAdornment>,
                        sx: { borderRadius: 2.5, fontWeight: 700 },
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <Box>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, display: 'block', mb: 0.8, textTransform: 'uppercase', fontSize: '0.74rem' }}>
                  Vigencia de la Tarifa
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  value={nuevaVigencia}
                  onChange={(e) => setNuevaVigencia(e.target.value)}
                  slotProps={{
                    input: { sx: { borderRadius: 2.5, fontWeight: 600 } },
                  }}
                />
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
            <Button
              onClick={() => setModalNuevaAbierto(false)}
              disabled={creandoTarifa}
              sx={{ borderRadius: 50, color: '#64748b', fontWeight: 700, textTransform: 'none' }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={creandoTarifa}
              sx={{
                borderRadius: 50,
                backgroundColor: '#1e2b4d',
                color: '#ffffff',
                fontWeight: 700,
                px: 3,
                py: 0.8,
                textTransform: 'none',
                '&:hover': { backgroundColor: '#141d34' },
              }}
            >
              {creandoTarifa ? 'Guardando Tarifa...' : 'Guardar Tarifa'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default TarifasPage;
