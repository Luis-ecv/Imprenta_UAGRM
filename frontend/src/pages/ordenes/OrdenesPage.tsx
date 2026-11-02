import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { RefreshCw, Printer } from 'lucide-react';

import {
  Button,
  FilterTabs,
  SearchInput,
} from '@/components/ui';
import { UAGRM_TOKENS } from '@/theme/tokens';
import type { OrdenTrabajoResponse } from '@/types';
import { useOrdenes } from '@/hooks/useOrdenes';
import { CierreTecnicoModal, OrdenCard } from './components';

export function OrdenesPage() {
  const {
    ordenesFiltradas,
    insumos,
    cargando,
    error,
    setError,
    mensajeExito,
    setMensajeExito,
    busqueda,
    setBusqueda,
    filtroTab,
    setFiltroTab,
    cargarOrdenes,
    avanzarEstado,
    confirmarCierreTecnico,
    tabsFiltro,
  } = useOrdenes();

  // Modal de Cierre Técnico
  const [ordenParaCierre, setOrdenParaCierre] = useState<OrdenTrabajoResponse | null>(null);

  const handleAvanzar = async (orden: OrdenTrabajoResponse) => {
    const res = await avanzarEstado(orden);
    if (res.requiereCierre) {
      setOrdenParaCierre(orden);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 }, backgroundColor: UAGRM_TOKENS.background.default, minHeight: '100%' }}>
      {/* 1. Encabezado Oficial UAGRM */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3.5,
        }}
      >
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
            Centro de Operaciones y Taller
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
            Tablero de Producción Litográfica
          </Typography>
          <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.925rem' }}>
            Supervisa el flujo secuencial de los trabajos en prensa offset, acabados y registro de mermas.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outline"
            onClick={cargarOrdenes}
            disabled={cargando}
            icon={<RefreshCw size={16} className={cargando ? 'animate-spin' : ''} />}
          >
            Actualizar
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

      {/* 2. Buscador y Pestañas Horizontales (Diseño Oficial Imagen 1) */}
      <Box sx={{ mb: 2.5 }}>
        <SearchInput
          value={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar por código, trabajo o cliente..."
          maxWidth={{ xs: '100%', md: 740 }}
        />

        <Box sx={{ mt: 2.5 }}>
          <FilterTabs
            tabs={tabsFiltro}
            activeTab={filtroTab}
            onTabChange={setFiltroTab}
          />
        </Box>
      </Box>

      {/* 3. Lista de Órdenes con Stepper Horizontal de Proceso */}
      {cargando ? (
        <Box
          sx={{
            p: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            backgroundColor: UAGRM_TOKENS.colors.background.paper,
            borderRadius: 3,
            border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
          }}
        >
          <CircularProgress size={36} sx={{ color: UAGRM_TOKENS.colors.royalBlue }} />
          <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, fontWeight: 600 }}>
            Cargando flujo del taller litográfico...
          </Typography>
        </Box>
      ) : ordenesFiltradas.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            py: 8,
            px: 3,
            textAlign: 'center',
            backgroundColor: UAGRM_TOKENS.colors.background.paper,
            borderRadius: 3,
            border: `1px dashed ${UAGRM_TOKENS.border.focus}`,
          }}
        >
          <Printer size={44} color={UAGRM_TOKENS.colors.mutedSlate} style={{ margin: '0 auto 12px' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primaryDark, mb: 0.5 }}>
            No hay órdenes de trabajo en esta etapa
          </Typography>
          <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, maxWidth: 440, mx: 'auto' }}>
            Prueba cambiando el filtro de búsqueda o genera una nueva orden aprobando una proforma en mostrador.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {ordenesFiltradas.map((orden) => (
            <OrdenCard
              key={orden.id_orden}
              orden={orden}
              onAvanzar={handleAvanzar}
            />
          ))}
        </Stack>
      )}

      {/* Modal de Cierre Técnico Desacoplado */}
      <CierreTecnicoModal
        orden={ordenParaCierre}
        insumos={insumos}
        onClose={() => setOrdenParaCierre(null)}
        onConfirmar={confirmarCierreTecnico}
      />
    </Box>
  );
}
export default OrdenesPage;
