import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts';
import {
  AlertTriangle,
  FileText,
  Printer,
  TrendingUp,
  ArrowRight,
  Plus,
  Calendar,
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';

import { ordenesApi } from '@/api/ordenes.api';
import { proformasApi } from '@/api/proformas.api';
import { useAuth } from '@/hooks/useAuth';
import { useAlertas } from '@/hooks/useAlertas';
import { UAGRM_COLORS } from '@/theme/uagrmTheme';
import type { OrdenTrabajoResponse, ProformaResponse } from '@/types';
import { formatearMoneda, formatearFecha } from '@/utils/formatters';

// Datos de simulacion para la tendencia de produccion y demanda estimada
const DATOS_TENDENCIA_SEMANAL = [
  { dia: 'Lun', produccion: 14, demandaML: 16 },
  { dia: 'Mar', produccion: 22, demandaML: 20 },
  { dia: 'Mie', produccion: 28, demandaML: 25 },
  { dia: 'Jue', produccion: 19, demandaML: 22 },
  { dia: 'Vie', produccion: 35, demandaML: 32 },
  { dia: 'Sab', produccion: 16, demandaML: 18 },
];

// Helper para colores de estados de ordenes con paleta institucional
function getEstadoOrdenChip(estado: string) {
  switch (estado) {
    case 'REGISTRADO':
      return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', label: 'Registrado' };
    case 'EN COLA':
      return { bg: '#fef3c7', color: '#b45309', border: '#fde68a', label: 'En Cola' };
    case 'EN IMPRESION':
      return { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd', label: 'En Impresión' };
    case 'EN ACABADO':
      return { bg: '#f3e8ff', color: '#7e22ce', border: '#e9d5ff', label: 'En Acabado' };
    case 'FINALIZADO':
      return { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0', label: 'Finalizado' };
    case 'ENTREGADO':
      return { bg: '#ccfbf1', color: '#0f766e', border: '#99f6e4', label: 'Entregado' };
    default:
      return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', label: estado };
  }
}

// Helper para colores de estados de proformas
function getEstadoProformaChip(estado: string) {
  switch (estado) {
    case 'EMITIDA':
      return { bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe', label: 'Emitida' };
    case 'APROBADA':
      return { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0', label: 'Aprobada' };
    case 'RECHAZADA':
      return { bg: '#ffe4e6', color: '#e11d48', border: '#fecdd3', label: 'Rechazada' };
    case 'VENCIDA':
      return { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', label: 'Vencida' };
    default:
      return { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', label: estado };
  }
}

export function DashboardPage() {
  const { usuario } = useAuth();
  const { alertas, cantidadAlertas } = useAlertas();

  const [ordenes, setOrdenes] = useState<OrdenTrabajoResponse[]>([]);
  const [proformas, setProformas] = useState<ProformaResponse[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);

  useEffect(() => {
    async function cargarMetricas() {
      try {
        setCargando(true);
        const [resOrdenes, resProformas] = await Promise.all([
          ordenesApi.listar({ por_pagina: 10 }),
          proformasApi.listar({ por_pagina: 10 }),
        ]);
        setOrdenes(resOrdenes.datos || []);
        setProformas(resProformas.datos || []);
      } catch {
        // Silencioso
      } finally {
        setCargando(false);
      }
    }
    cargarMetricas();
  }, []);

  const ordenesActivas = ordenes.filter((o) => o.estado_actual !== 'ENTREGADO');
  const proformasEmitidas = proformas.filter((p) => p.estado === 'EMITIDA');

  // Estilo comun para tarjetas blancas limpias con bordes refinados
  const cardStyle = {
    borderRadius: 3.5,
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 12px rgba(30, 43, 77, 0.04)',
    transition: 'all 0.2s ease',
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pb: 4 }}>
      {/* ===================================================================
          1. ENCABEZADO PRINCIPAL + ACCIONES RAPIDAS
          =================================================================== */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2.5,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            {/* <Chip
              size="small"
              icon={<Sparkles size={13} style={{ color: UAGRM_COLORS.cyan.main }} />}
              label="PANEL DE CONTROL OPERATIVO"
              sx={{
                fontWeight: 800,
                fontSize: '0.68rem',
                letterSpacing: '0.06em',
                backgroundColor: 'rgba(85, 166, 188, 0.1)',
                color: UAGRM_COLORS.cyan.dark,
                border: '1px solid rgba(85, 166, 188, 0.25)',
              }}
            /> */}
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              {/* * Imprenta Universitaria UAGRM */}
            </Typography>
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: UAGRM_COLORS.blue.main,
              letterSpacing: '-0.02em',
              fontSize: { xs: '1.65rem', md: '2rem' },
            }}
          >
            Bienvenido, {usuario?.nombre_completo ? usuario.nombre_completo.replace(/\s*\([^)]*\)/g, '').trim() : 'Administrador'}
          </Typography>

          <Typography variant="body2" sx={{ color: '#334155', mt: 0.5, fontWeight: 500, fontSize: '0.88rem', maxWidth: 650 }}>
            {/* Supervisión integral de trabajos en taller, cotizaciones comerciales y proyección inteligente de insumos con Machine Learning. */}
          </Typography>
        </Box>

        {/* Acciones Rapidas */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            component={Link}
            to="/proformas/nueva"
            variant="contained"
            color="primary"
            startIcon={<Plus size={16} />}
            sx={{
              backgroundColor: UAGRM_COLORS.blue.main,
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.82rem',
              borderRadius: 2.5,
              px: 2.2,
              py: 1,
              boxShadow: '0 4px 14px rgba(30, 43, 77, 0.25)',
              '&:hover': {
                backgroundColor: UAGRM_COLORS.blue.dark,
                transform: 'translateY(-1px)',
              },
            }}
          >
            Nueva Proforma
          </Button>

          <Button
            component={Link}
            to="/ordenes"
            variant="outlined"
            startIcon={<Printer size={16} />}
            sx={{
              borderColor: '#cbd5e1',
              color: UAGRM_COLORS.blue.main,
              fontWeight: 700,
              fontSize: '0.82rem',
              borderRadius: 2.5,
              px: 2.2,
              py: 0.95,
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              '&:hover': {
                borderColor: UAGRM_COLORS.blue.main,
                backgroundColor: 'rgba(30, 43, 77, 0.04)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            Tablero Taller
          </Button>
        </Box>
      </Box>

      {/* ===================================================================
          2. FILA DE KPIS PRINCIPALES (4 TARJETAS OPERATIVAS)
          =================================================================== */}
      <Grid container spacing={2.5}>
        {/* KPI 1: Ordenes en Taller */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              ...cardStyle,
              p: 2.5,
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(30, 43, 77, 0.08)',
                borderColor: '#cbd5e1',
              },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 900, color: '#000000', fontSize: '0.78rem', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                  Órdenes en Taller
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: UAGRM_COLORS.blue.main, mt: 0.5, lineHeight: 1 }}>
                  {ordenesActivas.length}
                </Typography>
                <Typography variant="caption" sx={{ color: '#334155', display: 'block', mt: 0.8, fontWeight: 600, fontSize: '0.80rem' }}>
                  En cola y prensas activas
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  backgroundColor: 'rgba(30, 43, 77, 0.08)',
                  color: UAGRM_COLORS.blue.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Printer size={22} />
              </Box>
            </Box>

            <Divider sx={{ my: 1.8 }} />

            <Box
              component={Link}
              to="/ordenes"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.8,
                fontSize: '0.78rem',
                fontWeight: 700,
                color: UAGRM_COLORS.blue.main,
                textDecoration: 'none',
                '&:hover': {
                  color: UAGRM_COLORS.red.main,
                },
              }}
            >
              Ver flujo de trabajo <ArrowRight size={13} />
            </Box>
          </Card>
        </Grid>

        {/* KPI 2: Proformas Pendientes */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              ...cardStyle,
              p: 2.5,
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(30, 43, 77, 0.08)',
                borderColor: '#cbd5e1',
              },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 900, color: '#000000', fontSize: '0.78rem', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                  Proformas Activas
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: UAGRM_COLORS.blue.main, mt: 0.5, lineHeight: 1 }}>
                  {proformasEmitidas.length}
                </Typography>
                <Typography variant="caption" sx={{ color: '#334155', display: 'block', mt: 0.8, fontWeight: 600, fontSize: '0.80rem' }}>
                  Cotizaciones emitidas
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  backgroundColor: 'rgba(85, 166, 188, 0.12)',
                  color: UAGRM_COLORS.cyan.dark,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileText size={22} />
              </Box>
            </Box>

            <Divider sx={{ my: 1.8 }} />

            <Box
              component={Link}
              to="/proformas"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.8,
                fontSize: '0.78rem',
                fontWeight: 700,
                color: UAGRM_COLORS.cyan.dark,
                textDecoration: 'none',
                '&:hover': {
                  color: UAGRM_COLORS.blue.main,
                },
              }}
            >
              Revisar cotizaciones <ArrowRight size={13} />
            </Box>
          </Card>
        </Grid>

        {/* KPI 3: Stock Critico */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              ...cardStyle,
              p: 2.5,
              position: 'relative',
              overflow: 'hidden',
              borderColor: cantidadAlertas > 0 ? '#fecaca' : '#e2e8f0',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(128, 0, 0, 0.08)',
              },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 900, color: '#000000', fontSize: '0.78rem', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                  Stock Crítico
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: cantidadAlertas > 0 ? UAGRM_COLORS.red.main : '#10b981', mt: 0.5, lineHeight: 1 }}>
                  {cantidadAlertas}
                </Typography>
                <Typography variant="caption" sx={{ color: '#334155', display: 'block', mt: 0.8, fontWeight: 600, fontSize: '0.80rem' }}>
                  {cantidadAlertas > 0 ? 'Bajo el umbral mínimo' : 'Inventario en nivel óptimo'}
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  backgroundColor: cantidadAlertas > 0 ? 'rgba(128, 0, 0, 0.09)' : 'rgba(16, 185, 129, 0.1)',
                  color: cantidadAlertas > 0 ? UAGRM_COLORS.red.main : '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle size={22} />
              </Box>
            </Box>

            <Divider sx={{ my: 1.8 }} />

            <Box
              component={Link}
              to="/insumos/alertas"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.8,
                fontSize: '0.78rem',
                fontWeight: 700,
                color: cantidadAlertas > 0 ? UAGRM_COLORS.red.main : '#059669',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Ver insumos en riesgo <ArrowRight size={13} />
            </Box>
          </Card>
        </Grid>

        {/* KPI 4: Machine Learning */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              ...cardStyle,
              p: 2.5,
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #ffffff 60%, rgba(85, 166, 188, 0.07) 100%)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(30, 43, 77, 0.08)',
                borderColor: '#cbd5e1',
              },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 900, color: '#000000', fontSize: '0.78rem', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                  Precisión Modelo ML
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#0f766e', mt: 0.5, lineHeight: 1 }}>
                  94.8%
                </Typography>
                <Typography variant="caption" sx={{ color: '#334155', display: 'block', mt: 0.8, fontWeight: 600, fontSize: '0.80rem' }}>
                  RandomForestRegressor v1.2
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  backgroundColor: 'rgba(15, 118, 110, 0.1)',
                  color: '#0f766e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BrainCircuit size={22} />
              </Box>
            </Box>

            <Divider sx={{ my: 1.8 }} />

            <Box
              component={Link}
              to="/predicciones"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.8,
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#0f766e',
                textDecoration: 'none',
                '&:hover': {
                  color: UAGRM_COLORS.blue.main,
                },
              }}
            >
              Proyección de demanda <ArrowRight size={13} />
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* ===================================================================
          3. SECCION CENTRAL DIVIDIDA:
             - IZQUIERDA (8 cols): ORDENES EN CURSO + GRAFICO TENDENCIA
             - DERECHA (4 cols): ALERTAS CRITICAS + WIDGET PREDICTIVO ML
          =================================================================== */}
      <Grid container spacing={3}>
        {/* COLUMNA IZQUIERDA */}
        <Grid size={{ xs: 12, lg: 8 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Card A: Ordenes de Trabajo en Curso */}
          <Card sx={cardStyle}>
            <Box
              sx={{
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 2,
                    backgroundColor: 'rgba(128, 0, 0, 0.08)',
                    color: UAGRM_COLORS.red.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Printer size={20} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#000000', lineHeight: 1.2 }}>
                    Órdenes de Trabajo en Taller
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 500, fontSize: '0.82rem' }}>
                    Trabajos activos en prensas, litografía y acabados
                  </Typography>
                </Box>
              </Box>

              <Button
                component={Link}
                to="/ordenes"
                size="small"
                endIcon={<ArrowUpRight size={14} />}
                sx={{
                  color: UAGRM_COLORS.red.main,
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(128, 0, 0, 0.04)',
                  },
                }}
              >
                Ver tablero Kanban
              </Button>
            </Box>

            {cargando ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress size={30} sx={{ color: UAGRM_COLORS.blue.main }} />
              </Box>
            ) : ordenesActivas.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <CheckCircle2 size={36} style={{ color: '#10b981', margin: '0 auto 8px' }} />
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  No hay órdenes pendientes en este momento.
                </Typography>
              </Box>
            ) : (
              <Box>
                {ordenesActivas.slice(0, 4).map((orden) => {
                  const chipEstado = getEstadoOrdenChip(orden.estado_actual);
                  const esUrgente = orden.prioridad === 'URGENTE';

                  return (
                    <Box
                      key={orden.id_orden}
                      sx={{
                        p: 2.2,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        justifyContent: 'space-between',
                        gap: 1.5,
                        transition: 'background-color 0.15s ease',
                        borderBottom: '1px solid #f1f5f9',
                        '&:hover': {
                          backgroundColor: '#f8fafc',
                        },
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.4 }}>
                          <Typography
                            component="span"
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: 800,
                              fontSize: '0.82rem',
                              color: UAGRM_COLORS.red.main,
                            }}
                          >
                            {orden.codigo_ot}
                          </Typography>

                          <Chip
                            size="small"
                            label={orden.prioridad}
                            sx={{
                              height: 19,
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              backgroundColor: esUrgente ? '#fee2e2' : '#f1f5f9',
                              color: esUrgente ? '#dc2626' : '#475569',
                              border: esUrgente ? '1px solid #fecaca' : '1px solid #e2e8f0',
                            }}
                          />
                        </Box>

                        <Typography variant="body2" sx={{ fontWeight: 700, color: UAGRM_COLORS.blue.main }} noWrap>
                          {orden.proforma?.detalles?.[0]?.descripcion_trabajo || 'Trabajo de Imprenta Universitaria'}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.4 }}>
                          <Calendar size={12} style={{ color: '#94a3b8' }} />
                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                            Compromiso: {formatearFecha(orden.fecha_compromiso)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Estado y accion */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, alignSelf: { xs: 'flex-end', sm: 'center' } }}>
                        <Chip
                          size="small"
                          label={chipEstado.label}
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.70rem',
                            backgroundColor: chipEstado.bg,
                            color: chipEstado.color,
                            border: `1px solid ${chipEstado.border}`,
                          }}
                        />

                        <Tooltip title="Ver detalles de OT">
                          <Button
                            component={Link}
                            to={`/ordenes`}
                            size="small"
                            sx={{
                              minWidth: 32,
                              width: 32,
                              height: 32,
                              p: 0,
                              borderRadius: '50%',
                              backgroundColor: '#f1f5f9',
                              color: UAGRM_COLORS.blue.main,
                              '&:hover': {
                                backgroundColor: UAGRM_COLORS.blue.main,
                                color: '#ffffff',
                              },
                            }}
                          >
                            <ChevronRight size={16} />
                          </Button>
                        </Tooltip>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Card>

          {/* Card B: Grafico de Tendencia de Produccion y Demanda de Insumos */}
          <Card sx={{ ...cardStyle, p: 2.5 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 1.5,
                mb: 2.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 2,
                    backgroundColor: 'rgba(85, 166, 188, 0.12)',
                    color: UAGRM_COLORS.cyan.dark,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrendingUp size={20} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#000000', lineHeight: 1.2 }}>
                    Flujo de Producción vs Demanda Proyectada
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 500, fontSize: '0.82rem' }}>
                    Comparativa de trabajos procesados y estimación del modelo de Machine Learning
                  </Typography>
                </Box>
              </Box>

              {/* Leyenda interactiva */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: UAGRM_COLORS.red.main }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.72rem' }}>
                    Producción Real
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: UAGRM_COLORS.blue.main }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.72rem' }}>
                    Demanda ML
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Contenedor del Grafico Recharts */}
            <Box sx={{ width: '100%', height: 230, mt: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DATOS_TENDENCIA_SEMANAL} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={UAGRM_COLORS.red.main} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={UAGRM_COLORS.red.main} stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorML" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={UAGRM_COLORS.blue.main} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={UAGRM_COLORS.blue.main} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="dia"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 14px rgba(30, 43, 77, 0.08)',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="produccion"
                    name="Producción Real"
                    stroke={UAGRM_COLORS.red.main}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorProd)"
                  />
                  <Area
                    type="monotone"
                    dataKey="demandaML"
                    name="Demanda ML"
                    stroke={UAGRM_COLORS.blue.main}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorML)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* COLUMNA DERECHA: ALERTAS CRITICAS + PREDICCION ML */}
        <Grid size={{ xs: 12, lg: 4 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Card C: Alertas de Stock Critico */}
          <Card
            sx={{
              ...cardStyle,
              borderColor: cantidadAlertas > 0 ? '#fecaca' : '#e2e8f0',
            }}
          >
            <Box
              sx={{
                p: 2.2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #f1f5f9',
                backgroundColor: cantidadAlertas > 0 ? 'rgba(128, 0, 0, 0.02)' : 'transparent',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 2,
                    backgroundColor: cantidadAlertas > 0 ? 'rgba(128, 0, 0, 0.09)' : 'rgba(16, 185, 129, 0.1)',
                    color: cantidadAlertas > 0 ? UAGRM_COLORS.red.main : '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AlertTriangle size={18} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#000000', lineHeight: 1.2 }}>
                    Insumos en Riesgo Crítico
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 500, fontSize: '0.82rem' }}>
                    Reposición de papel, tintas y químicos
                  </Typography>
                </Box>
              </Box>

              <Chip
                size="small"
                label={cantidadAlertas}
                sx={{
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  height: 22,
                  backgroundColor: cantidadAlertas > 0 ? '#fee2e2' : '#dcfce7',
                  color: cantidadAlertas > 0 ? '#dc2626' : '#15803d',
                }}
              />
            </Box>

            <Box sx={{ p: 2 }}>
              {cantidadAlertas === 0 ? (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <CheckCircle2 size={30} style={{ color: '#10b981', margin: '0 auto 6px' }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#15803d' }}>
                    Inventario en estado saludable
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                    Todos los insumos superan el umbral mínimo de seguridad.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
                  {alertas.slice(0, 3).map((item) => {
                    const porcentaje = Math.min(
                      100,
                      Math.round((item.stock_actual / (item.stock_minimo || 1)) * 100)
                    );

                    return (
                      <Box
                        key={item.id_insumo}
                        sx={{
                          p: 1.4,
                          borderRadius: 2.2,
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.6 }}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: UAGRM_COLORS.blue.main, fontSize: '0.82rem' }} noWrap>
                              {item.descripcion}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.70rem' }}>
                              Cód: {item.codigo} • {item.categoria?.nombre || 'General'}
                            </Typography>
                          </Box>
                          <Chip
                            size="small"
                            label={`${item.stock_actual} ${item.unidad_medida}`}
                            sx={{
                              height: 20,
                              fontWeight: 800,
                              fontSize: '0.65rem',
                              backgroundColor: '#fee2e2',
                              color: '#b91c1c',
                            }}
                          />
                        </Box>

                        {/* Barra de progreso de stock critico */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.8 }}>
                          <LinearProgress
                            variant="determinate"
                            value={porcentaje}
                            sx={{
                              flexGrow: 1,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: '#fee2e2',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: '#dc2626',
                                borderRadius: 3,
                              },
                            }}
                          />
                          <Typography variant="caption" sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#dc2626' }}>
                            Mín: {item.stock_minimo}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}

                  <Button
                    component={Link}
                    to="/insumos/alertas"
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{
                      mt: 0.5,
                      borderColor: UAGRM_COLORS.red.main,
                      color: UAGRM_COLORS.red.main,
                      fontWeight: 700,
                      fontSize: '0.76rem',
                      borderRadius: 50,
                      '&:hover': {
                        borderColor: UAGRM_COLORS.red.dark,
                        backgroundColor: 'rgba(128, 0, 0, 0.04)',
                      },
                    }}
                  >
                    Gestionar Alertas de Insumos
                  </Button>
                </Box>
              )}
            </Box>
          </Card>

          {/* Card D: Asistente Predictivo de Insumos (Machine Learning) */}
          <Card
            sx={{
              ...cardStyle,
              p: 2.4,
              background: 'linear-gradient(135deg, rgba(30, 43, 77, 0.03) 0%, rgba(85, 166, 188, 0.09) 100%)',
              borderColor: 'rgba(85, 166, 188, 0.35)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 2,
                  backgroundColor: 'rgba(85, 166, 188, 0.15)',
                  color: UAGRM_COLORS.cyan.dark,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BrainCircuit size={20} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#000000', lineHeight: 1.2 }}>
                  Proyección Predictiva ML
                </Typography>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 500, fontSize: '0.82rem' }}>
                  Estimación basada en trabajos históricos
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                p: 1.6,
                borderRadius: 2.2,
                backgroundColor: '#ffffff',
                border: '1px solid rgba(85, 166, 188, 0.25)',
                boxShadow: '0 2px 8px rgba(30, 43, 77, 0.03)',
                mb: 1.8,
              }}
            >
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                Insumo de mayor consumo previsto:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: UAGRM_COLORS.blue.main, mt: 0.2 }}>
                Papel Bond 75g (Resma Oficio)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                  Demanda estimada:
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: UAGRM_COLORS.red.main, fontSize: '0.80rem' }}>
                  ~120 Resmas
                </Typography>
              </Box>
            </Box>

            <Button
              component={Link}
              to="/predicciones"
              variant="contained"
              size="small"
              fullWidth
              startIcon={<Sparkles size={14} />}
              sx={{
                backgroundColor: UAGRM_COLORS.blue.main,
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.78rem',
                borderRadius: 2,
                py: 0.9,
                '&:hover': {
                  backgroundColor: UAGRM_COLORS.blue.dark,
                },
              }}
            >
              Calcular Nueva Predicción ML
            </Button>
          </Card>
        </Grid>
      </Grid>

      {/* ===================================================================
          4. FILA INFERIOR: ULTIMAS COTIZACIONES Y PROFORMAS COMERCIALES
          =================================================================== */}
      <Card sx={cardStyle}>
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 1.5,
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                backgroundColor: 'rgba(85, 166, 188, 0.12)',
                color: UAGRM_COLORS.cyan.dark,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={20} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#000000', lineHeight: 1.2 }}>
                Últimas Cotizaciones y Proformas Comerciales
              </Typography>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 500, fontSize: '0.82rem' }}>
                Presupuestos recientes generados para facultades, direcciones y clientes externos
              </Typography>
            </Box>
          </Box>

          <Button
            component={Link}
            to="/proformas"
            size="small"
            endIcon={<ArrowUpRight size={14} />}
            sx={{
              color: UAGRM_COLORS.blue.main,
              fontWeight: 700,
              fontSize: '0.78rem',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgba(30, 43, 77, 0.04)',
                color: UAGRM_COLORS.red.main,
              },
            }}
          >
            Ver todas las cotizaciones
          </Button>
        </Box>

        {cargando ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={30} sx={{ color: UAGRM_COLORS.blue.main }} />
          </Box>
        ) : proformas.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              No hay cotizaciones registradas recientemente.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="medium">
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Código
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Cliente / Razón Social
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Detalle del Pedido
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>
                    Total Presupuesto
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'center' }}>
                    Estado
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>
                    Acción
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {proformas.slice(0, 5).map((proforma) => {
                  const chipEstado = getEstadoProformaChip(proforma.estado);

                  return (
                    <TableRow
                      key={proforma.id_proforma}
                      sx={{
                        transition: 'background-color 0.15s ease',
                        '&:hover': {
                          backgroundColor: '#f8fafc',
                        },
                      }}
                    >
                      {/* Codigo */}
                      <TableCell sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>
                        {proforma.codigo_proforma}
                      </TableCell>

                      {/* Cliente */}
                      <TableCell sx={{ color: '#334155', fontWeight: 600, fontSize: '0.82rem' }}>
                        {proforma.cliente?.razon_social || `Cliente #${proforma.cliente_id}`}
                      </TableCell>

                      {/* Detalle */}
                      <TableCell sx={{ color: '#64748b', fontSize: '0.80rem' }}>
                        {proforma.detalles?.[0]?.descripcion_trabajo || 'Presupuesto de imprenta'}
                      </TableCell>

                      {/* Total */}
                      <TableCell sx={{ textAlign: 'right', fontWeight: 900, color: UAGRM_COLORS.red.main, fontSize: '0.90rem' }}>
                        {formatearMoneda(proforma.total_presupuesto)}
                      </TableCell>

                      {/* Estado */}
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip
                          size="small"
                          label={chipEstado.label}
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.68rem',
                            backgroundColor: chipEstado.bg,
                            color: chipEstado.color,
                            border: `1px solid ${chipEstado.border}`,
                          }}
                        />
                      </TableCell>

                      {/* Accion */}
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Button
                          component={Link}
                          to={`/proformas`}
                          size="small"
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: UAGRM_COLORS.blue.main,
                            textTransform: 'none',
                            '&:hover': {
                              color: UAGRM_COLORS.red.main,
                            },
                          }}
                        >
                          Ver detalle
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
}

export default DashboardPage;
