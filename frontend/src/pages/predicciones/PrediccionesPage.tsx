import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import {
  BrainCircuit,
  TrendingUp,
  RefreshCw,
  Printer,
  Sparkles,
  Layers,
  AlertTriangle,
  CalendarDays,
} from 'lucide-react';

import { usePredicciones } from '@/hooks/usePredicciones';
import { useAlertas } from '@/hooks/useAlertas';
import { Button, Table, KpiCard, Badge, type Column } from '@/components/ui';
import { GraficoDemanda, MetricasMLCard } from './components';
import { UAGRM_TOKENS } from '@/theme/tokens';
import type { PrediccionDemandaResponse } from '@/types';
import { formatearFecha } from '@/utils/formatters';

export function PrediccionesPage() {
  const navigate = useNavigate();
  const { cantidadAlertas } = useAlertas();

  const {
    insumos,
    insumoSeleccionado,
    setInsumoSeleccionado,
    insumoActual,
    periodos,
    periodo,
    setPeriodo,
    periodoNombre,
    prediccionActual,
    historialPredicciones,
    cargandoHistorial,
    ejecutandoInferencia,
    reentrenando,
    mensajeExito,
    setMensajeExito,
    error,
    setError,
    estimarDemanda,
    reentrenarModelo,
  } = usePredicciones();

  const handleCrearOrdenSugerida = () => {
    if (!prediccionActual || !insumoActual) return;
    navigate('/compras/nueva', {
      state: {
        insumo_id: insumoActual.id_insumo,
        insumo_nombre: `${insumoActual.codigo} - ${insumoActual.descripcion}`,
        cantidad_sugerida: Math.ceil(prediccionActual.stock_sugerido_compra),
        total_estimado:
          Math.ceil(prediccionActual.stock_sugerido_compra) *
          Number(insumoActual.costo_reposicion || 10),
      },
    });
  };

  const columnasHistorial: Column<PrediccionDemandaResponse>[] = useMemo(
    () => [
      {
        id: 'fecha_generacion',
        label: 'FECHA INFERENCIA',
        width: 170,
        render: (item) => (
          <Typography sx={{ color: UAGRM_TOKENS.colors.charcoal, fontWeight: 600, fontSize: '0.85rem' }}>
            {formatearFecha(item.fecha_generacion)}
          </Typography>
        ),
      },
      {
        id: 'cantidad_proyectada',
        label: 'DEMANDA ESTIMADA',
        align: 'right',
        width: 160,
        render: (item) => (
          <Typography sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primaryDark, fontSize: '0.88rem' }}>
            {Math.ceil(item.cantidad_proyectada)} {insumoActual?.unidad_medida || 'u.'}
          </Typography>
        ),
      },
      {
        id: 'margen_variabilidad',
        label: 'MARGEN ±',
        align: 'right',
        width: 140,
        render: (item) => (
          <Typography sx={{ color: UAGRM_TOKENS.colors.charcoal, fontWeight: 600, fontSize: '0.85rem' }}>
            ±{Math.ceil(item.margen_variabilidad)} {insumoActual?.unidad_medida || 'u.'}
          </Typography>
        ),
      },
      {
        id: 'stock_sugerido_compra',
        label: 'COMPRA SUGERIDA',
        align: 'right',
        width: 160,
        render: (item) => (
          <Typography sx={{ fontWeight: 800, color: item.stock_sugerido_compra > 0 ? UAGRM_TOKENS.colors.ruby : UAGRM_TOKENS.colors.emerald, fontSize: '0.88rem' }}>
            {Math.ceil(item.stock_sugerido_compra)} {insumoActual?.unidad_medida || 'u.'}
          </Typography>
        ),
      },
      {
        id: 'es_referencial',
        label: 'TIPO MODELO',
        align: 'center',
        width: 160,
        render: (item) => (
          <Badge variant={item.es_referencial ? 'warning' : 'success'}>
            {item.es_referencial ? 'Referencial' : 'Calibrado'}
          </Badge>
        ),
      },
    ],
    [insumoActual]
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 }, backgroundColor: UAGRM_TOKENS.background.default, minHeight: '100%' }}>
      {/* 1. Encabezado de la Página */}
      <Box sx={{ mb: 3.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <BrainCircuit size={28} color={UAGRM_TOKENS.colors.ruby} />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 780,
                color: UAGRM_TOKENS.colors.primaryDark,
                letterSpacing: '-0.02em',
              }}
            >
              Predicción de Demanda Litográfica (ML)
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.925rem' }}>
            Inferencia predictiva y re-entrenamiento continuo de Random Forest según la estacionalidad académica de la UAGRM.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="outline"
            onClick={() => window.print()}
            icon={<Printer size={16} />}
          >
            Exportar
          </Button>

          <Button
            variant="default"
            onClick={reentrenarModelo}
            disabled={reentrenando}
            loading={reentrenando}
            icon={<RefreshCw size={16} className={reentrenando ? 'animate-spin' : ''} />}
          >
            Re-entrenar Modelo ML
          </Button>
        </Stack>
      </Box>

      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {mensajeExito && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setMensajeExito(null)}>
          {mensajeExito}
        </Alert>
      )}

      {/* 2. Tarjetas Métricas de Estado ML */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            title="Algoritmo Predictivo"
            value="Random Forest"
            icon={<Layers size={22} />}
            color="primary"
            subtitle="Regresor multivariado calibrado"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            title="Confiabilidad Histórica"
            value="82.7%"
            icon={<TrendingUp size={22} />}
            color="secondary"
            subtitle="Métrica de precisión R² Score"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            title="Insumos en Alerta"
            value={cantidadAlertas}
            icon={<AlertTriangle size={22} />}
            color={cantidadAlertas > 0 ? 'warning' : 'accent'}
            subtitle="Próximos a quiebre de stock"
          />
        </Grid>
      </Grid>

      {/* 3. Panel de Configuración de Inferencia (Selectores de Parámetros) */}
      <Box
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: `${UAGRM_TOKENS.radii.xl}px`,
          border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
          backgroundColor: UAGRM_TOKENS.colors.background.paper,
          boxShadow: UAGRM_TOKENS.shadows.card,
          mb: 3.5,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primaryDark, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <CalendarDays size={18} color={UAGRM_TOKENS.colors.royalBlue} />
          Parámetros para la Estimación de Demanda
        </Typography>

        <Grid container spacing={2.5} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Insumo Litográfico a Evaluar *"
              value={insumoSeleccionado}
              onChange={(e) => setInsumoSeleccionado(Number(e.target.value))}
            >
              {insumos.map((i) => (
                <MenuItem key={i.id_insumo} value={i.id_insumo}>
                  {i.codigo} — {i.descripcion} (Stock: {Number(i.stock_actual).toLocaleString()} {i.unidad_medida})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Periodo Académico Semestral *"
              value={periodo}
              onChange={(e) => setPeriodo(Number(e.target.value))}
            >
              {periodos.map((p) => (
                <MenuItem key={p.id_periodo} value={p.id_periodo}>
                  Semestre {p.semestre} — Gestión {p.gestion}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Button
              variant="default"
              fullWidth
              onClick={estimarDemanda}
              disabled={ejecutandoInferencia || !insumoSeleccionado || !periodo}
              loading={ejecutandoInferencia}
              icon={<Sparkles size={16} />}
            >
              Calcular Predicción ML
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* 4. Resultados de Inferencia y Gráfica Estacional */}
      <Grid container spacing={3} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <MetricasMLCard
            prediccion={prediccionActual}
            insumo={insumoActual}
            periodoNombre={periodoNombre}
            onGenerarCompra={handleCrearOrdenSugerida}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <GraficoDemanda />
        </Grid>
      </Grid>

      {/* 5. Historial de Predicciones del Insumo Evaluado */}
      <Box sx={{ mt: 2 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primaryDark, mb: 1.5 }}
        >
          Historial de Inferencia para: {insumoActual?.descripcion || 'Material'}
        </Typography>

        <Table<PrediccionDemandaResponse>
          columns={columnasHistorial}
          data={historialPredicciones}
          keyExtractor={(item) => String(item.id_prediccion || item.fecha_generacion)}
          isLoading={cargandoHistorial}
          emptyMessage="No existen registros previos de inferencia para este insumo. Presione «Calcular Predicción ML» para generar una nueva."
        />
      </Box>
    </Box>
  );
}

export default PrediccionesPage;
