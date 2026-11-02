import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import {
  History,
  RefreshCw,
  Eye,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

import { useBitacora } from '@/hooks/useBitacora';
import { Button, Table, FilterTabs, SearchInput, KpiCard, Badge, type Column } from '@/components/ui';
import { BitacoraDetalleModal } from './components';
import { UAGRM_TOKENS } from '@/theme/tokens';
import type { BitacoraResponse } from '@/types';
import { formatearFechaHora } from '@/utils/formatters';

export function BitacoraPage() {
  const {
    registrosFiltrados,
    cargando,
    error,
    busqueda,
    setBusqueda,
    filtroModulo,
    setFiltroModulo,
    tabsFiltro,
    metricas,
    cargarBitacora,
  } = useBitacora();

  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [registroSeleccionado, setRegistroSeleccionado] = useState<BitacoraResponse | null>(null);

  const abrirModalDetalle = (item: BitacoraResponse) => {
    setRegistroSeleccionado(item);
    setModalAbierto(true);
  };

  const getModuloBadgeVariant = (modulo: string) => {
    const m = (modulo || '').toUpperCase();
    if (m.includes('AUTH') || m.includes('LOGIN') || m.includes('USUARIO')) return 'primary';
    if (m.includes('ORDEN') || m.includes('TALLER')) return 'info';
    if (m.includes('INSUMO') || m.includes('COMPRA')) return 'warning';
    if (m.includes('PROFORMA')) return 'success';
    return 'default';
  };

  const columnas: Column<BitacoraResponse>[] = useMemo(
    () => [
      {
        id: 'created_at',
        label: 'FECHA Y HORA',
        width: 175,
        render: (item) => (
          <Typography sx={{ fontWeight: 650, color: UAGRM_TOKENS.colors.charcoal, fontSize: '0.85rem' }}>
            {formatearFechaHora(item.created_at)}
          </Typography>
        ),
      },
      {
        id: 'usuario_id',
        label: 'OPERADOR',
        width: 130,
        render: (item) => (
          <Typography sx={{ fontWeight: 750, color: UAGRM_TOKENS.colors.primaryDark, fontSize: '0.88rem' }}>
            {`User #${item.usuario_id}`}
          </Typography>
        ),
      },
      {
        id: 'modulo',
        label: 'MÓDULO',
        width: 160,
        render: (item) => (
          <Badge variant={getModuloBadgeVariant(item.modulo)}>
            {item.modulo?.toUpperCase() || 'SISTEMA'}
          </Badge>
        ),
      },
      {
        id: 'accion',
        label: 'ACCIÓN EJECUTADA',
        render: (item) => (
          <Box>
            <Typography sx={{ fontWeight: 700, color: UAGRM_TOKENS.colors.charcoal, fontSize: '0.88rem' }}>
              {item.accion}
            </Typography>
            {item.detalle && (
              <Typography
                sx={{
                  color: UAGRM_TOKENS.colors.slate,
                  fontSize: '0.78rem',
                  maxWidth: 420,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.detalle}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        id: 'ip_origen',
        label: 'IP ORIGEN',
        width: 140,
        render: (item) => (
          <Typography sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.825rem', fontFamily: 'monospace' }}>
            {item.ip_origen || '127.0.0.1'}
          </Typography>
        ),
      },
      {
        id: 'acciones',
        label: 'AUDITORÍA',
        align: 'right',
        width: 100,
        render: (item) => (
          <Tooltip title="Inspeccionar registro forense">
            <IconButton
              size="small"
              onClick={() => abrirModalDetalle(item)}
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
              <Eye size={16} />
            </IconButton>
          </Tooltip>
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
            Bitácora de Auditoría y Seguridad
          </Typography>
          <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.925rem' }}>
            Trazabilidad inmutable de accesos, cotizaciones, órdenes litográficas y movimientos de inventario.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="outline"
            onClick={cargarBitacora}
            disabled={cargando}
            icon={<RefreshCw size={16} className={cargando ? 'animate-spin' : ''} />}
          >
            Actualizar
          </Button>
        </Stack>
      </Box>

      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* 2. Tarjetas Métricas Superiores */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            title="Total Transacciones"
            value={metricas.total}
            icon={<History size={22} />}
            color="primary"
            subtitle="Eventos forenses auditados"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            title="Transacciones de Hoy"
            value={metricas.hoy}
            icon={<Calendar size={22} />}
            color="secondary"
            subtitle="Actividad durante la jornada"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            title="Seguridad y Control de Acceso"
            value={metricas.seguridad}
            icon={<ShieldCheck size={22} />}
            color="accent"
            subtitle="Inicios de sesión y credenciales"
          />
        </Grid>
      </Grid>

      {/* 3. Búsqueda y Navegación por Pestañas (Diseño Original Estandarizado - Imagen 1) */}
      <Box sx={{ mb: 2.5 }}>
        <SearchInput
          value={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar evento por módulo, acción, usuario, IP o detalle..."
          maxWidth={{ xs: '100%', md: 740 }}
        />

        <Box sx={{ mt: 2.5 }}>
          <FilterTabs
            tabs={tabsFiltro}
            activeTab={filtroModulo}
            onTabChange={setFiltroModulo}
          />
        </Box>
      </Box>

      {/* 4. Tabla Institucional Reutilizable */}
      <Table<BitacoraResponse>
        columns={columnas}
        data={registrosFiltrados}
        keyExtractor={(item) => item.id_bitacora}
        isLoading={cargando}
        emptyMessage={
          busqueda
            ? 'No hay eventos de auditoría que coincidan con los criterios de búsqueda.'
            : 'No hay eventos registrados en esta categoría.'
        }
      />

      {/* Modal Desacoplado */}
      <BitacoraDetalleModal
        open={modalAbierto}
        registro={registroSeleccionado}
        onClose={() => setModalAbierto(false)}
      />
    </Box>
  );
}

export default BitacoraPage;
