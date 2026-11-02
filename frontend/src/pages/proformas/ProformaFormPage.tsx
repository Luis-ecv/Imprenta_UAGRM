import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import {
  ArrowLeft,
  Check,
  FileText,
  Calculator,
  Layers,
  Info,
} from 'lucide-react';

import { proformasApi } from '@/api/proformas.api';
import { clientesApi } from '@/api/clientes.api';
import { tarifasApi, type TipoTrabajoResponse } from '@/api/tarifas.api';
import { UAGRM_TOKENS } from '@/theme/tokens';
import { Button } from '@/components/ui';
import type { ClienteResponse, Modalidad, ProformaResponse, ProformaCreate } from '@/types';
import { formatearMoneda } from '@/utils/formatters';
import { calcularCostosLitograficos } from '@/utils/calculoLitografico';
import { ProformaPreviewModal } from './components';

export function ProformaFormPage() {
  const navigate = useNavigate();

  // Estados de datos maestros
  const [clientes, setClientes] = useState<ClienteResponse[]>([]);
  const [tiposTrabajo, setTiposTrabajo] = useState<TipoTrabajoResponse[]>([]);
  const [cargandoMaestros, setCargandoMaestros] = useState<boolean>(true);

  // Estados del formulario
  const [clienteId, setClienteId] = useState<number | ''>('');
  const [modalidad, setModalidad] = useState<Modalidad>('insumos_imprenta');
  const [descripcionTrabajo, setDescripcionTrabajo] = useState<string>('');
  const [tipoTrabajoId, setTipoTrabajoId] = useState<number | ''>('');
  const [tiraje, setTiraje] = useState<number>(1000);
  const [numeroPaginas, setNumeroPaginas] = useState<number>(64);
  const [diasVigencia, setDiasVigencia] = useState<number>(15);

  // Estados de guardado y feedback
  const [guardando, setGuardando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modal Popup de Proforma Oficial Emitida
  const [modalPreviewAbierto, setModalPreviewAbierto] = useState<boolean>(false);
  const [proformaEmitida, setProformaEmitida] = useState<ProformaResponse | null>(null);
  const [htmlDoc, setHtmlDoc] = useState<string>('');
  const [cargandoHtml, setCargandoHtml] = useState<boolean>(false);

  // Cargar clientes y tipos de trabajo al montar
  useEffect(() => {
    async function cargarDatos() {
      try {
        setCargandoMaestros(true);
        const [resClientes, resTipos] = await Promise.all([
          clientesApi.listar({ por_pagina: 100 }),
          tarifasApi.listarTiposTrabajo(),
        ]);
        setClientes(resClientes.datos || []);
        setTiposTrabajo(resTipos || []);
        if (resClientes.datos?.length > 0) {
          setClienteId(resClientes.datos[0].id_cliente);
        }
        if (resTipos?.length > 0) {
          setTipoTrabajoId(resTipos[0].id_tipo_trabajo);
        }
      } catch {
        setError('No se pudieron cargar los clientes o tipos de trabajo del servidor.');
      } finally {
        setCargandoMaestros(false);
      }
    }
    cargarDatos();
  }, []);

  // Cálculo técnico paramétrico automático reutilizable
  const calculos = useMemo(
    () => calcularCostosLitograficos(modalidad, tiraje, numeroPaginas),
    [modalidad, tiraje, numeroPaginas]
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!clienteId || !tipoTrabajoId || !descripcionTrabajo.trim()) {
      setError('Por favor complete todos los campos requeridos del trabajo litográfico.');
      return;
    }

    try {
      setGuardando(true);
      setError(null);

      const payload: ProformaCreate = {
        cliente_id: Number(clienteId),
        modalidad,
        dias_vigencia: diasVigencia,
        detalles: [
          {
            descripcion_trabajo: descripcionTrabajo.trim(),
            tipo_trabajo_id: Number(tipoTrabajoId),
            tiraje: Number(tiraje),
            paginas_totales: Number(numeroPaginas),
            numero_paginas: Number(numeroPaginas),
            costo_papel: calculos.costoPapel,
            costo_tinta: calculos.costoTinta,
            costo_planchas: calculos.costoPlanchas,
            costo_mano_obra: calculos.costoManoObra,
            subtotal: calculos.total,
          },
        ],
      };

      const res = await proformasApi.crear(payload);
      setProformaEmitida(res);

      // Cargar HTML oficial para el popup de visualización inmediata
      setCargandoHtml(true);
      try {
        const html = await proformasApi.obtenerImpresionHtml(res.id_proforma);
        setHtmlDoc(html);
      } catch {
        setHtmlDoc('');
      } finally {
        setCargandoHtml(false);
      }

      setModalPreviewAbierto(true);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: unknown } } };
        const detail = axiosErr.response?.data?.detail;
        if (typeof detail === 'string') {
          setError(detail);
        } else if (Array.isArray(detail)) {
          const msgs = detail.map((d) =>
            typeof d === 'object' && d !== null && 'msg' in d ? (d as { msg: string }).msg : String(d)
          );
          setError(msgs.join(', ') || 'Error de validación en la proforma.');
        } else {
          setError('Error al emitir la proforma litográfica.');
        }
      } else {
        setError('Error al conectar con el servidor.');
      }
    } finally {
      setGuardando(false);
    }
  }

  if (cargandoMaestros) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 2 }}>
        <CircularProgress sx={{ color: UAGRM_TOKENS.colors.ruby }} />
        <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, fontWeight: 600 }}>
          Cargando catálogos del sistema litográfico...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 }, backgroundColor: UAGRM_TOKENS.background.default, minHeight: '100%' }}>
      {/* 1. Encabezado */}
      <Box sx={{ mb: 3.5 }}>
        <Link
          to="/proformas"
          className="inline-flex items-center gap-2 text-sm font-bold mb-2 hover:opacity-80 transition"
          style={{ color: UAGRM_TOKENS.colors.ruby }}
        >
          <ArrowLeft size={16} /> Volver a Proformas
        </Link>

        <Typography
          variant="overline"
          sx={{
            fontWeight: 800,
            letterSpacing: '0.12em',
            color: UAGRM_TOKENS.colors.cyan,
            display: 'block',
            lineHeight: 1.2,
          }}
        >
          Módulo de Facturación y Cotizaciones
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
          Crear Proforma / Factura Litográfica
        </Typography>
        <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.925rem' }}>
          Calcula automáticamente el presupuesto institucional según pliegos de papel, tinta offset, planchas CTP y mano de obra.
        </Typography>
      </Box>

      {/* Alerta de Error si ocurre */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Formulario Principal */}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Columna Izquierda: Parámetros del Trabajo */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
                backgroundColor: UAGRM_TOKENS.colors.background.paper,
                mb: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 2, mb: 2.5, borderBottom: `1px solid ${UAGRM_TOKENS.border.subtle}` }}>
                  <FileText size={20} color={UAGRM_TOKENS.colors.ruby} />
                  <Typography variant="h6" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primaryDark, fontSize: '1.05rem' }}>
                    Datos del Solicitante y Trabajo Litográfico
                  </Typography>
                </Box>

                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      select
                      required
                      size="small"
                      label="Cliente o Facultad Solicitante *"
                      value={clienteId}
                      onChange={(e) => setClienteId(Number(e.target.value))}
                    >
                      {clientes.map((c) => (
                        <MenuItem key={c.id_cliente} value={c.id_cliente}>
                          {c.razon_social} ({c.tipo_cliente})
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      select
                      required
                      size="small"
                      label="Tipo de Trabajo Litográfico *"
                      value={tipoTrabajoId}
                      onChange={(e) => setTipoTrabajoId(Number(e.target.value))}
                    >
                      {tiposTrabajo.map((t) => (
                        <MenuItem key={t.id_tipo_trabajo} value={t.id_tipo_trabajo}>
                          {t.nombre}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      required
                      size="small"
                      label="Descripción Detallada del Trabajo *"
                      placeholder="Ej. Libro Académico 'Cálculo II' con tapa a color y anillado"
                      value={descripcionTrabajo}
                      onChange={(e) => setDescripcionTrabajo(e.target.value)}
                    />
                  </Grid>

                  {/* Modalidad de Suministro */}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.charcoal, display: 'block', textTransform: 'uppercase', mb: 1 }}>
                      Modalidad de Suministro de Insumos *
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box
                          onClick={() => setModalidad('insumos_imprenta')}
                          sx={{
                            p: 2,
                            borderRadius: 2.5,
                            border: `2px solid ${
                              modalidad === 'insumos_imprenta'
                                ? UAGRM_TOKENS.colors.ruby
                                : UAGRM_TOKENS.border.subtle
                            }`,
                            backgroundColor:
                              modalidad === 'insumos_imprenta'
                                ? UAGRM_TOKENS.colors.status.error.light
                                : UAGRM_TOKENS.colors.background.paper,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': { borderColor: UAGRM_TOKENS.colors.ruby },
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 800,
                              color:
                                modalidad === 'insumos_imprenta'
                                  ? UAGRM_TOKENS.colors.ruby
                                  : UAGRM_TOKENS.colors.charcoal,
                            }}
                          >
                            Insumos de Imprenta
                          </Typography>
                          <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.slate, display: 'block', mt: 0.5 }}>
                            La Imprenta Universitaria provee el papel y todos los materiales.
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box
                          onClick={() => setModalidad('insumos_cliente')}
                          sx={{
                            p: 2,
                            borderRadius: 2.5,
                            border: `2px solid ${
                              modalidad === 'insumos_cliente'
                                ? UAGRM_TOKENS.colors.ruby
                                : UAGRM_TOKENS.border.subtle
                            }`,
                            backgroundColor:
                              modalidad === 'insumos_cliente'
                                ? UAGRM_TOKENS.colors.status.error.light
                                : UAGRM_TOKENS.colors.background.paper,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': { borderColor: UAGRM_TOKENS.colors.ruby },
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 800,
                              color:
                                modalidad === 'insumos_cliente'
                                  ? UAGRM_TOKENS.colors.ruby
                                  : UAGRM_TOKENS.colors.charcoal,
                            }}
                          >
                            Insumos del Cliente
                          </Typography>
                          <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.slate, display: 'block', mt: 0.5 }}>
                            Papel provisto por el cliente (costo de papel fijado en 0.00 Bs).
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {modalidad === 'insumos_cliente' && (
                      <Alert severity="info" icon={<Info size={18} />} sx={{ mt: 2, borderRadius: 2 }}>
                        <strong>Regla institucional:</strong> Al seleccionar insumos del cliente, el costo del papel se fija en 0.00 Bs y no se descuenta del inventario de almacén.
                      </Alert>
                    )}
                  </Grid>

                  {/* Tiraje, Páginas y Vigencia */}
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      required
                      type="number"
                      size="small"
                      label="Tiraje (Ejemplares)"
                      value={tiraje}
                      onChange={(e) => setTiraje(Math.max(1, parseInt(e.target.value) || 0))}
                      slotProps={{ htmlInput: { min: 1 } }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      required
                      type="number"
                      size="small"
                      label="Número de Páginas"
                      value={numeroPaginas}
                      onChange={(e) => setNumeroPaginas(Math.max(1, parseInt(e.target.value) || 0))}
                      slotProps={{ htmlInput: { min: 1 } }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      required
                      type="number"
                      size="small"
                      label="Vigencia (Días)"
                      value={diasVigencia}
                      onChange={(e) => setDiasVigencia(Math.max(1, parseInt(e.target.value) || 0))}
                      slotProps={{ htmlInput: { min: 1, max: 90 } }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Columna Derecha: Tarjeta de Desglose de Costos */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
                backgroundColor: UAGRM_TOKENS.colors.background.paper,
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                position: { lg: 'sticky' },
                top: { lg: 96 },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2, mb: 2.5, borderBottom: `1px solid ${UAGRM_TOKENS.border.subtle}` }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primaryDark, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Calculator size={18} color={UAGRM_TOKENS.colors.ruby} />
                    Desglose Técnico
                  </Typography>
                  <Chip
                    label={`${calculos.hojas} pliegos`}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      backgroundColor: UAGRM_TOKENS.colors.background.subtle,
                      color: UAGRM_TOKENS.colors.charcoal,
                    }}
                  />
                </Box>

                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                    <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Layers size={14} color={UAGRM_TOKENS.colors.mutedSlate} />
                      Papel ({modalidad === 'insumos_imprenta' ? 'Imprenta' : 'Cliente'}):
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: UAGRM_TOKENS.colors.charcoal }}>
                      {formatearMoneda(calculos.costoPapel)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                    <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate }}>
                      Tinta Offset CMYK:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: UAGRM_TOKENS.colors.charcoal }}>
                      {formatearMoneda(calculos.costoTinta)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                    <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate }}>
                      Planchas CTP (4 juegos):
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: UAGRM_TOKENS.colors.charcoal }}>
                      {formatearMoneda(calculos.costoPlanchas)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                    <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate }}>
                      Mano de obra y prensa:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: UAGRM_TOKENS.colors.charcoal }}>
                      {formatearMoneda(calculos.costoManoObra)}
                    </Typography>
                  </Box>

                  <Box sx={{ pt: 2, borderTop: `1px solid ${UAGRM_TOKENS.border.subtle}`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primaryDark }}>
                      Total Cotizado:
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.ruby }}>
                      {formatearMoneda(calculos.total)}
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
                  <Button
                    fullWidth
                    type="submit"
                    variant="default"
                    disabled={guardando}
                    isLoading={guardando}
                    icon={<Check size={18} />}
                  >
                    Confirmar
                  </Button>
                  <Button
                    fullWidth
                    variant="outline"
                    component={Link}
                    to="/proformas"
                    disabled={guardando}
                  >
                    Cancelar
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>

      {/* Modal Popup de Vista Previa Reutilizable */}
      <ProformaPreviewModal
        open={modalPreviewAbierto}
        proforma={proformaEmitida}
        htmlDoc={htmlDoc}
        cargandoHtml={cargandoHtml}
        onClose={() => {
          setModalPreviewAbierto(false);
          navigate('/proformas');
        }}
      />
    </Box>
  );
}
export default ProformaFormPage;
