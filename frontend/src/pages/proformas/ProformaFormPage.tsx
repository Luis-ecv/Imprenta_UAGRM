import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { alpha } from '@mui/material/styles';
import {
  ArrowLeft,
  Check,
  FileText,
  Calculator,
  Printer,
  Layers,
  Info,
  X,
  ExternalLink,
} from 'lucide-react';

import { proformasApi } from '@/api/proformas.api';
import { clientesApi } from '@/api/clientes.api';
import { tarifasApi, type TipoTrabajoResponse } from '@/api/tarifas.api';
import { UAGRM_COLORS } from '@/theme/uagrmTheme';
import type { ClienteResponse, Modalidad, ProformaResponse } from '@/types';
import { formatearMoneda } from '@/utils/formatters';
import { imprimirDocumentoHtml, abrirDocumentoEnPestana } from '@/utils/impresion';

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

  // Cálculo técnico paramétrico automático
  const calculos = useMemo(() => {
    const safeTiraje = Math.max(0, Number(tiraje) || 0);
    const safePaginas = Math.max(0, Number(numeroPaginas) || 0);
    // Pliegos = (Tiraje * Páginas) / 2 páginas por pliego doble cara
    const hojas = Math.ceil((safeTiraje * safePaginas) / 2);

    // Costo Papel: 0 si la modalidad es insumos_cliente
    const costoPapel = modalidad === 'insumos_imprenta' ? Number((hojas * 0.45).toFixed(2)) : 0;
    const costoTinta = Number((safeTiraje * safePaginas * 0.04).toFixed(2));
    const costoPlanchas = 150 * 4; // 4 planchas CTP térmicas (CMYK) = 600 Bs
    const costoManoObra = Number((50 + safeTiraje * 0.05).toFixed(2));
    const total = Number((costoPapel + costoTinta + costoPlanchas + costoManoObra).toFixed(2));

    return {
      hojas,
      costoPapel,
      costoTinta,
      costoPlanchas,
      costoManoObra,
      total,
    };
  }, [modalidad, tiraje, numeroPaginas]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!clienteId || !tipoTrabajoId || !descripcionTrabajo.trim()) {
      setError('Por favor complete todos los campos requeridos del trabajo litográfico.');
      return;
    }

    try {
      setGuardando(true);
      setError(null);

      // El backend exige estrictamente paginas_totales
      const payload = {
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
        // En caso de que no cargue el HTML, el modal igual mostrará los datos de la proforma
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
          // Si FastAPI devuelve un arreglo de errores de validación, formatear a string para no romper React
          const msgs = detail.map((d) => (typeof d === 'object' && d !== null && 'msg' in d ? (d as { msg: string }).msg : String(d)));
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

  const handleImprimir = () => {
    if (htmlDoc) {
      imprimirDocumentoHtml(htmlDoc);
    } else if (proformaEmitida) {
      proformasApi.obtenerImpresionHtml(proformaEmitida.id_proforma).then((h) => {
        setHtmlDoc(h);
        imprimirDocumentoHtml(h);
      });
    }
  };

  const handleAbrirPestana = () => {
    if (htmlDoc) {
      abrirDocumentoEnPestana(htmlDoc);
    } else if (proformaEmitida) {
      proformasApi.obtenerImpresionHtml(proformaEmitida.id_proforma).then((h) => {
        setHtmlDoc(h);
        abrirDocumentoEnPestana(h);
      });
    }
  };

  if (cargandoMaestros) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 2 }}>
        <CircularProgress sx={{ color: UAGRM_COLORS.red.main }} />
        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
          Cargando catálogos del sistema litográfico...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 }, backgroundColor: UAGRM_COLORS.background.default, minHeight: '100%' }}>
      {/* 1. Encabezado */}
      <Box sx={{ mb: 3.5 }}>
        <Button
          component={Link}
          to="/proformas"
          startIcon={<ArrowLeft size={16} />}
          sx={{
            color: UAGRM_COLORS.red.main,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.875rem',
            p: 0,
            mb: 1.5,
            '&:hover': { backgroundColor: 'transparent', color: UAGRM_COLORS.red.dark },
          }}
        >
          Volver a Proformas
        </Button>

        <Typography
          variant="overline"
          sx={{
            fontWeight: 800,
            letterSpacing: '0.12em',
            color: UAGRM_COLORS.cyan.main,
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
            color: UAGRM_COLORS.blue.dark,
            letterSpacing: '-0.02em',
            mb: 0.5,
          }}
        >
          Crear Proforma / Factura Litográfica
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.925rem' }}>
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
                border: `1px solid ${UAGRM_COLORS.border}`,
                backgroundColor: '#ffffff',
                mb: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 2, mb: 2.5, borderBottom: `1px solid ${UAGRM_COLORS.border}` }}>
                  <FileText size={20} color={UAGRM_COLORS.red.main} />
                  <Typography variant="h6" sx={{ fontWeight: 800, color: UAGRM_COLORS.blue.dark, fontSize: '1.05rem' }}>
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
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', textTransform: 'uppercase', mb: 1 }}>
                      Modalidad de Suministro de Insumos *
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box
                          onClick={() => setModalidad('insumos_imprenta')}
                          sx={{
                            p: 2,
                            borderRadius: 2.5,
                            border: `2px solid ${modalidad === 'insumos_imprenta' ? UAGRM_COLORS.red.main : UAGRM_COLORS.border}`,
                            backgroundColor: modalidad === 'insumos_imprenta' ? alpha(UAGRM_COLORS.red.main, 0.04) : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': { borderColor: UAGRM_COLORS.red.main },
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: modalidad === 'insumos_imprenta' ? UAGRM_COLORS.red.main : '#1e293b' }}>
                            Insumos de Imprenta
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
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
                            border: `2px solid ${modalidad === 'insumos_cliente' ? UAGRM_COLORS.red.main : UAGRM_COLORS.border}`,
                            backgroundColor: modalidad === 'insumos_cliente' ? alpha(UAGRM_COLORS.red.main, 0.04) : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': { borderColor: UAGRM_COLORS.red.main },
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: modalidad === 'insumos_cliente' ? UAGRM_COLORS.red.main : '#1e293b' }}>
                            Insumos del Cliente
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
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
                border: `1px solid ${UAGRM_COLORS.border}`,
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                position: { lg: 'sticky' },
                top: { lg: 96 },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2, mb: 2.5, borderBottom: `1px solid ${UAGRM_COLORS.border}` }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: UAGRM_COLORS.blue.dark, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Calculator size={18} color={UAGRM_COLORS.red.main} />
                    Desglose Técnico
                  </Typography>
                  <Chip
                    label={`${calculos.hojas} pliegos`}
                    size="small"
                    sx={{ fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569' }}
                  />
                </Box>

                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                    <Typography variant="body2" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Layers size={14} color="#94a3b8" />
                      Papel ({modalidad === 'insumos_imprenta' ? 'Imprenta' : 'Cliente'}):
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      {formatearMoneda(calculos.costoPapel)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      Tinta Offset CMYK:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      {formatearMoneda(calculos.costoTinta)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      Planchas CTP (4 juegos):
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      {formatearMoneda(calculos.costoPlanchas)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      Mano de obra y prensa:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      {formatearMoneda(calculos.costoManoObra)}
                    </Typography>
                  </Box>

                  <Box sx={{ pt: 2, borderTop: `1px solid ${UAGRM_COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: UAGRM_COLORS.blue.dark }}>
                      Total Cotizado:
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: UAGRM_COLORS.red.main }}>
                      {formatearMoneda(calculos.total)}
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={guardando}
                    endIcon={guardando ? <CircularProgress size={18} color="inherit" /> : <Check size={18} />}
                    sx={{
                      backgroundColor: '#1e2b4d',
                      color: '#ffffff',
                      fontWeight: 700,
                      py: 1.3,
                      borderRadius: 2.5,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      boxShadow: '0 4px 14px rgba(30, 43, 77, 0.28)',
                      '&:hover': { backgroundColor: '#141d34' },
                      '&.Mui-disabled': {
                        backgroundColor: '#1e2b4d',
                        color: '#ffffff',
                        opacity: 0.65,
                      },
                    }}
                  >
                    {guardando ? 'Confirmando...' : 'Confirmar'}
                  </Button>
                  <Button
                    fullWidth
                    component={Link}
                    to="/proformas"
                    disabled={guardando}
                    sx={{
                      backgroundColor: '#607285',
                      color: '#ffffff',
                      fontWeight: 700,
                      py: 1.1,
                      borderRadius: 50.5,
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      '&:hover': { backgroundColor: '#4f5e6d' },
                    }}
                  >
                    Cancelar
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>

      {/* 2. POPUP MODAL: VISTA PREVIA Y FACTURA OFICIAL EMITIDA (SIN HOJA EN BLANCO) */}
      <Dialog
        open={modalPreviewAbierto}
        onClose={() => setModalPreviewAbierto(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3.5,
              p: 1,
              maxHeight: '90vh',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2, px: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="overline" sx={{ fontWeight: 800, color: UAGRM_COLORS.cyan.main, letterSpacing: '0.1em' }}>
              Documento Oficial Registrado
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: UAGRM_COLORS.blue.dark }}>
              {proformaEmitida ? `Proforma ${proformaEmitida.codigo_proforma}` : 'Documento Emitido'}
            </Typography>
          </Box>
          <IconButton onClick={() => setModalPreviewAbierto(false)} size="small">
            <X size={18} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 2.5, py: 1.5 }}>
          {cargandoHtml ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
              <CircularProgress sx={{ color: UAGRM_COLORS.red.main, mb: 2 }} />
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                Generando formato imprimible institucional...
              </Typography>
            </Box>
          ) : htmlDoc ? (
            <Box
              sx={{
                width: '100%',
                height: 480,
                border: `1px solid ${UAGRM_COLORS.border}`,
                borderRadius: 2,
                overflow: 'hidden',
                backgroundColor: '#ffffff',
              }}
            >
              <iframe
                title="Vista previa de proforma oficial"
                srcDoc={htmlDoc}
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </Box>
          ) : (
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              ¡La proforma fue emitida exitosamente en el sistema con código{' '}
              <strong>{proformaEmitida?.codigo_proforma}</strong> por un total de{' '}
              <strong>{formatearMoneda(proformaEmitida?.total_presupuesto || calculos.total)}</strong>!
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1.5, borderTop: `1px solid ${UAGRM_COLORS.border}`, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Button
            onClick={() => {
              setModalPreviewAbierto(false);
              navigate('/proformas');
            }}
            sx={{ color: '#64748b', fontWeight: 600, textTransform: 'none' }}
          >
            Ver en Listado de Proformas
          </Button>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<ExternalLink size={16} />}
              onClick={handleAbrirPestana}
              sx={{
                borderColor: UAGRM_COLORS.border,
                color: UAGRM_COLORS.blue.main,
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: 2,
                '&:hover': { backgroundColor: '#f8fafc' },
              }}
            >
              Ver en Pestaña
            </Button>

            <Button
              variant="contained"
              startIcon={<Printer size={16} />}
              onClick={handleImprimir}
              sx={{
                backgroundColor: UAGRM_COLORS.red.main,
                color: '#ffffff',
                fontWeight: 700,
                px: 2.5,
                textTransform: 'none',
                borderRadius: 2,
                '&:hover': { backgroundColor: UAGRM_COLORS.red.dark },
              }}
            >
              Imprimir Oficial
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </Box>
  );
}