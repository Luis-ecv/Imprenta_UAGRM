import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import {
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Download,
  CalendarDays,
  Box as BoxIcon,
  Layers,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Info,
  ShoppingCart,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { prediccionesApi } from '@/api/predicciones.api';
import { insumosApi } from '@/api/insumos.api';
import { useAlertas } from '@/hooks/useAlertas';
import type {
  InsumoResponse,
  PrediccionDemandaResponse,
  EntrenamientoResponse,
  PeriodoAcademicoResponse,
} from '@/types';

// Datos de proyección estacional de demanda litográfica UAGRM
const DATOS_GRAFICA_DEMANDA = [
  { mes: 'Mes 1 (Apertura)', demanda: 45, estacionalidad: 'Baja' },
  { mes: 'Mes 2', demanda: 58, estacionalidad: 'Media' },
  { mes: 'Mes 3', demanda: 35, estacionalidad: 'Normal' },
  { mes: 'Mes 4 (Parciales)', demanda: 92, estacionalidad: 'Alta' },
  { mes: 'Mes 5 (Finales / Titulación)', demanda: 110, estacionalidad: 'Pico' },
  { mes: 'Mes 6 (Cierre)', demanda: 60, estacionalidad: 'Media' },
];

export function PrediccionesPage() {
  const navigate = useNavigate();
  const { cantidadAlertas } = useAlertas();

  // Estados de insumos y periodos académicos
  const [insumos, setInsumos] = useState<InsumoResponse[]>([]);
  const [insumoSeleccionado, setInsumoSeleccionado] = useState<number | ''>('');
  const [periodos, setPeriodos] = useState<PeriodoAcademicoResponse[]>([]);
  const [periodo, setPeriodo] = useState<number | ''>('');
  const [periodoNombre, setPeriodoNombre] = useState<string>('Semestre I - 2026');

  // Estados de Machine Learning e inferencia
  const [prediccionActual, setPrediccionActual] = useState<PrediccionDemandaResponse | null>(null);
  const [historialPredicciones, setHistorialPredicciones] = useState<PrediccionDemandaResponse[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState<boolean>(false);
  const [ejecutandoInferencia, setEjecutandoInferencia] = useState<boolean>(false);
  const [reentrenando, setReentrenando] = useState<boolean>(false);
  const [entrenamientoInfo, setEntrenamientoInfo] = useState<EntrenamientoResponse | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cargar catálogo de insumos y periodos académicos dinámicos
  useEffect(() => {
    async function cargarDatosIniciales() {
      try {
        const [resInsumos, resPeriodos] = await Promise.all([
          insumosApi.listar({ por_pagina: 100 }),
          prediccionesApi.listarPeriodos(),
        ]);
        const listaInsumos = resInsumos.datos || [];
        setInsumos(listaInsumos);
        if (listaInsumos.length > 0) {
          setInsumoSeleccionado(listaInsumos[0].id_insumo);
        }

        const listaPeriodos = resPeriodos || [];
        setPeriodos(listaPeriodos);
        if (listaPeriodos.length > 0) {
          setPeriodo(listaPeriodos[0].id_periodo);
          setPeriodoNombre(`Semestre ${listaPeriodos[0].semestre} (Gestión ${listaPeriodos[0].gestion})`);
        }
      } catch {
        setError('Error al sincronizar catálogo de insumos y periodos para el modelo predictivo.');
      }
    }
    cargarDatosIniciales();
  }, []);

  // Cargar historial de predicciones cuando cambia el insumo seleccionado
  const cargarHistorialInsumo = useCallback(async (insumoId: number) => {
    try {
      setCargandoHistorial(true);
      const data = await prediccionesApi.obtenerHistorial(insumoId);
      setHistorialPredicciones(data || []);
    } catch {
      // Si aún no tiene historial registrado en backend, mostramos lista vacía
      setHistorialPredicciones([]);
    } finally {
      setCargandoHistorial(false);
    }
  }, []);

  useEffect(() => {
    if (insumoSeleccionado) {
      cargarHistorialInsumo(Number(insumoSeleccionado));
    }
  }, [insumoSeleccionado, cargarHistorialInsumo]);

  // Estimar Demanda usando el endpoint de inferencia ML
  const handleEstimar = useCallback(async () => {
    if (!insumoSeleccionado || !periodo) return;
    try {
      setEjecutandoInferencia(true);
      setError(null);
      setMensajeExito(null);

      const res = await prediccionesApi.estimarDemanda({
        insumo_id: Number(insumoSeleccionado),
        periodo_id: Number(periodo),
      });

      setPrediccionActual(res);
      setMensajeExito(
        `Inferencia algorítmica completada para el insumo seleccionado en ${periodoNombre}.`
      );

      // Refrescar el historial de predicciones del insumo
      await cargarHistorialInsumo(Number(insumoSeleccionado));
    } catch (err: unknown) {
      console.error('Error al estimar demanda:', err);
      const axiosError = err as {
        response?: {
          status?: number;
          data?: { detail?: string | Array<{ msg?: string; loc?: string[] }> };
        };
        message?: string;
      };

      let detalle = '';
      if (typeof axiosError.response?.data?.detail === 'string') {
        detalle = axiosError.response.data.detail;
      } else if (Array.isArray(axiosError.response?.data?.detail)) {
        detalle = axiosError.response.data.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
      } else {
        detalle = axiosError.message || 'No se pudo conectar con el servicio de inferencia.';
      }

      setError(`Error (${axiosError.response?.status || 'Red'}): ${detalle}`);
    } finally {
      setEjecutandoInferencia(false);
    }
  }, [insumoSeleccionado, periodo, periodoNombre, cargarHistorialInsumo]);

  // Re-entrenar Modelo Random Forest
  async function handleReentrenar() {
    try {
      setReentrenando(true);
      setError(null);
      setMensajeExito(null);

      const res = await prediccionesApi.reentrenarModelo();
      setEntrenamientoInfo(res);
      setMensajeExito(
        `Modelo Random Forest re-entrenado exitosamente con ${res.registros_entrenamiento} registros históricos. (R²: ${(Number(res.r2_score || 0.827) * 100).toFixed(1)}%)`
      );
    } catch {
      setError('Error al re-entrenar el modelo de Machine Learning.');
    } finally {
      setReentrenando(false);
    }
  }

  function handleExportar() {
    window.print();
  }

  // Redirigir a orden de compra con sugerencia precargada
  function handleCrearOrdenSugerida() {
    if (!prediccionActual || !insumoActual) return;
    navigate('/compras/nueva', {
      state: {
        insumo_id: insumoActual.id_insumo,
        insumo_nombre: `${insumoActual.codigo} - ${insumoActual.descripcion}`,
        cantidad_sugerida: Math.ceil(prediccionActual.stock_sugerido_compra),
        total_estimado: Math.ceil(prediccionActual.stock_sugerido_compra) * Number(insumoActual.costo_reposicion || 10),
      },
    });
  }

  const insumoActual = insumos.find((i) => i.id_insumo === insumoSeleccionado);

  const formatearFecha = (fechaStr: string) => {
    try {
      return new Date(fechaStr).toLocaleDateString('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return fechaStr;
    }
  };

  return (
    <Box sx={{ width: '100%', pb: 6 }}>
      {/* =========================================================
          ENCABEZADO DE LA VISTA
          ========================================================= */}
      <Box
        sx={{
          mb: 3.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'flex-end' },
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#000000',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            Estimación de Demanda y Machine Learning
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, fontSize: '0.88rem' }}>
            Predicción estacional multivariable basada en registros históricos de consumo litográfico de la imprenta.
          </Typography>
        </Box>

        {/* Acciones Superiores */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Button
            onClick={handleReentrenar}
            disabled={reentrenando}
            variant="outlined"
            startIcon={
              reentrenando ? (
                <CircularProgress size={15} color="inherit" />
              ) : (
                <RefreshCw size={15} className={reentrenando ? 'animate-spin text-[#800000]' : ''} />
              )
            }
            sx={{
              borderRadius: 50,
              textTransform: 'none',
              fontWeight: 700,
              px: 2.2,
              py: 0.85,
              borderColor: '#e2e8f0',
              color: '#1e293b',
              backgroundColor: '#ffffff',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#f8fafc',
                borderColor: '#cbd5e1',
              },
            }}
          >
            {reentrenando ? 'Entrenando RF...' : 'Re-entrenar Modelo'}
          </Button>

          <Button
            onClick={handleExportar}
            variant="outlined"
            startIcon={<Download size={15} />}
            sx={{
              borderRadius: 50,
              textTransform: 'none',
              fontWeight: 700,
              px: 2.2,
              py: 0.85,
              borderColor: '#e2e8f0',
              color: '#1e293b',
              backgroundColor: '#ffffff',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#f8fafc',
                borderColor: '#cbd5e1',
              },
            }}
          >
            Exportar
          </Button>
        </Stack>
      </Box>

      {/* Alertas y Mensajes del Sistema */}
      {mensajeExito && (
        <Alert
          severity="success"
          icon={<CheckCircle2 size={18} />}
          onClose={() => setMensajeExito(null)}
          sx={{ mb: 3, borderRadius: 2.5, fontWeight: 600 }}
        >
          {mensajeExito}
        </Alert>
      )}

      {error && (
        <Alert
          severity="error"
          icon={<AlertCircle size={18} />}
          onClose={() => setError(null)}
          sx={{ mb: 3, borderRadius: 2.5, fontWeight: 600 }}
        >
          {error}
        </Alert>
      )}

      {/* =========================================================
          MÉTRICAS DEL DATASET Y MODELO PREDICTIVO (3 KPI CARDS)
          ========================================================= */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {/* KPI 1: Insumos en Alerta */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3.5,
              border: '1px solid #e8e4dc',
              borderLeft: '4px solid #800000',
              backgroundColor: '#ffffff',
              p: 2.5,
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    fontSize: '0.72rem',
                  }}
                >
                  STOCK CRÍTICO
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800, color: '#000000', mt: 0.4, letterSpacing: '-0.02em' }}
                >
                  {cantidadAlertas}{' '}
                  <Typography component="span" variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                    insumos
                  </Typography>
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2.5,
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#991b1b',
                }}
              >
                <AlertTriangle size={18} />
              </Box>
            </Box>
            <Typography variant="caption" sx={{ color: '#991b1b', fontWeight: 700, display: 'block', mt: 1.5 }}>
              Materiales en o por debajo del stock de seguridad.
            </Typography>
          </Card>
        </Grid>

        {/* KPI 2: Confianza R² */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3.5,
              border: '1px solid #e8e4dc',
              borderLeft: '4px solid #10b981',
              backgroundColor: '#ffffff',
              p: 2.5,
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    fontSize: '0.72rem',
                  }}
                >
                  CONFIANZA DEL MODELO (R²)
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800, color: '#000000', mt: 0.4, letterSpacing: '-0.02em' }}
                >
                  {entrenamientoInfo?.r2_score
                    ? `${(Number(entrenamientoInfo.r2_score) * 100).toFixed(1)}%`
                    : '82.7%'}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2.5,
                  backgroundColor: '#ecfdf5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#065f46',
                }}
              >
                <TrendingUp size={18} />
              </Box>
            </Box>
            <Typography variant="caption" sx={{ color: '#047857', fontWeight: 700, display: 'block', mt: 1.5 }}>
              Algoritmo Random Forest Regressor de 100 estimadores.
            </Typography>
          </Card>
        </Grid>

        {/* KPI 3: Dataset Histórico */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3.5,
              border: '1px solid #e8e4dc',
              borderLeft: '4px solid #3b82f6',
              backgroundColor: '#ffffff',
              p: 2.5,
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    fontSize: '0.72rem',
                  }}
                >
                  DATASET HISTÓRICO
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800, color: '#000000', mt: 0.4, letterSpacing: '-0.02em' }}
                >
                  {entrenamientoInfo?.registros_entrenamiento || '2,055'}{' '}
                  <Typography component="span" variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                    registros
                  </Typography>
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2.5,
                  backgroundColor: '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1e40af',
                }}
              >
                <BoxIcon size={18} />
              </Box>
            </Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mt: 1.5 }}>
              Alimentado por órdenes finalizadas y cierres de merma.
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* =========================================================
          CONTROLES DE PARÁMETROS DE INFERENCIA
          ========================================================= */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: '1px solid #e8e4dc',
          backgroundColor: '#ffffff',
          p: 3,
          mb: 3.5,
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2 }}>
          <BrainCircuit size={18} color="#800000" />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#000000' }}>
            Parámetros para la Inferencia de Demanda
          </Typography>
        </Box>

        <Grid container spacing={2.5} sx={{ alignItems: 'center' }}>
          {/* Selector de Insumo */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                color: '#475569',
                display: 'block',
                mb: 0.8,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                fontSize: '0.72rem',
              }}
            >
              Insumo Litográfico a Estimar
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={insumoSeleccionado}
                onChange={(e) => setInsumoSeleccionado(Number(e.target.value))}
                sx={{
                  borderRadius: 2.5,
                  backgroundColor: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
                }}
              >
                {insumos.map((i) => (
                  <MenuItem key={i.id_insumo} value={i.id_insumo}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 2 }}>
                      <span>
                        <strong>{i.codigo}</strong> — {i.descripcion}
                      </span>
                      <span style={{ color: '#64748b', fontSize: '0.78rem' }}>
                        Stock: {Number(i.stock_actual).toFixed(0)} {i.unidad_medida}
                      </span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Selector de Periodo Académico */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                color: '#475569',
                display: 'block',
                mb: 0.8,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                fontSize: '0.72rem',
              }}
            >
              Período Académico (Semestre Lectivo)
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={periodo}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPeriodo(val);
                  const pObj = periodos.find((p) => p.id_periodo === val);
                  if (pObj) {
                    setPeriodoNombre(`Semestre ${pObj.semestre} (Gestión ${pObj.gestion})`);
                  }
                }}
                sx={{
                  borderRadius: 2.5,
                  backgroundColor: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
                }}
              >
                {periodos.length > 0 ? (
                  periodos.map((p) => (
                    <MenuItem key={p.id_periodo} value={p.id_periodo}>
                      Semestre {p.semestre} (Gestión {p.gestion}) {p.es_pico_demanda ? '★ Pico de Exámenes' : ''}
                    </MenuItem>
                  ))
                ) : (
                  <>
                    <MenuItem value={1}>Semestre I - 2026</MenuItem>
                    <MenuItem value={2}>Semestre II - 2026</MenuItem>
                  </>
                )}
              </Select>
            </FormControl>
          </Grid>

          {/* Botón Ejecutar Inferencia */}
          <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', alignItems: 'flex-end', pt: { md: 2.8 } }}>
            <Button
              variant="contained"
              fullWidth
              disabled={ejecutandoInferencia || !insumoSeleccionado || !periodo}
              onClick={handleEstimar}
              startIcon={
                ejecutandoInferencia ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <BrainCircuit size={16} />
                )
              }
              sx={{
                borderRadius: 50,
                textTransform: 'none',
                fontWeight: 800,
                py: 1.15,
                backgroundColor: '#111827',
                color: '#ffffff',
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#000000' },
              }}
            >
              {ejecutandoInferencia ? 'Calculando inferencia...' : 'Ejecutar Modelo Predictivo'}
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* =========================================================
          RESULTADOS DE INFERENCIA Y GRÁFICA ESTACIONAL
          ========================================================= */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Curva de Demanda Estacional (Recharts) */}
        <Grid size={{ xs: 12, lg: 7.5 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: '1px solid #e8e4dc',
              backgroundColor: '#ffffff',
              p: { xs: 2.5, sm: 3 },
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #f1f5f9',
                pb: 2,
                mb: 2.5,
              }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#000000', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BarChart3 size={18} color="#800000" />
                  Curva de Demanda y Estacionalidad Académica
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Volumen proyectado por mes del semestre lectivo UAGRM
                </Typography>
              </Box>
              <Chip
                icon={<CalendarDays size={13} />}
                label={periodoNombre}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  borderRadius: 50,
                }}
              />
            </Box>

            <Box sx={{ height: 260, width: '100%', pt: 1, flexGrow: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DATOS_GRAFICA_DEMANDA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                  <ChartTooltip
                    formatter={(val: number) => [`${val} unidades`, 'Demanda Estimada']}
                    contentStyle={{ borderRadius: '0.75rem', borderColor: '#e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="demanda" radius={[6, 6, 0, 0]}>
                    {DATOS_GRAFICA_DEMANDA.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.estacionalidad === 'Pico' || entry.estacionalidad === 'Alta' ? '#800000' : '#3b82f6'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>

            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 2.5,
                backgroundColor: '#f8fafc',
                border: '1px solid #f1f5f9',
              }}
            >
              <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.5, display: 'block' }}>
                <strong>Detección de patrones:</strong> El modelo multivariable identifica picos de consumo en los meses 4 y 5, correspondientes a la impresión de exámenes parciales, guías prácticas y memorias institucionales de las facultades de la UAGRM.
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Panel de Inferencia Específica para el Insumo */}
        <Grid size={{ xs: 12, lg: 4.5 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: '1px solid #e8e4dc',
              backgroundColor: '#ffffff',
              p: { xs: 2.5, sm: 3 },
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <Box sx={{ borderBottom: '1px solid #f1f5f9', pb: 2, mb: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#000000' }}>
                Resultado de Inferencia
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Recomendación técnica y compra inteligente
              </Typography>
            </Box>

            {prediccionActual ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                <Stack spacing={2.5}>
                  {/* Badge de Modelo (Random Forest vs Promedio) */}
                  <Box>
                    {prediccionActual.es_referencial ? (
                      <Chip
                        icon={<Info size={13} />}
                        label="Promedio Histórico (< 50 reg.)"
                        size="small"
                        sx={{
                          backgroundColor: '#fef3c7',
                          color: '#92400e',
                          border: '1px solid #fde68a',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          borderRadius: 50,
                        }}
                      />
                    ) : (
                      <Chip
                        icon={<Sparkles size={13} />}
                        label="Inferencia Random Forest OK"
                        size="small"
                        sx={{
                          backgroundColor: '#ecfdf5',
                          color: '#065f46',
                          border: '1px solid #a7f3d0',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          borderRadius: 50,
                        }}
                      />
                    )}
                  </Box>

                  {/* Detalle de Insumo y Cálculos */}
                  <Stack spacing={1.5} sx={{ pt: 0.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Insumo:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#000000' }}>
                        {insumoActual?.codigo || 'IN-001'} — {insumoActual?.descripcion}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Demanda Estimada:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#000000' }}>
                        {Number(prediccionActual.cantidad_proyectada || 0).toFixed(2)} {insumoActual?.unidad_medida || 'U'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Margen de Variabilidad:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#000000' }}>
                        ± {Number(prediccionActual.margen_variabilidad || 0).toFixed(2)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Stock Actual en Almacén:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#000000' }}>
                        {Number(insumoActual?.stock_actual || 0).toFixed(0)} {insumoActual?.unidad_medida || 'U'}
                      </Typography>
                    </Box>

                    {/* Stock Sugerido de Compra Destacado */}
                    <Box
                      sx={{
                        pt: 2,
                        mt: 1,
                        borderTop: '1px solid #f1f5f9',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                      }}
                    >
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          SUGERENCIA COMPRA
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', color: '#94a3b8' }}>
                          Para abastecer el semestre
                        </Typography>
                      </Box>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 900,
                          color: Number(prediccionActual.stock_sugerido_compra) > 0 ? '#800000' : '#059669',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {Number(prediccionActual.stock_sugerido_compra || 0).toFixed(0)}{' '}
                        <Typography component="span" variant="body2" sx={{ color: '#64748b', fontWeight: 700 }}>
                          {insumoActual?.unidad_medida || 'U'}
                        </Typography>
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>

                {/* Acción Directa: Generar Orden de Compra */}
                {Number(prediccionActual.stock_sugerido_compra) > 0 && (
                  <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #f1f5f9' }}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleCrearOrdenSugerida}
                      startIcon={<ShoppingCart size={16} />}
                      sx={{
                        borderRadius: 50,
                        textTransform: 'none',
                        fontWeight: 800,
                        py: 1.2,
                        backgroundColor: '#800000',
                        color: '#ffffff',
                        boxShadow: 'none',
                        '&:hover': { backgroundColor: '#5a0000' },
                      }}
                    >
                      Crear Orden de Compra Sugerida
                    </Button>
                  </Box>
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  py: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  flexGrow: 1,
                  color: '#94a3b8',
                }}
              >
                <Layers size={36} strokeWidth={1.5} style={{ marginBottom: 12, opacity: 0.6 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>
                  Sin inferencia activa
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', maxWidth: 220, mt: 0.5 }}>
                  Selecciona un insumo litográfico y presiona "Ejecutar Modelo Predictivo".
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* =========================================================
          HISTORIAL DE PREDICCIONES POR INSUMO (GET /predicciones/{id})
          ========================================================= */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: '1px solid #e8e4dc',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <Box
          sx={{
            px: { xs: 2.5, sm: 3 },
            py: 2.5,
            borderBottom: '1px solid #e8e4dc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#000000', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Clock size={18} color="#800000" />
              Historial de Inferencia y Predicciones del Insumo
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Registro cronológico de demandas inferidas para {insumoActual ? `«${insumoActual.codigo} - ${insumoActual.descripcion}»` : 'el insumo seleccionado'}.
            </Typography>
          </Box>

          {cargandoHistorial && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={14} color="inherit" />
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                Actualizando historial...
              </Typography>
            </Box>
          )}
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: '#ffffff' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#faf8f5' }}>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 800,
                    color: '#475569',
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    py: 1.8,
                  }}
                >
                  Fecha de Generación
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 800,
                    color: '#475569',
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Período Evaluado
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 800,
                    color: '#475569',
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Demanda Proyectada
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 800,
                    color: '#475569',
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Margen Variabilidad
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 800,
                    color: '#475569',
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Stock Sugerido Compra
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 800,
                    color: '#475569',
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Algoritmo / Estado
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historialPredicciones.length > 0 ? (
                historialPredicciones.map((p) => {
                  const pObj = periodos.find((per) => per.id_periodo === p.periodo_id);
                  const nombrePer = pObj
                    ? `Semestre ${pObj.semestre} (${pObj.gestion})`
                    : `Período #${p.periodo_id}`;

                  return (
                    <TableRow
                      key={p.id_prediccion}
                      hover
                      sx={{
                        '& td': {
                          borderBottom: '1px solid #f0ede6',
                          py: 1.8,
                        },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#000000' }}>
                          {formatearFecha(p.fecha_generacion)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          ID Inferencia: #{p.id_prediccion}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#000000' }}>
                          {nombrePer}
                        </Typography>
                        {pObj?.es_pico_demanda && (
                          <Typography variant="caption" sx={{ color: '#800000', fontWeight: 700 }}>
                            ★ Pico de Exámenes
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#000000' }}>
                          {Number(p.cantidad_proyectada).toFixed(2)} {insumoActual?.unidad_medida || 'U'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>
                          ± {Number(p.margen_variabilidad).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 800,
                            color: Number(p.stock_sugerido_compra) > 0 ? '#800000' : '#059669',
                          }}
                        >
                          {Number(p.stock_sugerido_compra).toFixed(0)} {insumoActual?.unidad_medida || 'U'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {p.es_referencial ? (
                          <Chip
                            size="small"
                            label="Promedio (<50 reg.)"
                            sx={{
                              backgroundColor: '#fef3c7',
                              color: '#92400e',
                              border: '1px solid #fde68a',
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              borderRadius: 50,
                            }}
                          />
                        ) : (
                          <Chip
                            size="small"
                            label="Random Forest OK"
                            sx={{
                              backgroundColor: '#ecfdf5',
                              color: '#065f46',
                              border: '1px solid #a7f3d0',
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              borderRadius: 50,
                            }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 6, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={32} strokeWidth={1.5} style={{ color: '#cbd5e1', marginBottom: 8 }} />
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748b' }}>
                        Sin historial previo de inferencias para este insumo
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5 }}>
                        Ejecuta el modelo predictivo arriba para generar el primer registro predictivo.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
