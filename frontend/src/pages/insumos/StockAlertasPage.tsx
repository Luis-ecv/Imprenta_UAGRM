import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import {
  AlertTriangle,
  RefreshCw,
  Layers,
  CheckCircle2,
  Check,
  X,
  PackagePlus,
  Sliders,
  Package,
} from 'lucide-react';

import { insumosApi } from '@/api/insumos.api';
import { UAGRM_COLORS } from '@/theme/uagrmTheme';
import type { InsumoResponse, MovimientoInventarioCreate } from '@/types';
import { formatearMoneda } from '@/utils/formatters';

export function StockAlertasPage() {
  const [alertas, setAlertas] = useState<InsumoResponse[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [horaActual, setHoraActual] = useState<string>('');
  const [seleccionados, setSeleccionados] = useState<number[]>([]);

  // Modal 1: Reabastecimiento rápido (Popup)
  const [modalReabastecerAbierto, setModalReabastecerAbierto] = useState<boolean>(false);
  const [insumoParaReabastecer, setInsumoParaReabastecer] = useState<InsumoResponse | null>(null);
  const [cantidadReabastecer, setCantidadReabastecer] = useState<number>(10);
  const [referenciaReabastecer, setReferenciaReabastecer] = useState<string>('Reposición por stock crítico de seguridad');
  const [guardandoReabastecimiento, setGuardandoReabastecimiento] = useState<boolean>(false);

  // Modal 2: Ajuste de parámetros de stock (Popup)
  const [modalAjusteAbierto, setModalAjusteAbierto] = useState<boolean>(false);
  const [insumoParaAjuste, setInsumoParaAjuste] = useState<InsumoResponse | null>(null);
  const [stockMinimoAjuste, setStockMinimoAjuste] = useState<number>(0);
  const [costoAjuste, setCostoAjuste] = useState<number>(0);
  const [guardandoAjuste, setGuardandoAjuste] = useState<boolean>(false);

  // Feedback notifications
  const [notificacion, setNotificacion] = useState<{ tipo: 'success' | 'error'; mensaje: string } | null>(null);

  const cargarAlertas = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await insumosApi.obtenerAlertas();
      setAlertas(data || []);
      const ahora = new Date();
      setHoraActual(ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch {
      setError('Error al sincronizar alertas de stock crítico desde el almacén.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarAlertas();
  }, [cargarAlertas]);

  // Selección múltiple con Checkboxes
  const handleToggleSelectAll = () => {
    if (seleccionados.length === alertas.length) {
      setSeleccionados([]);
    } else {
      setSeleccionados(alertas.map((a) => a.id_insumo));
    }
  };

  const handleToggleSelect = (id: number) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Handlers para Modal Reabastecer
  const abrirModalReabastecer = (insumo: InsumoResponse) => {
    const deficit = Math.max(1, Number(insumo.stock_minimo) - Number(insumo.stock_actual));
    setInsumoParaReabastecer(insumo);
    setCantidadReabastecer(deficit);
    setReferenciaReabastecer('Reposición por stock de seguridad');
    setModalReabastecerAbierto(true);
  };

  const handleReabastecerCriticoHeader = () => {
    if (alertas.length === 0) return;
    const target =
      seleccionados.length > 0
        ? alertas.find((a) => seleccionados.includes(a.id_insumo)) || alertas[0]
        : alertas[0];
    abrirModalReabastecer(target);
  };

  const handleEjecutarReabastecimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!insumoParaReabastecer) return;
    if (cantidadReabastecer <= 0) {
      setNotificacion({ tipo: 'error', mensaje: 'La cantidad a ingresar debe ser mayor a 0.' });
      return;
    }

    try {
      setGuardandoReabastecimiento(true);
      const payload: MovimientoInventarioCreate = {
        insumo_id: insumoParaReabastecer.id_insumo,
        tipo_movimiento: 'INGRESO_COMPRA',
        cantidad: Number(cantidadReabastecer),
        referencia: referenciaReabastecer.trim() || undefined,
      };

      await insumosApi.registrarMovimiento(payload);
      setNotificacion({
        tipo: 'success',
        mensaje: `Se reabastecieron ${cantidadReabastecer} ${insumoParaReabastecer.unidad_medida} de "${insumoParaReabastecer.descripcion}" correctamente.`,
      });
      setModalReabastecerAbierto(false);
      cargarAlertas();
    } catch {
      setNotificacion({
        tipo: 'error',
        mensaje: 'Error al registrar el ingreso de inventario en el servidor.',
      });
    } finally {
      setGuardandoReabastecimiento(false);
    }
  };

  // Handlers para Modal Ajuste
  const abrirModalAjuste = (insumo: InsumoResponse) => {
    setInsumoParaAjuste(insumo);
    setStockMinimoAjuste(Number(insumo.stock_minimo) || 0);
    setCostoAjuste(Number(insumo.costo_reposicion) || 0);
    setModalAjusteAbierto(true);
  };

  const handleEjecutarAjuste = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!insumoParaAjuste) return;

    try {
      setGuardandoAjuste(true);
      await insumosApi.actualizar(insumoParaAjuste.id_insumo, {
        stock_minimo: Number(stockMinimoAjuste),
        costo_reposicion: Number(costoAjuste),
      });

      setNotificacion({
        tipo: 'success',
        mensaje: `Parámetros de stock actualizados para "${insumoParaAjuste.descripcion}".`,
      });
      setModalAjusteAbierto(false);
      cargarAlertas();
    } catch {
      setNotificacion({
        tipo: 'error',
        mensaje: 'Error al actualizar los umbrales de stock del insumo.',
      });
    } finally {
      setGuardandoAjuste(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
      {/* 1. Botón de Retorno */}
      {/* <Box sx={{ mb: 2 }}>
        <Button
          component={Link}
          to="/insumos"
          startIcon={<ArrowLeft size={16} />}
          sx={{
            color: '#0284c7',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.85rem',
            p: 0,
            '&:hover': { backgroundColor: 'transparent', color: '#0369a1' },
          }}
        >
          Volver al Catálogo de Insumos
        </Button>
      </Box> */}

      {/* 2. Encabezado Oficial con Botones Pill */}
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
            variant="overline"
            sx={{
              color: '#dc2626',
              fontWeight: 800,
              letterSpacing: '0.12em',
              fontSize: '0.75rem',
              display: 'block',
              mb: 0.5,
            }}
          >
            CONTROL DE INVENTARIO CRÍTICO
          </Typography> */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#1e2b4d',
              letterSpacing: '-0.02em',
              mb: 0.5,
            }}
          >
            Alertas de Stock
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
            Materiales litográficos con saldo en depósito por debajo del nivel mínimo de seguridad.
            {horaActual ? ` · Actualizado ${horaActual}` : ''}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', width: { xs: '100%', sm: 'auto' } }}>
          <Button
            onClick={cargarAlertas}
            disabled={cargando}
            variant="outlined"
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

          {alertas.length > 0 && (
            <Button
              variant="contained"
              startIcon={<Package size={17} />}
              onClick={handleReabastecerCriticoHeader}
              sx={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                fontWeight: 700,
                borderRadius: 50,
                px: 2.8,
                py: 0.9,
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(220, 38, 38, 0.25)',
                '&:hover': { backgroundColor: '#b91c1c' },
              }}
            >
              Reabastecer crítico ({alertas.length})
            </Button>
          )}
        </Stack>
      </Box>

      {/* Alerta de Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 3. Contenedor de la Tabla o Estado Óptimo */}
      {cargando ? (
        <Box
          sx={{
            p: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            backgroundColor: '#ffffff',
            borderRadius: 3.5,
            border: '1px solid #ebe6df',
          }}
        >
          <CircularProgress size={36} sx={{ color: UAGRM_COLORS.blue.main }} />
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
            Consultando niveles de stock en tiempo real...
          </Typography>
        </Box>
      ) : alertas.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            py: 8,
            px: 3,
            textAlign: 'center',
            borderRadius: 3.5,
            border: '1px dashed #cbd5e1',
            backgroundColor: '#ffffff',
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <CheckCircle2 size={32} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e2b4d', mb: 0.5 }}>
            Inventario en Nivel Óptimo
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 460, mx: 'auto', mb: 3 }}>
            Todos los insumos del taller se encuentran actualmente por encima de su umbral mínimo de seguridad.
          </Typography>
          <Button
            component={Link}
            to="/insumos"
            variant="outlined"
            startIcon={<Layers size={16} />}
            sx={{
              borderRadius: 50,
              borderColor: '#e2e8f0',
              color: '#1e2b4d',
              fontWeight: 700,
              textTransform: 'none',
              px: 3,
              py: 0.9,
              '&:hover': { backgroundColor: '#f8fafc', borderColor: '#cbd5e1' },
            }}
          >
            Ver Catálogo de Insumos
          </Button>
        </Paper>
      ) : (
        <Box>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: 3.5,
              border: '1px solid #ebe6df',
              backgroundColor: '#ffffff',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}
          >
            <Table sx={{ minWidth: 850 }}>
              <TableHead sx={{ backgroundColor: '#ffffff' }}>
                <TableRow sx={{ '& th': { borderBottom: '1px solid #f1ece5', py: 2 } }}>
                  <TableCell padding="checkbox" sx={{ pl: 2.5 }}>
                    <Checkbox
                      size="small"
                      checked={alertas.length > 0 && seleccionados.length === alertas.length}
                      indeterminate={seleccionados.length > 0 && seleccionados.length < alertas.length}
                      onChange={handleToggleSelectAll}
                      sx={{ color: '#94a3b8', '&.Mui-checked': { color: '#1e2b4d' } }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Insumo
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Nivel
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', minWidth: 220 }}>
                    Stock vs mínimo
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Déficit
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Costo reposición
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', pr: 3 }}>
                    Acción
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alertas.map((insumo) => {
                  const stockActual = Number(insumo.stock_actual) || 0;
                  const stockMinimo = Number(insumo.stock_minimo) || 0;
                  const deficit = Math.max(0, stockMinimo - stockActual);
                  const costoUnitario = Number(insumo.costo_reposicion) || 0;
                  const costoTotal = deficit * costoUnitario;
                  const porcentaje = stockMinimo > 0 ? Math.min(100, Math.round((stockActual / stockMinimo) * 100)) : 0;
                  const isChecked = seleccionados.includes(insumo.id_insumo);

                  return (
                    <TableRow
                      key={insumo.id_insumo}
                      hover
                      sx={{
                        '&:hover': { backgroundColor: '#faf8f5' },
                        '& td': { borderBottom: '1px solid #f5f2eb', py: 2 },
                        '&:last-child td': { borderBottom: 0 },
                      }}
                    >
                      {/* Checkbox */}
                      <TableCell padding="checkbox" sx={{ pl: 2.5 }}>
                        <Checkbox
                          size="small"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(insumo.id_insumo)}
                          sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#1e2b4d' } }}
                        />
                      </TableCell>

                      {/* Insumo */}
                      <TableCell>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 800,
                              color: '#1a1a1a',
                              fontSize: '0.925rem',
                              lineHeight: 1.25,
                            }}
                          >
                            {insumo.descripcion}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#88847e',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              display: 'block',
                              mt: 0.3,
                            }}
                          >
                            {insumo.categoria?.nombre || 'PAPELES Y CARTULINAS'}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Nivel */}
                      <TableCell>
                        <Box
                          component="span"
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.6,
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            borderRadius: 50,
                            px: 1.5,
                            py: 0.4,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          <AlertTriangle size={13} /> Crítico
                        </Box>
                      </TableCell>

                      {/* Stock vs mínimo */}
                      <TableCell>
                        <Box sx={{ width: '100%', maxWidth: 220 }}>
                          {/* Barra de progreso */}
                          <Box
                            sx={{
                              width: '100%',
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#e2e8f0',
                              overflow: 'hidden',
                              mb: 0.7,
                            }}
                          >
                            <Box
                              sx={{
                                width: `${porcentaje}%`,
                                height: '100%',
                                backgroundColor: '#b91c1c',
                                borderRadius: 4,
                                transition: 'width 0.4s ease',
                              }}
                            />
                          </Box>

                          {/* Subtexto: "5 de 10 Pliego" y "50%" */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.78rem' }}>
                              {stockActual} de {stockMinimo} {insumo.unidad_medida}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.78rem' }}>
                              {porcentaje}%
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Déficit */}
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#b91c1c',
                            fontWeight: 800,
                            fontSize: '0.925rem',
                          }}
                        >
                          -{deficit} {insumo.unidad_medida}
                        </Typography>
                      </TableCell>

                      {/* Costo reposición */}
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#1a1a1a',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                          }}
                        >
                          {formatearMoneda(costoTotal)}
                        </Typography>
                      </TableCell>

                      {/* Acción */}
                      <TableCell align="right" sx={{ pr: 3 }}>
                        <Stack direction="row" spacing={1.2} sx={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                          <Tooltip title="Ajustar Umbrales y Costos">
                            <IconButton
                              size="small"
                              onClick={() => abrirModalAjuste(insumo)}
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                border: '1px solid #dcd8d0',
                                color: '#475569',
                                backgroundColor: '#ffffff',
                                '&:hover': {
                                  backgroundColor: '#f8fafc',
                                  borderColor: '#cbd5e1',
                                  color: '#1e2b4d',
                                },
                              }}
                            >
                              <Sliders size={16} />
                            </IconButton>
                          </Tooltip>

                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => abrirModalReabastecer(insumo)}
                            startIcon={<Package size={15} />}
                            sx={{
                              backgroundColor: '#2563eb',
                              color: '#ffffff',
                              borderRadius: 50,
                              fontWeight: 700,
                              fontSize: '0.825rem',
                              textTransform: 'none',
                              px: 2.2,
                              py: 0.7,
                              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                              '&:hover': {
                                backgroundColor: '#1d4ed8',
                              },
                            }}
                          >
                            Reabastecer
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* 4. Footer de la Vista */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 2.5,
              px: 1,
              gap: 1.5,
            }}
          >
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              Mostrando {alertas.length} de {alertas.length} insumos en alerta
            </Typography>

            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.78rem' }}>
              © 2026 Imprenta Universitaria · UAGRM &nbsp;·&nbsp; Soporte &nbsp;·&nbsp; Manual de uso &nbsp;·&nbsp; v1.0
            </Typography>
          </Box>
        </Box>
      )}

      {/* 3. MODAL POPUP PARA REABASTECIMIENTO RÁPIDO */}
      <Dialog
        open={modalReabastecerAbierto}
        onClose={() => !guardandoReabastecimiento && setModalReabastecerAbierto(false)}
        maxWidth="xs"
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
            Ingreso de Stock
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.875rem' }}>
            Reposición por Déficit Crítico
          </Typography>
          <IconButton
            onClick={() => setModalReabastecerAbierto(false)}
            disabled={guardandoReabastecimiento}
            size="small"
            sx={{ position: 'absolute', right: 16, top: 16, color: '#94a3b8', '&:hover': { color: '#475569' } }}
          >
            <X size={18} />
          </IconButton>
        </DialogTitle>

        {insumoParaReabastecer && (
          <form onSubmit={handleEjecutarReabastecimiento}>
            <DialogContent sx={{ px: 2.5, py: 1.5 }}>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2, fontSize: '0.85rem' }}>
                Registre el ingreso físico al almacén para nivelar el stock de seguridad de <strong>{insumoParaReabastecer.descripcion}</strong>.
              </Typography>

              {/* Tarjeta resumen del insumo */}
              <Box
                sx={{
                  p: 2,
                  mb: 2.5,
                  borderRadius: 2.5,
                  border: `1px solid ${UAGRM_COLORS.border}`,
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Stock Actual
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#b91c1c' }}>
                    {insumoParaReabastecer.stock_actual} {insumoParaReabastecer.unidad_medida}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Mínimo Requerido
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e2b4d' }}>
                    {insumoParaReabastecer.stock_minimo} {insumoParaReabastecer.unidad_medida}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    required
                    autoFocus
                    type="number"
                    size="small"
                    label={`Cantidad a Ingresar (${insumoParaReabastecer.unidad_medida})`}
                    value={cantidadReabastecer}
                    onChange={(e) => setCantidadReabastecer(Number(e.target.value))}
                    slotProps={{
                      htmlInput: { min: 1, step: 'any' },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Glosa / Motivo de Reposición"
                    value={referenciaReabastecer}
                    onChange={(e) => setReferenciaReabastecer(e.target.value)}
                  />
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, pt: 2, borderTop: `1px solid ${UAGRM_COLORS.border}`, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2.5 }}>
              <Button
                onClick={() => setModalReabastecerAbierto(false)}
                disabled={guardandoReabastecimiento}
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
                variant="contained"
                disabled={guardandoReabastecimiento}
                endIcon={guardandoReabastecimiento ? <CircularProgress size={16} color="inherit" /> : <PackagePlus size={18} />}
                sx={{
                  backgroundColor: '#1e2b4d',
                  color: '#ffffff',
                  fontWeight: 700,
                  px: 3.5,
                  py: 1.1,
                  borderRadius: 50,
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
                {guardandoReabastecimiento ? 'Confirmando...' : 'Confirmar'}
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>

      {/* 4. MODAL POPUP PARA AJUSTE DE PARÁMETROS DE STOCK */}
      <Dialog
        open={modalAjusteAbierto}
        onClose={() => !guardandoAjuste && setModalAjusteAbierto(false)}
        maxWidth="xs"
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
            Ajustar Umbrales
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.875rem' }}>
            Parámetros de Seguridad de Inventario
          </Typography>
          <IconButton
            onClick={() => setModalAjusteAbierto(false)}
            disabled={guardandoAjuste}
            size="small"
            sx={{ position: 'absolute', right: 16, top: 16, color: '#94a3b8', '&:hover': { color: '#475569' } }}
          >
            <X size={18} />
          </IconButton>
        </DialogTitle>

        {insumoParaAjuste && (
          <form onSubmit={handleEjecutarAjuste}>
            <DialogContent sx={{ px: 2.5, py: 1.5 }}>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2.5, fontSize: '0.85rem' }}>
                Ajuste el umbral mínimo para disparar alertas o actualice el costo unitario de reposición para <strong>{insumoParaAjuste.descripcion}</strong>.
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    required
                    type="number"
                    size="small"
                    label={`Stock Mínimo de Seguridad (${insumoParaAjuste.unidad_medida})`}
                    value={stockMinimoAjuste}
                    onChange={(e) => setStockMinimoAjuste(Number(e.target.value))}
                    slotProps={{
                      htmlInput: { min: 0, step: 'any' },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    type="number"
                    size="small"
                    label="Costo de Reposición (Bs.)"
                    value={costoAjuste}
                    onChange={(e) => setCostoAjuste(Number(e.target.value))}
                    slotProps={{
                      htmlInput: { min: 0, step: '0.01' },
                    }}
                  />
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, pt: 2, borderTop: `1px solid ${UAGRM_COLORS.border}`, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2.5 }}>
              <Button
                onClick={() => setModalAjusteAbierto(false)}
                disabled={guardandoAjuste}
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
                variant="contained"
                disabled={guardandoAjuste}
                endIcon={guardandoAjuste ? <CircularProgress size={16} color="inherit" /> : <Check size={18} />}
                sx={{
                  backgroundColor: '#1e2b4d',
                  color: '#ffffff',
                  fontWeight: 700,
                  px: 3.5,
                  py: 1.1,
                  borderRadius: 50,
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
                {guardandoAjuste ? 'Confirmando...' : 'Confirmar'}
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>

      {/* Snackbar de notificaciones */}
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
