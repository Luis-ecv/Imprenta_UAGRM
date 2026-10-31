import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
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
import {
  ArrowLeft,
  Check,
  Printer,
  XCircle,
  HelpCircle,
  Truck,
  Package,
  Calendar,
  Building,
  ArrowRight,
} from 'lucide-react';

import { comprasApi } from '@/api/compras.api';
import type { OrdenCompraResponse } from '@/types';
import { formatearMoneda, formatearFecha } from '@/utils/formatters';

const PASOS = [
  { clave: 'SUGERIDA', numero: 1, etiqueta: 'Sugerida' },
  { clave: 'APROBADA', numero: 2, etiqueta: 'Aprobada' },
  { clave: 'ENVIADA', numero: 3, etiqueta: 'Enviada' },
  { clave: 'RECIBIDA', numero: 4, etiqueta: 'Recibida' },
];

export function CompraDetallePage() {
  const { id } = useParams<{ id: string }>();
  const [compra, setCompra] = useState<OrdenCompraResponse | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Pestañas inferiores: Resumen | Qué se compra | Avance
  const [tabActiva, setTabActiva] = useState<'resumen' | 'detalle' | 'avance'>('resumen');

  // Modales de Acción
  const [modalCancelarAbierto, setModalCancelarAbierto] = useState<boolean>(false);
  const [procesando, setProcesando] = useState<boolean>(false);

  const cargarCompra = useCallback(async () => {
    if (!id) return;
    try {
      setCargando(true);
      setError(null);
      const data = await comprasApi.obtener(Number(id));
      setCompra(data);
    } catch {
      setError('No se pudo cargar la información de la orden de compra seleccionada.');
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    cargarCompra();
  }, [cargarCompra]);

  const handleCambiarEstado = async (nuevoEstado: string, mensaje: string) => {
    if (!compra) return;
    try {
      setProcesando(true);
      await comprasApi.cambiarEstado(compra.id_orden_compra, nuevoEstado);
      setMensajeExito(mensaje);
      cargarCompra();
    } catch {
      setError('Ocurrió un error al actualizar el estado de la compra en el servidor.');
    } finally {
      setProcesando(false);
    }
  };

  const handleCancelarOrden = async () => {
    if (!compra) return;
    try {
      setProcesando(true);
      await comprasApi.cambiarEstado(compra.id_orden_compra, 'CANCELADA');
      setMensajeExito('La orden de compra ha sido cancelada.');
      setModalCancelarAbierto(false);
      cargarCompra();
    } catch {
      setError('Ocurrió un error al cancelar la orden de compra.');
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) {
    return (
      <Box sx={{ p: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={36} sx={{ color: '#1e2b4d' }} />
        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
          Cargando orden de compra...
        </Typography>
      </Box>
    );
  }

  if (error || !compra) {
    return (
      <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'No se encontró la orden de compra especificada.'}
        </Alert>
        <Button
          component={Link}
          to="/compras"
          startIcon={<ArrowLeft size={16} />}
          variant="outlined"
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 50 }}
        >
          Volver a órdenes de compra
        </Button>
      </Box>
    );
  }

  const estadoActual = (compra.estado || 'SUGERIDA').toUpperCase();
  const proveedor = compra.proveedor;
  const esCancelada = estadoActual === 'CANCELADA';

  // Índice del paso actual (1..4)
  const indicePasoActual =
    estadoActual === 'RECIBIDA'
      ? 4
      : estadoActual === 'ENVIADA'
      ? 3
      : estadoActual === 'APROBADA'
      ? 2
      : 1;

  // Datos de la insignia de estado superior derecha
  const getBadgeEstadoInfo = () => {
    switch (estadoActual) {
      case 'RECIBIDA':
        return {
          label: 'Recibida en almacén',
          bg: '#ecfdf5',
          border: '#a7f3d0',
          color: '#065f46',
        };
      case 'ENVIADA':
        return {
          label: 'Enviada al proveedor',
          bg: '#eff6ff',
          border: '#bfdbfe',
          color: '#1d4ed8',
        };
      case 'APROBADA':
        return {
          label: 'Aprobada por taller',
          bg: '#f0fdf4',
          border: '#bbf7d0',
          color: '#15803d',
        };
      case 'CANCELADA':
        return {
          label: 'Orden cancelada',
          bg: '#fef2f2',
          border: '#fecaca',
          color: '#991b1b',
        };
      default:
        return {
          label: 'Pendiente de aprobación',
          bg: '#fffbeb',
          border: '#fde68a',
          color: '#b45309',
        };
    }
  };

  const badgeInfo = getBadgeEstadoInfo();

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 }, maxWidth: 1240, mx: 'auto' }}>
      {/* 1. Botón superior de retorno */}
      {/* <Box sx={{ mb: 2.5 }}>
        <Button
          component={Link}
          to="/compras"
          startIcon={<ArrowLeft size={16} />}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            color: '#475569',
            fontSize: '0.88rem',
            p: 0,
            '&:hover': { color: '#000000', backgroundColor: 'transparent' },
          }}
        >
          Volver a órdenes de compra
        </Button>
      </Box> */}

      {/* 2. Mensaje de Éxito / Feedback */}
      {mensajeExito && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setMensajeExito(null)}>
          {mensajeExito}
        </Alert>
      )}

      {/* 3. Cuadrícula Principal: 2 Columnas (Diseño idéntico a la imagen) */}
      <Grid container spacing={3}>
        {/* =========================================================
            COLUMNA IZQUIERDA: Detalle Técnico, Stepper y Pestañas
            ========================================================= */}
        <Grid size={{ xs: 12, md: 7.5, lg: 8 }}>
          <Stack spacing={3}>
            {/* Tarjeta 1: Encabezado con Stepper de 4 Pasos */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: '1px solid #e8e4dc',
                backgroundColor: '#ffffff',
                p: { xs: 2.5, sm: 3.5 },
                boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: '#64748b',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  display: 'block',
                  mb: 0.5,
                }}
              >
                ORDEN DE COMPRA
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: '#000000',
                  letterSpacing: '-0.02em',
                  mb: 1,
                  fontSize: { xs: '1.8rem', sm: '2.2rem' },
                }}
              >
                #OC-{compra.id_orden_compra}
              </Typography>

              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.90rem', mb: 3.5 }}>
                Registrada el {formatearFecha(compra.fecha_generacion)} para abastecer el taller litográfico.
              </Typography>

              {/* Stepper Horizontal Limpio */}
              <Box sx={{ position: 'relative', px: { xs: 1, sm: 2 } }}>
                {/* Línea conectora horizontal de fondo */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 15,
                    left: '12%',
                    right: '12%',
                    height: 2,
                    backgroundColor: '#e2e8f0',
                    zIndex: 0,
                  }}
                />

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {PASOS.map((paso) => {
                    const esCompletado = indicePasoActual > paso.numero && !esCancelada;
                    const esActivo = indicePasoActual === paso.numero && !esCancelada;

                    return (
                      <Box
                        key={paso.clave}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        {/* Círculo del número / Check */}
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            backgroundColor: esActivo
                              ? '#000000'
                              : esCompletado
                              ? '#0f172a'
                              : '#ffffff',
                            color: esActivo || esCompletado ? '#ffffff' : '#94a3b8',
                            border: esActivo || esCompletado ? 'none' : '2px solid #e2e8f0',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {esCompletado ? <Check size={16} strokeWidth={3} /> : paso.numero}
                        </Box>

                        {/* Etiqueta del Paso */}
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: esActivo ? 800 : 600,
                            color: esActivo ? '#000000' : '#64748b',
                            fontSize: '0.82rem',
                          }}
                        >
                          {paso.etiqueta}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Card>

            {/* Tarjeta 2: Pestañas de Detalle (Resumen | Qué se compra | Avance) */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: '1px solid #e8e4dc',
                backgroundColor: '#ffffff',
                p: { xs: 2.5, sm: 3.5 },
                boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
              }}
            >
              {/* Navegación por Pestañas con Subrayado Negro (Estándar UAGRM) */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3.5,
                  borderBottom: '1px solid #e8e4dc',
                  pb: 0,
                  mb: 3,
                }}
              >
                {[
                  { key: 'resumen', label: 'Resumen' },
                  { key: 'detalle', label: 'Qué se compra' },
                  { key: 'avance', label: 'Avance' },
                ].map((tab) => {
                  const isActive = tabActiva === tab.key;
                  return (
                    <Box
                      key={tab.key}
                      component="button"
                      onClick={() => setTabActiva(tab.key as 'resumen' | 'detalle' | 'avance')}
                      sx={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        pb: 1.2,
                        px: 0.5,
                        position: 'relative',
                        fontFamily: 'inherit',
                        fontSize: '0.95rem',
                        fontWeight: isActive ? 800 : 500,
                        color: isActive ? '#000000' : '#64748b',
                        transition: 'all 0.15s ease',
                        '&:hover': { color: '#000000' },
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
                      {tab.label}
                    </Box>
                  );
                })}
              </Box>

              {/* CONTENIDO PESTAÑA: RESUMEN (Idéntico a la imagen) */}
              {tabActiva === 'resumen' && (
                <Grid container spacing={3}>
                  {/* Sub-bloque Proveedor */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Building size={16} color="#64748b" />
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 800,
                            color: '#64748b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          PROVEEDOR
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                        {/* Avatar Iniciales P1/P2 */}
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '12px',
                            backgroundColor: '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            color: '#1e293b',
                            flexShrink: 0,
                          }}
                        >
                          P{compra.proveedor_id}
                        </Box>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 800, color: '#000000', lineHeight: 1.2 }}>
                            {proveedor?.razon_social || `Proveedor #${compra.proveedor_id}`}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            Proveedor autorizado {proveedor?.nit ? `• NIT: ${proveedor.nit}` : ''}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Cuadro de Contacto o "Sin datos de contacto registrados" */}
                      <Box
                        sx={{
                          p: 1.4,
                          borderRadius: '10px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #f1f5f9',
                          mt: 1,
                        }}
                      >
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                          {proveedor?.contacto
                            ? `Contacto: ${proveedor.contacto}${proveedor.telefono ? ` · Tel: ${proveedor.telefono}` : ''}`
                            : 'Sin datos de contacto registrados'}
                        </Typography>
                      </Box>

                      <Box sx={{ pt: 0.5 }}>
                        <Button
                          component={Link}
                          to="/proveedores"
                          endIcon={<ArrowRight size={14} />}
                          sx={{
                            p: 0,
                            textTransform: 'none',
                            fontWeight: 700,
                            color: '#0284c7',
                            fontSize: '0.85rem',
                            '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
                          }}
                        >
                          Ver ficha del proveedor
                        </Button>
                      </Box>
                    </Stack>
                  </Grid>

                  {/* Sub-bloque Fechas y Entrega */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Calendar size={16} color="#64748b" />
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 800,
                            color: '#64748b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          FECHAS Y ENTREGA
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.3 }}>
                          Fecha de emisión
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#000000' }}>
                          {formatearFecha(compra.fecha_generacion)}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.3 }}>
                          Motivo de la compra
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#000000' }}>
                          {compra.prediccion_id
                            ? `Sugerido por Modelo de Machine Learning (Inferencia #ML-${compra.prediccion_id})`
                            : 'Reposición manual de inventario'}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.3 }}>
                          Entregar en
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#000000', lineHeight: 1.3 }}>
                          Almacén Central de Papelería e Insumos
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          Imprenta Universitaria UAGRM • Ciudad Universitaria
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              )}

              {/* CONTENIDO PESTAÑA: QUÉ SE COMPRA */}
              {tabActiva === 'detalle' && (
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{ borderRadius: 3, border: '1px solid #ebe6df', backgroundColor: '#ffffff' }}
                >
                  <Table>
                    <TableHead sx={{ backgroundColor: '#faf8f5' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                          Concepto de Suministro
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                          Destino
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                          Monto Estimado
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow hover sx={{ '& td': { borderBottom: '1px solid #f0ede6', py: 2 } }}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#000000' }}>
                            Lote de Insumos Litográficos para Producción
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            Reposición aprobada para taller de impresión
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#000000' }}>
                            Almacén Litográfico UAGRM
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" sx={{ fontWeight: 800, color: '#000000' }}>
                            {formatearMoneda(compra.total_estimado)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* CONTENIDO PESTAÑA: AVANCE */}
              {tabActiva === 'avance' && (
                <Stack spacing={2}>
                  <Box sx={{ p: 2, borderRadius: 2.5, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000000' }}>
                      Historial de Estado
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                      Estado actual: <strong>{estadoActual}</strong> registrado el {formatearFecha(compra.fecha_generacion)}.
                    </Typography>
                  </Box>
                </Stack>
              )}
            </Card>
          </Stack>
        </Grid>

        {/* =========================================================
            COLUMNA DERECHA: Panel de Acción y Total Estimado
            ========================================================= */}
        <Grid size={{ xs: 12, md: 4.5, lg: 4 }}>
          <Stack spacing={3}>
            {/* Tarjeta de Acción */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: '1px solid #e8e4dc',
                backgroundColor: '#ffffff',
                p: { xs: 2.5, sm: 3.5 },
                boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
              }}
            >
              {/* Badge de Estado Superior */}
              <Box sx={{ mb: 2 }}>
                <Box
                  component="span"
                  sx={{
                    display: 'inline-block',
                    px: 1.8,
                    py: 0.5,
                    borderRadius: 50,
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    backgroundColor: badgeInfo.bg,
                    border: `1px solid ${badgeInfo.border}`,
                    color: badgeInfo.color,
                  }}
                >
                  {badgeInfo.label}
                </Box>
              </Box>

              {/* Total Estimado */}
              <Typography
                variant="caption"
                sx={{
                  color: '#64748b',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  display: 'block',
                }}
              >
                TOTAL ESTIMADO
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: '#000000',
                  letterSpacing: '-0.02em',
                  mt: 0.5,
                  mb: 3,
                  fontSize: { xs: '1.8rem', sm: '2.1rem' },
                }}
              >
                {formatearMoneda(compra.total_estimado)}
              </Typography>

              {/* Botones de Acción Apilados (Estilo Píldora del Mockup) */}
              <Stack spacing={1.5}>
                {/* 1. Botón Principal: Aprobar Orden (si está SUGERIDA) */}
                {estadoActual === 'SUGERIDA' && (
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={procesando}
                    onClick={() => handleCambiarEstado('APROBADA', 'Orden de compra aprobada exitosamente.')}
                    startIcon={procesando ? <CircularProgress size={16} color="inherit" /> : <Check size={16} />}
                    sx={{
                      borderRadius: 50,
                      textTransform: 'none',
                      fontWeight: 800,
                      py: 1.2,
                      backgroundColor: '#111827',
                      color: '#ffffff',
                      boxShadow: 'none',
                      '&:hover': { backgroundColor: '#000000' },
                    }}
                  >
                    Aprobar orden
                  </Button>
                )}

                {/* 1.1 Si está APROBADA: Botón Enviar a Proveedor */}
                {estadoActual === 'APROBADA' && (
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={procesando}
                    onClick={() => handleCambiarEstado('ENVIADA', 'Orden enviada formalmente al proveedor.')}
                    startIcon={procesando ? <CircularProgress size={16} color="inherit" /> : <Truck size={16} />}
                    sx={{
                      borderRadius: 50,
                      textTransform: 'none',
                      fontWeight: 800,
                      py: 1.2,
                      backgroundColor: '#111827',
                      color: '#ffffff',
                      boxShadow: 'none',
                      '&:hover': { backgroundColor: '#000000' },
                    }}
                  >
                    Enviar a proveedor
                  </Button>
                )}

                {/* 2. Botón Recibir en Almacén (Activo cuando está ENVIADA o APROBADA) */}
                {estadoActual !== 'RECIBIDA' && estadoActual !== 'CANCELADA' && (
                  <Button
                    variant="outlined"
                    fullWidth
                    disabled={procesando || estadoActual === 'SUGERIDA'}
                    onClick={() => handleCambiarEstado('RECIBIDA', 'Mercadería recibida e ingresada al almacén.')}
                    startIcon={<Package size={16} />}
                    sx={{
                      borderRadius: 50,
                      textTransform: 'none',
                      fontWeight: 700,
                      py: 1.1,
                      color: estadoActual === 'ENVIADA' ? '#047857' : '#94a3b8',
                      borderColor: estadoActual === 'ENVIADA' ? '#a7f3d0' : '#e2e8f0',
                      backgroundColor: estadoActual === 'ENVIADA' ? '#ecfdf5' : '#ffffff',
                      '&:hover': {
                        backgroundColor: '#f1f5f9',
                        borderColor: '#cbd5e1',
                      },
                    }}
                  >
                    Recibir en almacén
                  </Button>
                )}

                {/* 3. Botón Imprimir */}
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => window.print()}
                  startIcon={<Printer size={16} />}
                  sx={{
                    borderRadius: 50,
                    textTransform: 'none',
                    fontWeight: 700,
                    py: 1.1,
                    color: '#0f172a',
                    borderColor: '#e2e8f0',
                    backgroundColor: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#f8fafc',
                      borderColor: '#cbd5e1',
                    },
                  }}
                >
                  Imprimir
                </Button>

                {/* 4. Cancelar Orden dentro de un botón como los otros */}
                {!esCancelada && estadoActual !== 'RECIBIDA' && (
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setModalCancelarAbierto(true)}
                    startIcon={<XCircle size={16} />}
                    sx={{
                      borderRadius: 50,
                      textTransform: 'none',
                      fontWeight: 700,
                      py: 1.1,
                      color: '#dc2626',
                      borderColor: '#fecaca',
                      backgroundColor: '#ffffff',
                      '&:hover': {
                        backgroundColor: '#fef2f2',
                        borderColor: '#f87171',
                      },
                    }}
                  >
                    Cancelar orden
                  </Button>
                )}
              </Stack>
            </Card>

            {/* Caja Informativa «¿Qué sigue?» (Idéntica al Mockup) */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: '1px solid #e0f2fe',
                backgroundColor: '#f0f9ff',
                p: { xs: 2.5, sm: 3 },
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
                  <HelpCircle size={18} color="#0284c7" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0369a1' }}>
                    ¿Qué sigue?
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ color: '#0369a1', fontSize: '0.86rem', lineHeight: 1.5 }}>
                  {estadoActual === 'SUGERIDA' &&
                    'Revisa los datos de la orden y apruébala. Después se podrá enviar al proveedor. «Recibir en almacén» se activa cuando la mercadería ya fue enviada y llega a la imprenta.'}
                  {estadoActual === 'APROBADA' &&
                    'La orden de compra ha sido aprobada formalmente. Ahora puedes emitirla y enviarla al proveedor litográfico para programar el despacho.'}
                  {estadoActual === 'ENVIADA' &&
                    'El pedido está en camino. Cuando los suministros lleguen a los almacenes de la Ciudad Universitaria, presiona «Recibir en almacén».'}
                  {estadoActual === 'RECIBIDA' &&
                    'Esta orden de compra ya fue recepcionada con éxito y los materiales se encuentran registrados en el inventario activo de la imprenta.'}
                  {estadoActual === 'CANCELADA' &&
                    'Esta orden fue cancelada y no generará movimientos de almacén ni compromisos presupuestarios.'}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* DIÁLOGO MODAL: CONFIRMAR CANCELACIÓN */}
      <Dialog
        open={modalCancelarAbierto}
        onClose={() => !procesando && setModalCancelarAbierto(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#991b1b', pb: 1 }}>
          Cancelar Orden de Compra
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#475569' }}>
            ¿Está seguro de que desea cancelar la <strong>Orden de Compra #OC-{compra.id_orden_compra}</strong>? Esta acción actualizará el estado a CANCELADA en el servidor.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setModalCancelarAbierto(false)}
            disabled={procesando}
            sx={{ textTransform: 'none', fontWeight: 700, color: '#64748b' }}
          >
            Atrás
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelarOrden}
            disabled={procesando}
            startIcon={procesando ? <CircularProgress size={16} color="inherit" /> : <XCircle size={16} />}
            sx={{
              borderRadius: 50,
              textTransform: 'none',
              fontWeight: 700,
            }}
          >
            {procesando ? 'Cancelando...' : 'Sí, Cancelar Orden'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
