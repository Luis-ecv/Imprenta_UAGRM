import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
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
import { Button, Badge, Modal } from '@/components/ui';
import { UAGRM_TOKENS } from '@/theme/tokens';
import type { OrdenCompraResponse } from '@/types';
import { formatearMoneda, formatearFecha } from '@/utils/formatters';
import { CompraPreviewModal } from './components';
import { generarHtmlOrdenCompra } from '@/utils/documentoCompraHtml';

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

  const [tabActiva, setTabActiva] = useState<'resumen' | 'detalle' | 'avance'>('resumen');
  const [modalCancelarAbierto, setModalCancelarAbierto] = useState<boolean>(false);
  const [modalImprimirAbierto, setModalImprimirAbierto] = useState<boolean>(false);
  const [htmlImpresion, setHtmlImpresion] = useState<string>('');
  const [procesando, setProcesando] = useState<boolean>(false);

  const handleAbrirImpresion = () => {
    if (!compra) return;
    const html = generarHtmlOrdenCompra(compra, compra.proveedor);
    setHtmlImpresion(html);
    setModalImprimirAbierto(true);
  };

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
        <CircularProgress size={36} sx={{ color: UAGRM_TOKENS.colors.primaryDark }} />
        <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, fontWeight: 600 }}>
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
          icon={<ArrowLeft size={16} />}
          variant="outline"
        >
          Volver a órdenes de compra
        </Button>
      </Box>
    );
  }

  const estadoActual = (compra.estado || 'SUGERIDA').toUpperCase();
  const proveedor = compra.proveedor;
  const esCancelada = estadoActual === 'CANCELADA';

  const indicePasoActual =
    estadoActual === 'RECIBIDA'
      ? 4
      : estadoActual === 'ENVIADA'
      ? 3
      : estadoActual === 'APROBADA'
      ? 2
      : 1;

  const getBadgeVariant = (st: string) => {
    switch (st) {
      case 'RECIBIDA':
        return 'success';
      case 'ENVIADA':
        return 'primary';
      case 'APROBADA':
        return 'info';
      case 'CANCELADA':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 }, maxWidth: 1240, mx: 'auto' }}>
      <Button
        variant="ghost"
        component={Link}
        to="/compras"
        icon={<ArrowLeft size={16} />}
        style={{ marginBottom: 16 }}
      >
        Volver a órdenes de compra
      </Button>

      {mensajeExito && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setMensajeExito(null)}>
          {mensajeExito}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Columna Izquierda: Detalle Técnico y Stepper */}
        <Grid size={{ xs: 12, md: 7.5, lg: 8 }}>
          <Stack spacing={3}>
            {/* Tarjeta 1: Stepper de 4 Pasos */}
            <Card
              elevation={0}
              sx={{
                borderRadius: `${UAGRM_TOKENS.radii.xl}px`,
                border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
                backgroundColor: UAGRM_TOKENS.colors.background.paper,
                p: { xs: 2.5, sm: 3.5 },
                boxShadow: UAGRM_TOKENS.shadows.card,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: UAGRM_TOKENS.colors.slate,
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  display: 'block',
                  mb: 0.5,
                }}
              >
                ORDEN DE COMPRA LITOGRÁFICA
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: UAGRM_TOKENS.colors.charcoal,
                  letterSpacing: '-0.02em',
                  mb: 1,
                  fontSize: { xs: '1.8rem', sm: '2.2rem' },
                }}
              >
                {`#OC-${String(compra.id_orden_compra).padStart(4, '0')}`}
              </Typography>

              <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.90rem', mb: 3.5 }}>
                Registrada el {formatearFecha(compra.fecha_generacion)} para abastecer el taller litográfico.
              </Typography>

              {/* Stepper Horizontal */}
              <Box sx={{ position: 'relative', px: { xs: 1, sm: 2 } }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 15,
                    left: '12%',
                    right: '12%',
                    height: 2,
                    backgroundColor: UAGRM_TOKENS.border.subtle,
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
                              ? UAGRM_TOKENS.colors.charcoal
                              : esCompletado
                              ? UAGRM_TOKENS.colors.primaryDark
                              : UAGRM_TOKENS.colors.background.paper,
                            color: esActivo || esCompletado ? '#ffffff' : UAGRM_TOKENS.colors.slate,
                            border: esActivo || esCompletado ? 'none' : `2px solid ${UAGRM_TOKENS.border.subtle}`,
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {esCompletado ? <Check size={16} strokeWidth={3} /> : paso.numero}
                        </Box>

                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: esActivo ? 800 : 600,
                            color: esActivo ? UAGRM_TOKENS.colors.charcoal : UAGRM_TOKENS.colors.slate,
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

            {/* Tarjeta 2: Pestañas de Detalle */}
            <Card
              elevation={0}
              sx={{
                borderRadius: `${UAGRM_TOKENS.radii.xl}px`,
                border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
                backgroundColor: UAGRM_TOKENS.colors.background.paper,
                p: { xs: 2.5, sm: 3.5 },
                boxShadow: UAGRM_TOKENS.shadows.card,
              }}
            >
              {/* Pestañas con Subrayado Oficial */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3.5,
                  borderBottom: `1px solid ${UAGRM_TOKENS.border.subtle}`,
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
                        color: isActive ? UAGRM_TOKENS.colors.charcoal : UAGRM_TOKENS.colors.slate,
                        transition: 'all 0.15s ease',
                        '&:hover': { color: UAGRM_TOKENS.colors.charcoal },
                        '&::after': isActive
                          ? {
                              content: '""',
                              position: 'absolute',
                              bottom: -1,
                              left: 0,
                              right: 0,
                              height: '2.5px',
                              backgroundColor: UAGRM_TOKENS.colors.charcoal,
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

              {/* Tab: Resumen */}
              {tabActiva === 'resumen' && (
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Building size={16} color={UAGRM_TOKENS.colors.slate} />
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 800,
                            color: UAGRM_TOKENS.colors.slate,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          PROVEEDOR
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '12px',
                            backgroundColor: UAGRM_TOKENS.colors.background.subtle,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            color: UAGRM_TOKENS.colors.primaryDark,
                            flexShrink: 0,
                          }}
                        >
                          P{compra.proveedor_id}
                        </Box>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.charcoal, lineHeight: 1.2 }}>
                            {proveedor?.razon_social || `Proveedor #${compra.proveedor_id}`}
                          </Typography>
                          <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.slate }}>
                            Proveedor autorizado {proveedor?.nit ? `• NIT: ${proveedor.nit}` : ''}
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          p: 1.4,
                          borderRadius: '10px',
                          backgroundColor: UAGRM_TOKENS.colors.background.subtle,
                          border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
                          mt: 1,
                        }}
                      >
                        <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.slate, fontWeight: 600 }}>
                          {proveedor?.contacto
                            ? `Contacto: ${proveedor.contacto}${proveedor.telefono ? ` · Tel: ${proveedor.telefono}` : ''}`
                            : 'Sin datos de contacto registrados'}
                        </Typography>
                      </Box>

                      <Box sx={{ pt: 0.5 }}>
                        <Button
                          variant="ghost"
                          component={Link}
                          to="/proveedores"
                          icon={<ArrowRight size={14} />}
                          style={{ padding: 0 }}
                        >
                          Ver padrón de proveedores
                        </Button>
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Calendar size={16} color={UAGRM_TOKENS.colors.slate} />
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 800,
                            color: UAGRM_TOKENS.colors.slate,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          FECHAS Y DESTINO
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.slate, display: 'block', mb: 0.3 }}>
                          Fecha de emisión
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.charcoal }}>
                          {formatearFecha(compra.fecha_generacion)}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.slate, display: 'block', mb: 0.3 }}>
                          Motivo de la compra
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.charcoal }}>
                          {compra.prediccion_id
                            ? `Sugerido por Modelo Predictivo (#ML-${compra.prediccion_id})`
                            : 'Reposición preventiva de inventario litográfico'}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.slate, display: 'block', mb: 0.3 }}>
                          Punto de recepción
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.charcoal, lineHeight: 1.3 }}>
                          Almacén Central Litográfico • Ciudad Universitaria UAGRM
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              )}

              {/* Tab: Qué se compra */}
              {tabActiva === 'detalle' && (
                <Box sx={{ p: 2, borderRadius: 2, border: `1px solid ${UAGRM_TOKENS.border.subtle}` }}>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.charcoal }}>
                    Lote de Materia Prima e Insumos Litográficos
                  </Typography>
                  <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.slate, display: 'block', mt: 0.5 }}>
                    Reposición de stock para impresión offset, planchas CTP y acabados.
                  </Typography>
                  <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${UAGRM_TOKENS.border.subtle}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontWeight: 700, color: UAGRM_TOKENS.colors.slate }}>Subtotal Comprometido:</Typography>
                    <Typography sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primaryDark, fontSize: '1.1rem' }}>
                      {formatearMoneda(compra.total_estimado)}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Tab: Avance */}
              {tabActiva === 'avance' && (
                <Box sx={{ p: 2.5, borderRadius: 2, backgroundColor: UAGRM_TOKENS.colors.background.subtle, border: `1px solid ${UAGRM_TOKENS.border.subtle}` }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.charcoal }}>
                    Trazabilidad de la Orden de Compra
                  </Typography>
                  <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, mt: 0.5 }}>
                    Estado actual en el sistema: <strong>{estadoActual}</strong> registrado el {formatearFecha(compra.fecha_generacion)}.
                  </Typography>
                </Box>
              )}
            </Card>
          </Stack>
        </Grid>

        {/* Columna Derecha: Panel de Acción */}
        <Grid size={{ xs: 12, md: 4.5, lg: 4 }}>
          <Stack spacing={3}>
            <Card
              elevation={0}
              sx={{
                borderRadius: `${UAGRM_TOKENS.radii.xl}px`,
                border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
                backgroundColor: UAGRM_TOKENS.colors.background.paper,
                p: { xs: 2.5, sm: 3.5 },
                boxShadow: UAGRM_TOKENS.shadows.card,
              }}
            >
              <Box sx={{ mb: 2 }}>
                <Badge variant={getBadgeVariant(estadoActual)}>
                  {estadoActual}
                </Badge>
              </Box>

              <Typography
                variant="caption"
                sx={{
                  color: UAGRM_TOKENS.colors.slate,
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  display: 'block',
                }}
              >
                TOTAL PRESUPUESTADO
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: UAGRM_TOKENS.colors.primaryDark,
                  letterSpacing: '-0.02em',
                  mt: 0.5,
                  mb: 3,
                  fontSize: { xs: '1.8rem', sm: '2.1rem' },
                }}
              >
                {formatearMoneda(compra.total_estimado)}
              </Typography>

              <Stack spacing={1.5}>
                {estadoActual === 'SUGERIDA' && (
                  <Button
                    variant="default"
                    fullWidth
                    disabled={procesando}
                    onClick={() => handleCambiarEstado('APROBADA', 'Orden de compra aprobada exitosamente.')}
                    loading={procesando}
                    icon={<Check size={16} />}
                  >
                    Aprobar Orden
                  </Button>
                )}

                {estadoActual === 'APROBADA' && (
                  <Button
                    variant="default"
                    fullWidth
                    disabled={procesando}
                    onClick={() => handleCambiarEstado('ENVIADA', 'Orden enviada formalmente al proveedor.')}
                    loading={procesando}
                    icon={<Truck size={16} />}
                  >
                    Enviar a Proveedor
                  </Button>
                )}

                {estadoActual !== 'RECIBIDA' && estadoActual !== 'CANCELADA' && (
                  <Button
                    variant="secondary"
                    fullWidth
                    disabled={procesando || estadoActual === 'SUGERIDA'}
                    onClick={() => handleCambiarEstado('RECIBIDA', 'Mercadería recibida e ingresada al inventario.')}
                    icon={<Package size={16} />}
                  >
                    Recibir en Almacén
                  </Button>
                )}

                <Button
                  variant="outline"
                  fullWidth
                  onClick={handleAbrirImpresion}
                  icon={<Printer size={16} />}
                >
                  Imprimir Comprobante
                </Button>

                {!esCancelada && estadoActual !== 'RECIBIDA' && (
                  <Button
                    variant="outline"
                    color="error"
                    fullWidth
                    onClick={() => setModalCancelarAbierto(true)}
                    icon={<XCircle size={16} />}
                  >
                    Cancelar Orden
                  </Button>
                )}
              </Stack>
            </Card>

            <Box
              sx={{
                borderRadius: `${UAGRM_TOKENS.radii.lg}px`,
                border: `1px solid ${UAGRM_TOKENS.colors.cyan}30`,
                backgroundColor: `${UAGRM_TOKENS.colors.cyan}10`,
                p: { xs: 2, sm: 2.5 },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <HelpCircle size={18} color={UAGRM_TOKENS.colors.cyan} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.charcoal }}>
                  Guía de Procedimiento
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.85rem', lineHeight: 1.5 }}>
                {estadoActual === 'SUGERIDA' &&
                  'Revisa los datos de la orden y apruébala. Posteriormente podrá enviarse al proveedor adjudicado.'}
                {estadoActual === 'APROBADA' &&
                  'La orden de compra ha sido validada. Emítela formalmente hacia el proveedor para coordinar la entrega.'}
                {estadoActual === 'ENVIADA' &&
                  'El despacho se encuentra en tránsito. Al recibir los insumos en el almacén, presiona «Recibir en Almacén».'}
                {estadoActual === 'RECIBIDA' &&
                  'La orden fue recepcionada satisfactoriamente y el lote de insumos ingresó al Kardex activo.'}
                {estadoActual === 'CANCELADA' &&
                  'Orden anulada. No compromete presupuesto ni altera el stock de insumos litográficos.'}
              </Typography>
            </Box>
          </Stack>
        </Grid>
      </Grid>

      {/* Modal Desacoplado: Cancelar Orden */}
      <Modal
        open={modalCancelarAbierto}
        onClose={() => !procesando && setModalCancelarAbierto(false)}
        title="Cancelar Orden de Compra"
        subtitle={`Confirmación de anulación para la orden #OC-${compra.id_orden_compra}`}
        maxWidth="xs"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setModalCancelarAbierto(false)}
              disabled={procesando}
            >
              Atrás
            </Button>
            <Button
              variant="default"
              color="error"
              onClick={handleCancelarOrden}
              loading={procesando}
              icon={<XCircle size={16} />}
            >
              Sí, Cancelar Orden
            </Button>
          </>
        }
      >
        <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, pt: 1 }}>
          ¿Está seguro de que desea cancelar la <strong>Orden de Compra #OC-{compra.id_orden_compra}</strong>? Esta acción actualizará el estado a CANCELADA en el servidor institucional.
        </Typography>
      </Modal>

      {/* Modal de Vista Previa Oficial e Impresión */}
      <CompraPreviewModal
        open={modalImprimirAbierto}
        compra={compra}
        htmlDoc={htmlImpresion}
        onClose={() => setModalImprimirAbierto(false)}
      />
    </Box>
  );
}

export default CompraDetallePage;
