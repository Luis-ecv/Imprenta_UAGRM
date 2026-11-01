import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import {
  Layers,
  AlertTriangle,
  TrendingDown,
  Plus,
  Edit2,
  PackagePlus,
  RefreshCw,
  FolderPlus,
} from 'lucide-react';

import { useInsumos } from '@/hooks/useInsumos';
import { Button, KpiCard, SearchInput, Badge, Table, FilterTabs, type Column } from '@/components/ui';
import { UAGRM_TOKENS } from '@/theme/tokens';
import type { InsumoResponse } from '@/types';
import { formatearMoneda } from '@/utils/formatters';

import {
  MovimientoModal,
  CategoriaModal,
  InsumoModal,
} from './components';

export function InsumosPage() {
  const {
    categoriasDb,
    tabsCategoria,
    metricas,
    insumosFiltrados,
    cargando,
    guardandoInsumo,
    guardandoMovimiento,
    guardandoCategoria,
    error,
    mensajeExito,
    setError,
    setMensajeExito,
    busqueda,
    setBusqueda,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    cargarInsumos,
    guardarInsumo,
    registrarMovimiento,
    crearCategoria,
  } = useInsumos();

  // Estados de control de modales
  const [insumoParaMovimiento, setInsumoParaMovimiento] = useState<InsumoResponse | null>(null);
  const [modalCategoriaAbierto, setModalCategoriaAbierto] = useState<boolean>(false);
  const [modalInsumoAbierto, setModalInsumoAbierto] = useState<boolean>(false);
  const [insumoEditando, setInsumoEditando] = useState<InsumoResponse | null>(null);

  const abrirModalCrear = () => {
    setInsumoEditando(null);
    setModalInsumoAbierto(true);
  };

  const abrirModalEditar = (insumo: InsumoResponse) => {
    setInsumoEditando(insumo);
    setModalInsumoAbierto(true);
  };

  // Definición centralizada de columnas para el componente <Table />
  const columnas: Column<InsumoResponse>[] = useMemo(
    () => [
      {
        id: 'codigo',
        label: 'CÓDIGO',
        width: 140,
        render: (item) => (
          <Typography sx={{ fontWeight: 780, color: UAGRM_TOKENS.colors.primaryDark, fontSize: '0.88rem' }}>
            {item.codigo}
          </Typography>
        ),
      },
      {
        id: 'descripcion',
        label: 'DESCRIPCIÓN / ESPECIFICACIONES',
        render: (item) => (
          <Typography sx={{ fontWeight: 600, color: UAGRM_TOKENS.colors.charcoal, fontSize: '0.88rem' }}>
            {item.descripcion}
          </Typography>
        ),
      },
      {
        id: 'categoria',
        label: 'CATEGORÍA',
        width: 180,
        render: (item) => (
          <Badge variant="info">
            {item.categoria?.nombre || 'General'}
          </Badge>
        ),
      },
      {
        id: 'stock_actual',
        label: 'STOCK ACTUAL',
        align: 'right',
        width: 140,
        render: (item) => (
          <Typography sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primaryDark, fontSize: '0.9rem' }}>
            {Number(item.stock_actual).toLocaleString()} {item.unidad_medida}
          </Typography>
        ),
      },
      {
        id: 'stock_minimo',
        label: 'STOCK MÍN.',
        align: 'right',
        width: 130,
        render: (item) => (
          <Typography sx={{ color: UAGRM_TOKENS.colors.slate, fontWeight: 600, fontSize: '0.85rem' }}>
            {Number(item.stock_minimo).toLocaleString()} {item.unidad_medida}
          </Typography>
        ),
      },
      {
        id: 'costo_reposicion',
        label: 'COSTO REPOSICIÓN',
        align: 'right',
        width: 150,
        render: (item) => (
          <Typography sx={{ color: UAGRM_TOKENS.colors.primaryDark, fontWeight: 750, fontSize: '0.88rem' }}>
            {formatearMoneda(item.costo_reposicion)}
          </Typography>
        ),
      },
      {
        id: 'estado',
        label: 'ESTADO',
        align: 'center',
        width: 120,
        render: (item) => {
          const stock = Number(item.stock_actual);
          const min = Number(item.stock_minimo);
          const esCritico = stock <= min;
          const esAlerta = !esCritico && stock <= min * 1.5;
          return (
            <Badge variant={esCritico ? 'error' : esAlerta ? 'warning' : 'success'}>
              {esCritico ? 'Crítico' : esAlerta ? 'Alerta' : 'Normal'}
            </Badge>
          );
        },
      },
      {
        id: 'acciones',
        label: 'ACCIONES',
        align: 'right',
        width: 110,
        render: (item) => (
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
            <Tooltip title="Registrar movimiento (Ingreso / Ajuste / Merma)">
              <IconButton
                size="small"
                onClick={() => setInsumoParaMovimiento(item)}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
                  backgroundColor: UAGRM_TOKENS.colors.background.paper,
                  color: UAGRM_TOKENS.colors.charcoal,
                  '&:hover': {
                    backgroundColor: UAGRM_TOKENS.colors.background.subtle,
                    color: UAGRM_TOKENS.colors.primaryDark,
                  },
                }}
              >
                <PackagePlus size={16} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Editar insumo">
              <IconButton
                size="small"
                onClick={() => abrirModalEditar(item)}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
                  backgroundColor: UAGRM_TOKENS.colors.background.paper,
                  color: UAGRM_TOKENS.colors.charcoal,
                  '&:hover': {
                    backgroundColor: UAGRM_TOKENS.colors.background.subtle,
                    color: UAGRM_TOKENS.colors.primaryDark,
                  },
                }}
              >
                <Edit2 size={16} />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    []
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 }, backgroundColor: UAGRM_TOKENS.background.default, minHeight: '100%' }}>
      {/* 1. Encabezado de la Página */}
      <Box sx={{ mb: 3.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 780,
              color: UAGRM_TOKENS.colors.primaryDark,
              letterSpacing: '-0.02em',
              mb: 0.5,
            }}
          >
            Insumos y Materiales
          </Typography>
          <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.925rem' }}>
            Control de stocks, costos de reposición y movimientos de inventario litográfico.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="outline"
            onClick={cargarInsumos}
            disabled={cargando}
            icon={<RefreshCw size={16} className={cargando ? 'animate-spin' : ''} />}
          >
            Actualizar
          </Button>

          <Button
            variant="secondary"
            component={Link}
            to="/insumos/alertas"
            icon={<AlertTriangle size={17} />}
            style={{
              color: UAGRM_TOKENS.colors.ruby,
              borderColor: UAGRM_TOKENS.border.danger,
              backgroundColor: UAGRM_TOKENS.colors.status.error.light,
            }}
          >
            Stock Crítico ({metricas.critico})
          </Button>

          <Button
            variant="outline"
            onClick={() => setModalCategoriaAbierto(true)}
            icon={<FolderPlus size={16} />}
          >
            Nueva Categoría
          </Button>

          <Button
            variant="default"
            onClick={abrirModalCrear}
            icon={<Plus size={18} />}
          >
            Nuevo Insumo
          </Button>
        </Stack>
      </Box>

      {/* Alertas globales de error o éxito */}
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

      {/* 2. Tarjetas Métricas Superiores (3 KPIs) */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            title="Total Insumos"
            value={metricas.total}
            icon={<Layers size={22} />}
            color="primary"
            trendLabel="Catálogo activo"
            trendPositive={true}
            subtitle="Materiales e insumos registrados"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            title="Stock en Alerta"
            value={metricas.alerta}
            icon={<TrendingDown size={22} />}
            color="warning"
            trendLabel={metricas.alerta > 0 ? 'Reposición próxima' : 'Sin alertas'}
            trendPositive={metricas.alerta === 0}
            subtitle="Cercanos al umbral mínimo (≤1.5x)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            title="Stock Crítico"
            value={metricas.critico}
            icon={<AlertTriangle size={22} />}
            color="error"
            trendLabel={metricas.critico > 0 ? 'Riesgo de quiebre' : 'Óptimo'}
            trendPositive={metricas.critico === 0}
            subtitle="Por debajo del stock de seguridad"
          />
        </Grid>
      </Grid>

      {/* 3. Búsqueda y Navegación por Pestañas (Diseño Original Estandarizado) */}
      <Box sx={{ mb: 2.5 }}>
        <SearchInput
          value={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar insumos por código, descripción o categoría..."
          maxWidth={{ xs: '100%', md: 740 }}
        />

        <Box sx={{ mt: 2.5 }}>
          <FilterTabs
            tabs={tabsCategoria}
            activeTab={categoriaSeleccionada}
            onTabChange={setCategoriaSeleccionada}
          />
        </Box>
      </Box>

      {/* 4. Tabla Institucional Reutilizable (<Table />) */}
      <Table<InsumoResponse>
        columns={columnas}
        data={insumosFiltrados}
        keyExtractor={(item) => item.id_insumo}
        isLoading={cargando}
        emptyMessage={
          busqueda
            ? 'No hay registros que coincidan con los criterios de búsqueda.'
            : 'El catálogo está vacío. Comience agregando un nuevo insumo.'
        }
      />

      {/* Modales modulares desacoplados (construidos sobre el componente <Modal /> centralizado) */}
      <MovimientoModal
        insumo={insumoParaMovimiento}
        guardando={guardandoMovimiento}
        onClose={() => setInsumoParaMovimiento(null)}
        onSubmit={registrarMovimiento}
      />

      <CategoriaModal
        open={modalCategoriaAbierto}
        guardando={guardandoCategoria}
        onClose={() => setModalCategoriaAbierto(false)}
        onSubmit={crearCategoria}
      />

      <InsumoModal
        open={modalInsumoAbierto}
        insumoEditando={insumoEditando}
        categorias={categoriasDb}
        guardando={guardandoInsumo}
        onClose={() => setModalInsumoAbierto(false)}
        onSubmit={guardarInsumo}
      />
    </Box>
  );
}
