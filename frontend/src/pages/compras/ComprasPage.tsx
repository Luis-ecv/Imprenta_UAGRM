import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import {
  ShoppingCart,
  Plus,
  RefreshCw,
  Eye,
  Building2,
  DollarSign,
  Clock,
} from 'lucide-react';

import { useCompras } from '@/hooks/useCompras';
import { Button, Table, FilterTabs, SearchInput, KpiCard, Badge, type Column } from '@/components/ui';
import { NuevaCompraModal } from './components';
import { UAGRM_TOKENS } from '@/theme/tokens';
import type { OrdenCompraResponse, OrdenCompraCreate } from '@/types';
import { formatearMoneda, formatearFecha } from '@/utils/formatters';

export function ComprasPage() {
  const {
    comprasFiltradas,
    cargando,
    error,
    busqueda,
    setBusqueda,
    filtroEstado,
    setFiltroEstado,
    tabsEstado,
    metricas,
    proveedores,
    cargandoProveedores,
    cargarCompras,
    cargarProveedores,
    crearCompra,
    guardando,
  } = useCompras();

  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const abrirModalCrear = () => {
    cargarProveedores();
    setModalAbierto(true);
  };

  const handleCrearCompra = async (datos: OrdenCompraCreate) => {
    const exito = await crearCompra(datos);
    if (exito) {
      setMensajeExito('Orden de compra generada exitosamente.');
    }
    return exito;
  };

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado?.toUpperCase()) {
      case 'RECIBIDA':
        return 'success';
      case 'ENVIADA':
        return 'primary';
      case 'APROBADA':
        return 'info';
      case 'SUGERIDA':
        return 'warning';
      case 'CANCELADA':
        return 'error';
      default:
        return 'default';
    }
  };

  const columnas: Column<OrdenCompraResponse>[] = useMemo(
    () => [
      {
        id: 'id_orden_compra',
        label: 'N° ORDEN',
        width: 140,
        render: (item) => (
          <Typography sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primaryDark, fontSize: '0.88rem' }}>
            {`OC-${String(item.id_orden_compra).padStart(4, '0')}`}
          </Typography>
        ),
      },
      {
        id: 'proveedor',
        label: 'PROVEEDOR ADJUDICADO',
        render: (item) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '6px',
                backgroundColor: UAGRM_TOKENS.colors.background.subtle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: UAGRM_TOKENS.colors.primaryDark,
                flexShrink: 0,
              }}
            >
              <Building2 size={16} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, color: UAGRM_TOKENS.colors.charcoal, fontSize: '0.88rem' }}>
                {item.proveedor?.razon_social || 'Proveedor no asignado'}
              </Typography>
              {item.proveedor?.nit && (
                <Typography sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.78rem' }}>
                  NIT: {item.proveedor.nit}
                </Typography>
              )}
            </Box>
          </Box>
        ),
      },
      {
        id: 'fecha_generacion',
        label: 'FECHA EMISIÓN',
        width: 150,
        render: (item) => (
          <Typography sx={{ color: UAGRM_TOKENS.colors.charcoal, fontSize: '0.85rem', fontWeight: 500 }}>
            {formatearFecha(item.fecha_generacion)}
          </Typography>
        ),
      },
      {
        id: 'total_estimado',
        label: 'MONTO ESTIMADO',
        align: 'right',
        width: 160,
        render: (item) => (
          <Typography sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primaryDark, fontSize: '0.9rem' }}>
            {formatearMoneda(item.total_estimado)}
          </Typography>
        ),
      },
      {
        id: 'estado',
        label: 'ESTADO',
        align: 'center',
        width: 140,
        render: (item) => (
          <Badge variant={getEstadoBadgeVariant(item.estado)}>
            {item.estado}
          </Badge>
        ),
      },
      {
        id: 'acciones',
        label: 'ACCIONES',
        align: 'right',
        width: 100,
        render: (item) => (
          <Tooltip title="Ver detalles y trazabilidad de la orden">
            <IconButton
              component={Link}
              to={`/compras/${item.id_orden_compra}`}
              size="small"
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
            Órdenes de Compra y Abastecimiento
          </Typography>
          <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.925rem' }}>
            Control de adquisiciones de papel, tintas, planchas CTP y suministros de imprenta.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="outline"
            onClick={cargarCompras}
            disabled={cargando}
            icon={<RefreshCw size={16} className={cargando ? 'animate-spin' : ''} />}
          >
            Actualizar
          </Button>

          <Button
            variant="default"
            onClick={abrirModalCrear}
            icon={<Plus size={18} />}
          >
            Nueva Orden de Compra
          </Button>
        </Stack>
      </Box>

      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {mensajeExito && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setMensajeExito(null)}>
          {mensajeExito}
        </Alert>
      )}

      {/* 2. Tarjetas Métricas Superiores */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            title="Total Adquisiciones"
            value={metricas.total}
            icon={<ShoppingCart size={22} />}
            color="primary"
            subtitle="Órdenes de compra registradas"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            title="Inversión Comprometida"
            value={formatearMoneda(metricas.inversionTotal)}
            icon={<DollarSign size={22} />}
            color="secondary"
            subtitle="Presupuesto acumulado de compras"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            title="Pendientes de Recepción"
            value={metricas.pendientes}
            icon={<Clock size={22} />}
            color={metricas.pendientes > 0 ? 'warning' : 'accent'}
            subtitle="Sugeridas, aprobadas y en camino"
          />
        </Grid>
      </Grid>

      {/* 3. Búsqueda y Navegación por Pestañas (Diseño Original Estandarizado - Imagen 1) */}
      <Box sx={{ mb: 2.5 }}>
        <SearchInput
          value={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar por N° Orden (ej. OC-0001), Proveedor o NIT..."
          maxWidth={{ xs: '100%', md: 740 }}
        />

        <Box sx={{ mt: 2.5 }}>
          <FilterTabs
            tabs={tabsEstado}
            activeTab={filtroEstado}
            onTabChange={setFiltroEstado}
          />
        </Box>
      </Box>

      {/* 4. Tabla Institucional Reutilizable */}
      <Table<OrdenCompraResponse>
        columns={columnas}
        data={comprasFiltradas}
        keyExtractor={(item) => item.id_orden_compra}
        isLoading={cargando}
        emptyMessage={
          busqueda
            ? 'No hay órdenes de compra que coincidan con los criterios de búsqueda.'
            : 'No se encontraron órdenes de compra en esta categoría.'
        }
      />

      {/* Modal Desacoplado */}
      <NuevaCompraModal
        open={modalAbierto}
        proveedores={proveedores}
        cargandoProveedores={cargandoProveedores}
        guardando={guardando}
        onClose={() => setModalAbierto(false)}
        onSubmit={handleCrearCompra}
      />
    </Box>
  );
}

export default ComprasPage;
