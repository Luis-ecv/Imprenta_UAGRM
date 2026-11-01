import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
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
  RefreshCw,
  Layers,
  CheckCircle2,
  PackagePlus,
  Sliders,
  Package,
} from 'lucide-react';

import { insumosApi } from '@/api/insumos.api';
import { Button, Badge, Modal } from '@/components/ui';
import { UAGRM_TOKENS } from '@/theme/tokens';
import type { InsumoResponse, MovimientoInventarioCreate } from '@/types';
import { formatearMoneda } from '@/utils/formatters';

export function StockAlertasPage() {
  const [alertas, setAlertas] = useState<InsumoResponse[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [horaActual, setHoraActual] = useState<string>('');
  const [seleccionados, setSeleccionados] = useState<number[]>([]);

  // Modal 1: Reabastecimiento rápido
  const [modalReabastecerAbierto, setModalReabastecerAbierto] = useState<boolean>(false);
  const [insumoParaReabastecer, setInsumoParaReabastecer] = useState<InsumoResponse | null>(null);
  const [cantidadReabastecer, setCantidadReabastecer] = useState<number>(10);
  const [referenciaReabastecer, setReferenciaReabastecer] = useState<string>('Reposición por stock de seguridad');
  const [guardandoReabastecimiento, setGuardandoReabastecimiento] = useState<boolean>(false);

  // Modal 2: Ajuste de parámetros de stock
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
    <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 }, backgroundColor: UAGRM_TOKENS.background.default, minHeight: '100%' }}>
      {/* 1. Encabezado */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3.5,
        }}
      >
        <Box>
          <Typography
            variant="overline"
            sx={{
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: UAGRM_TOKENS.colors.ruby,
              display: 'block',
              lineHeight: 1.2,
            }}
          >
            Control de Inventario Crítico
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 780,
              color: UAGRM_TOKENS.colors.primaryDark,
              letterSpacing: '-0.02em',
              mb: 0.5,
            }}
          >
            Alertas de Stock
          </Typography>
          <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate }}>
            Materiales litográficos con saldo en taller por debajo del nivel mínimo de seguridad.
            {horaActual ? ` · Actualizado ${horaActual}` : ''}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', width: { xs: '100%', sm: 'auto' } }}>
          <Button
            onClick={cargarAlertas}
            disabled={cargando}
            variant="outline"
            icon={<RefreshCw size={16} className={cargando ? 'animate-spin' : ''} />}
          >
            Actualizar
          </Button>

          {alertas.length > 0 && (
            <Button
              variant="default"
              icon={<Package size={17} />}
              onClick={handleReabastecerCriticoHeader}
              style={{
                backgroundColor: UAGRM_TOKENS.colors.ruby,
                boxShadow: UAGRM_TOKENS.shadows.buttonSecondary,
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

      {/* 2. Contenedor de la Tabla o Estado Óptimo */}
      {cargando ? (
        <Box
          sx={{
            p: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            backgroundColor: UAGRM_TOKENS.colors.background.paper,
            borderRadius: 3.5,
            border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
          }}
        >
          <CircularProgress size={36} sx={{ color: UAGRM_TOKENS.colors.royalBlue }} />
          <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, fontWeight: 600 }}>
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
            border: `1px dashed ${UAGRM_TOKENS.border.focus}`,
            backgroundColor: UAGRM_TOKENS.colors.background.paper,
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: UAGRM_TOKENS.colors.status.success.light,
              color: UAGRM_TOKENS.colors.status.success.dark,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <CheckCircle2 size={32} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primaryDark, mb: 0.5 }}>
            Inventario en Nivel Óptimo
          </Typography>
          <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, maxWidth: 460, mx: 'auto', mb: 3 }}>
            Todos los insumos del taller se encuentran actualmente por encima de su umbral mínimo de seguridad.
          </Typography>
          <Button
            component={Link}
            to="/insumos"
            variant="outline"
            icon={<Layers size={16} />}
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
              border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
              backgroundColor: UAGRM_TOKENS.colors.background.paper,
              overflow: 'hidden',
              boxShadow: UAGRM_TOKENS.shadows.card,
            }}
          >
            <Table sx={{ minWidth: 850 }}>
              <TableHead sx={{ backgroundColor: UAGRM_TOKENS.colors.table.headerBg }}>
                <TableRow sx={{ '& th': { borderBottom: `1px solid ${UAGRM_TOKENS.border.subtle}`, py: 2 } }}>
                  <TableCell padding="checkbox" sx={{ pl: 2.5 }}>
                    <Checkbox
                      size="small"
                      checked={alertas.length > 0 && seleccionados.length === alertas.length}
                      indeterminate={seleccionados.length > 0 && seleccionados.length < alertas.length}
                      onChange={handleToggleSelectAll}
                      sx={{ color: UAGRM_TOKENS.colors.mutedSlate, '&.Mui-checked': { color: UAGRM_TOKENS.colors.primaryDark } }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.table.headerText, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Insumo
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.table.headerText, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Nivel
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.table.headerText, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', minWidth: 220 }}>
                    Stock vs Mínimo
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.table.headerText, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Déficit
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.table.headerText, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Costo Reposición
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.table.headerText, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', pr: 3 }}>
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
                        '&:hover': { backgroundColor: UAGRM_TOKENS.colors.table.rowHover },
                        '& td': { borderBottom: `1px solid ${UAGRM_TOKENS.border.subtle}`, py: 2 },
                        '&:last-child td': { borderBottom: 0 },
                      }}
                    >
                      {/* Checkbox */}
                      <TableCell padding="checkbox" sx={{ pl: 2.5 }}>
                        <Checkbox
                          size="small"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(insumo.id_insumo)}
                          sx={{ color: UAGRM_TOKENS.colors.mutedSlate, '&.Mui-checked': { color: UAGRM_TOKENS.colors.primaryDark } }}
                        />
                      </TableCell>

                      {/* Insumo */}
                      <TableCell>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 800,
                              color: UAGRM_TOKENS.colors.charcoal,
                              fontSize: '0.925rem',
                              lineHeight: 1.25,
                            }}
                          >
                            {insumo.descripcion}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: UAGRM_TOKENS.colors.slate,
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              display: 'block',
                              mt: 0.3,
                            }}
                          >
                            {insumo.categoria?.nombre || 'General'}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Nivel (Badge centralizado) */}
                      <TableCell>
                        <Badge variant="error" dot>
                          Crítico
                        </Badge>
                      </TableCell>

                      {/* Stock vs mínimo */}
                      <TableCell>
                        <Box sx={{ width: '100%', maxWidth: 220 }}>
                          <Box
                            sx={{
                              width: '100%',
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: UAGRM_TOKENS.border.subtle,
                              overflow: 'hidden',
                              mb: 0.7,
                            }}
                          >
                            <Box
                              sx={{
                                width: `${porcentaje}%`,
                                height: '100%',
                                backgroundColor: UAGRM_TOKENS.colors.ruby,
                                borderRadius: 4,
                                transition: 'width 0.4s ease',
                              }}
                            />
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.slate, fontWeight: 600, fontSize: '0.78rem' }}>
                              {stockActual} de {stockMinimo} {insumo.unidad_medida}
                            </Typography>
                            <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.slate, fontWeight: 700, fontSize: '0.78rem' }}>
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
                            color: UAGRM_TOKENS.colors.ruby,
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
                            color: UAGRM_TOKENS.colors.charcoal,
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
                                borderRadius: 2,
                                border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
                                color: UAGRM_TOKENS.colors.slate,
                                backgroundColor: UAGRM_TOKENS.colors.background.paper,
                                '&:hover': {
                                  backgroundColor: UAGRM_TOKENS.colors.background.subtle,
                                  color: UAGRM_TOKENS.colors.primaryDark,
                                },
                              }}
                            >
                              <Sliders size={16} />
                            </IconButton>
                          </Tooltip>

                          <Button
                            variant="default"
                            size="small"
                            onClick={() => abrirModalReabastecer(insumo)}
                            icon={<Package size={15} />}
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
        </Box>
      )}

      {/* MODAL PARA REABASTECIMIENTO RÁPIDO (Construido sobre <Modal />) */}
      <Modal
        isOpen={modalReabastecerAbierto}
        onClose={() => setModalReabastecerAbierto(false)}
        title="Ingreso de Stock"
        subtitle="Reposición por Déficit Crítico"
        maxWidth="xs"
        onSubmit={handleEjecutarReabastecimiento}
        isLoading={guardandoReabastecimiento}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              disabled={guardandoReabastecimiento}
              onClick={() => setModalReabastecerAbierto(false)}
              style={{ minWidth: 125 }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              isLoading={guardandoReabastecimiento}
              icon={<PackagePlus size={18} />}
              style={{ minWidth: 165 }}
            >
              Confirmar
            </Button>
          </>
        }
      >
        {insumoParaReabastecer && (
          <Box>
            <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, mb: 2, fontSize: '0.85rem' }}>
              Registre el ingreso físico al almacén para nivelar el stock de seguridad de <strong>{insumoParaReabastecer.descripcion}</strong>.
            </Typography>

            <Box
              sx={{
                p: 2,
                mb: 2.5,
                borderRadius: 2.5,
                border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
                backgroundColor: UAGRM_TOKENS.colors.background.subtle,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: UAGRM_TOKENS.colors.slate, textTransform: 'uppercase' }}>
                  Stock Actual
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.ruby }}>
                  {insumoParaReabastecer.stock_actual} {insumoParaReabastecer.unidad_medida}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: UAGRM_TOKENS.colors.slate, textTransform: 'uppercase' }}>
                  Mínimo Requerido
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primaryDark }}>
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
          </Box>
        )}
      </Modal>

      {/* MODAL PARA AJUSTE DE PARÁMETROS DE STOCK (Construido sobre <Modal />) */}
      <Modal
        isOpen={modalAjusteAbierto}
        onClose={() => setModalAjusteAbierto(false)}
        title="Ajustar Umbrales"
        subtitle="Parámetros de Seguridad de Inventario"
        maxWidth="xs"
        onSubmit={handleEjecutarAjuste}
        isLoading={guardandoAjuste}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              disabled={guardandoAjuste}
              onClick={() => setModalAjusteAbierto(false)}
              style={{ minWidth: 125 }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              isLoading={guardandoAjuste}
              style={{ minWidth: 165 }}
            >
              Confirmar
            </Button>
          </>
        }
      >
        {insumoParaAjuste && (
          <Box>
            <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, mb: 2.5, fontSize: '0.85rem' }}>
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
          </Box>
        )}
      </Modal>

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
