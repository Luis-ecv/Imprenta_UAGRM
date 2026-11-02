import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import {
  Calculator,
  Plus,
  RefreshCw,
  Edit3,
  Layers,
  DollarSign,
  Scissors,
} from 'lucide-react';

import { useTarifas } from '@/hooks/useTarifas';
import { Button, Table, FilterTabs, SearchInput, KpiCard, Badge, type Column } from '@/components/ui';
import { TarifaModal } from './components';
import { UAGRM_TOKENS } from '@/theme/tokens';
import type { TarifaResponse, TarifaCreate } from '@/api/tarifas.api';
import { formatearMoneda, formatearFecha } from '@/utils/formatters';

export function TarifasPage() {
  const {
    tarifasFiltradas,
    cargando,
    guardando,
    error,
    setError,
    busqueda,
    setBusqueda,
    filtroCategoria,
    setFiltroCategoria,
    tabsFiltro,
    metricas,
    cargarTarifas,
    crearTarifa,
    actualizarTarifa,
  } = useTarifas();

  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [tarifaEditando, setTarifaEditando] = useState<TarifaResponse | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const abrirModalCrear = () => {
    setTarifaEditando(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (tarifa: TarifaResponse) => {
    setTarifaEditando(tarifa);
    setModalAbierto(true);
  };

  const handleGuardarTarifa = async (datos: TarifaCreate | Partial<TarifaResponse>) => {
    let exito = false;
    if (tarifaEditando) {
      exito = await actualizarTarifa(tarifaEditando.id_tarifa, datos);
      if (exito) setMensajeExito('Tarifa actualizada correctamente en el sistema.');
    } else {
      exito = await crearTarifa(datos as TarifaCreate);
      if (exito) setMensajeExito('Nueva tarifa registrada exitosamente en el tarifario.');
    }
    return exito;
  };

  const columnas: Column<TarifaResponse>[] = useMemo(
    () => [
      {
        id: 'concepto',
        label: 'CONCEPTO / SERVICIO LITOGRÁFICO',
        render: (item) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                backgroundColor: UAGRM_TOKENS.colors.background.subtle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: UAGRM_TOKENS.colors.primaryDark,
                flexShrink: 0,
              }}
            >
              <Calculator size={18} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 750, color: UAGRM_TOKENS.colors.charcoal, fontSize: '0.9rem' }}>
                {item.concepto}
              </Typography>
              <Typography sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.8rem' }}>
                {item.tipo_tarifa || 'Servicio de Taller'}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        id: 'unidad',
        label: 'UNIDAD DE MEDIDA',
        width: 170,
        render: (item) => (
          <Typography sx={{ color: UAGRM_TOKENS.colors.charcoal, fontWeight: 600, fontSize: '0.85rem' }}>
            {item.unidad || 'Millar'}
          </Typography>
        ),
      },
      {
        id: 'precio_unitario',
        label: 'COSTO / PRECIO UNITARIO',
        align: 'right',
        width: 200,
        render: (item) => (
          <Typography sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primaryDark, fontSize: '0.92rem' }}>
            {formatearMoneda(Number(item.costo_unitario ?? item.precio_unitario ?? 0))}
          </Typography>
        ),
      },
      {
        id: 'vigencia',
        label: 'VIGENCIA ARANCEL',
        width: 170,
        render: (item) => (
          <Typography sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.85rem' }}>
            {item.vigencia_hasta ? formatearFecha(item.vigencia_hasta) : 'Permanente'}
          </Typography>
        ),
      },
      {
        id: 'estado',
        label: 'ESTADO',
        align: 'center',
        width: 120,
        render: (item) => (
          <Badge variant={item.activo !== false ? 'success' : 'default'}>
            {item.activo !== false ? 'Vigente' : 'Inactivo'}
          </Badge>
        ),
      },
      {
        id: 'acciones',
        label: 'ACCIONES',
        align: 'right',
        width: 100,
        render: (item) => (
          <Tooltip title="Editar tarifa">
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
              <Edit3 size={16} />
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
            Tarifario y Costos Litográficos
          </Typography>
          <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.925rem' }}>
            Control de aranceles oficiales para tiradas offset, acabados, guillotinado y encuadernación.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="outline"
            onClick={cargarTarifas}
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
            Nueva Tarifa
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

      {/* 2. Tarjetas Métricas Superiores */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            title="Total Tarifas Oficiales"
            value={metricas.total}
            icon={<Layers size={22} />}
            color="primary"
            subtitle="Aranceles registrados en catálogo"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            title="Costo Promedio Arancel"
            value={formatearMoneda(metricas.costoPromedio)}
            icon={<DollarSign size={22} />}
            color="secondary"
            subtitle="Media por unidad de servicio"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            title="Servicios Offset / Acabados"
            value={`${metricas.offset} / ${metricas.acabados}`}
            icon={<Scissors size={22} />}
            color="accent"
            subtitle="Procesos de taller activos"
          />
        </Grid>
      </Grid>

      {/* 3. Búsqueda y Navegación por Pestañas (Diseño Original Estandarizado - Imagen 1) */}
      <Box sx={{ mb: 2.5 }}>
        <SearchInput
          value={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar tarifa por concepto, unidad de medida o categoría..."
          maxWidth={{ xs: '100%', md: 740 }}
        />

        <Box sx={{ mt: 2.5 }}>
          <FilterTabs
            tabs={tabsFiltro}
            activeTab={filtroCategoria}
            onTabChange={setFiltroCategoria}
          />
        </Box>
      </Box>

      {/* 4. Tabla Institucional Reutilizable */}
      <Table<TarifaResponse>
        columns={columnas}
        data={tarifasFiltradas}
        keyExtractor={(item) => item.id_tarifa}
        isLoading={cargando}
        emptyMessage={
          busqueda
            ? 'No hay tarifas que coincidan con los criterios de búsqueda.'
            : 'No hay tarifas registradas en esta categoría.'
        }
      />

      {/* Modal Desacoplado */}
      <TarifaModal
        open={modalAbierto}
        tarifaEditando={tarifaEditando}
        guardando={guardando}
        onClose={() => setModalAbierto(false)}
        onSubmit={handleGuardarTarifa}
      />
    </Box>
  );
}

export default TarifasPage;
