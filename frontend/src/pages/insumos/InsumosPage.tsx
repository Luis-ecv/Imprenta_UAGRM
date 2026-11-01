import { useState } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
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
import { Button, KpiCard, SearchInput, Badge } from '@/components/ui';
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

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 }, backgroundColor: UAGRM_TOKENS.background.default, minHeight: '100%' }}>
      {/* 1. Encabezado de la Página */}
      <Box sx={{ mb: 3.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
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
            Gestión de Almacén
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

      {/* 3. Filtros: Tabs de Categoría y Buscador */}
      <Box sx={{ mb: 3 }}>
        {/* Pestañas de categoría estilo chip */}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            overflowX: 'auto',
            pb: 1.5,
            mb: 2,
            scrollbarWidth: 'thin',
          }}
        >
          {tabsCategoria.map((tab) => {
            const activa = categoriaSeleccionada === tab.key;
            return (
              <Box
                key={tab.key}
                onClick={() => setCategoriaSeleccionada(tab.key)}
                sx={{
                  px: 2,
                  py: 0.8,
                  borderRadius: 50,
                  fontSize: '0.85rem',
                  fontWeight: activa ? 750 : 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  transition: 'all 0.15s ease',
                  backgroundColor: activa ? UAGRM_TOKENS.colors.primaryDark : UAGRM_TOKENS.colors.background.paper,
                  color: activa ? UAGRM_TOKENS.colors.text.white : UAGRM_TOKENS.colors.charcoal,
                  border: `1px solid ${activa ? UAGRM_TOKENS.colors.primaryDark : UAGRM_TOKENS.border.subtle}`,
                  '&:hover': {
                    borderColor: activa ? UAGRM_TOKENS.colors.primaryDark : UAGRM_TOKENS.border.focus,
                    backgroundColor: activa ? UAGRM_TOKENS.colors.primaryDark : UAGRM_TOKENS.colors.background.subtle,
                  },
                }}
              >
                <span>{tab.label}</span>
                <Box
                  component="span"
                  sx={{
                    px: 0.9,
                    py: 0.1,
                    borderRadius: 50,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: activa ? 'rgba(255,255,255,0.22)' : UAGRM_TOKENS.colors.status.neutral.light,
                    color: activa ? UAGRM_TOKENS.colors.text.white : UAGRM_TOKENS.colors.slate,
                  }}
                >
                  {tab.count}
                </Box>
              </Box>
            );
          })}
        </Stack>

        {/* Buscador estandarizado */}
        <SearchInput
          value={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar insumos por código, descripción o categoría..."
          countLabel={insumosFiltrados.length}
        />
      </Box>

      {/* 4. Tabla de Insumos */}
      {cargando ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
            backgroundColor: UAGRM_TOKENS.colors.background.paper,
          }}
        >
          <CircularProgress size={36} sx={{ color: UAGRM_TOKENS.colors.royalBlue, mb: 2 }} />
          <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, fontWeight: 600 }}>
            Cargando catálogo de almacén...
          </Typography>
        </Paper>
      ) : insumosFiltrados.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
            backgroundColor: UAGRM_TOKENS.colors.background.paper,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: UAGRM_TOKENS.colors.charcoal, mb: 1 }}>
            No se encontraron insumos
          </Typography>
          <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate }}>
            {busqueda
              ? 'No hay registros que coincidan con los criterios de búsqueda.'
              : 'El catálogo está vacío. Comience agregando un nuevo insumo.'}
          </Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
            backgroundColor: UAGRM_TOKENS.colors.background.paper,
            overflow: 'hidden',
          }}
        >
          <Table sx={{ minWidth: 850 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: UAGRM_TOKENS.colors.table.headerBg, borderBottom: `1px solid ${UAGRM_TOKENS.border.subtle}` }}>
                <TableCell sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.table.headerText, fontSize: '0.78rem', py: 1.8, pl: 3 }}>
                  CÓDIGO
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.table.headerText, fontSize: '0.78rem', py: 1.8 }}>
                  DESCRIPCIÓN / ESPECIFICACIONES
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.table.headerText, fontSize: '0.78rem', py: 1.8 }}>
                  CATEGORÍA
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.table.headerText, fontSize: '0.78rem', py: 1.8 }}>
                  STOCK ACTUAL
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.table.headerText, fontSize: '0.78rem', py: 1.8 }}>
                  STOCK MÍN.
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.table.headerText, fontSize: '0.78rem', py: 1.8 }}>
                  COSTO REPOSICIÓN
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.table.headerText, fontSize: '0.78rem', py: 1.8 }}>
                  ESTADO
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.table.headerText, fontSize: '0.78rem', py: 1.8, pr: 3 }}>
                  ACCIONES
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {insumosFiltrados.map((item) => {
                const stockActual = Number(item.stock_actual);
                const stockMinimo = Number(item.stock_minimo);
                const esCritico = stockActual <= stockMinimo;
                const esAlerta = !esCritico && stockActual <= stockMinimo * 1.5;

                return (
                  <TableRow
                    key={item.id_insumo}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      borderBottom: `1px solid ${UAGRM_TOKENS.border.subtle}`,
                      transition: 'background-color 0.15s ease',
                      '&:hover': { backgroundColor: UAGRM_TOKENS.colors.table.rowHover },
                    }}
                  >
                    {/* Código */}
                    <TableCell sx={{ pl: 3 }}>
                      <Typography sx={{ fontWeight: 780, color: UAGRM_TOKENS.colors.primaryDark, fontSize: '0.88rem' }}>
                        {item.codigo}
                      </Typography>
                    </TableCell>

                    {/* Descripción */}
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, color: UAGRM_TOKENS.colors.charcoal, fontSize: '0.88rem' }}>
                        {item.descripcion}
                      </Typography>
                    </TableCell>

                    {/* Categoría (Badge centralizado) */}
                    <TableCell>
                      <Badge variant="info">
                        {item.categoria?.nombre || 'General'}
                      </Badge>
                    </TableCell>

                    {/* Stock Actual */}
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primaryDark, fontSize: '0.9rem' }}>
                        {stockActual.toLocaleString()} {item.unidad_medida}
                      </Typography>
                    </TableCell>

                    {/* Stock Mínimo */}
                    <TableCell align="right">
                      <Typography sx={{ color: UAGRM_TOKENS.colors.slate, fontWeight: 600, fontSize: '0.85rem' }}>
                        {stockMinimo.toLocaleString()} {item.unidad_medida}
                      </Typography>
                    </TableCell>

                    {/* Costo Reposición */}
                    <TableCell align="right">
                      <Typography sx={{ color: UAGRM_TOKENS.colors.primaryDark, fontWeight: 750, fontSize: '0.88rem' }}>
                        {formatearMoneda(item.costo_reposicion)}
                      </Typography>
                    </TableCell>

                    {/* Estado (Badge centralizado) */}
                    <TableCell align="center">
                      <Badge variant={esCritico ? 'error' : esAlerta ? 'warning' : 'success'}>
                        {esCritico ? 'Crítico' : esAlerta ? 'Alerta' : 'Normal'}
                      </Badge>
                    </TableCell>

                    {/* Acciones */}
                    <TableCell align="right" sx={{ pr: 3 }}>
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
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

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
