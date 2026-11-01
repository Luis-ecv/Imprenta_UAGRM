import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import {
  Users,
  Plus,
  Building,
  GraduationCap,
  Edit2,
  RefreshCw,
} from 'lucide-react';

import {
  Button,
  Badge,
  Table,
  FilterTabs,
  SearchInput,
  KpiCard,
  type Column,
} from '@/components/ui';
import { UAGRM_TOKENS } from '@/theme/tokens';
import type { ClienteResponse } from '@/types';
import { useClientes, normalizeTipo } from '@/hooks/useClientes';
import { ClienteModal } from './components';

export function ClientesPage() {
  const {
    clientesFiltrados,
    cargando,
    guardando,
    error,
    setError,
    mensajeExito,
    setMensajeExito,
    busqueda,
    setBusqueda,
    filtroTipo,
    setFiltroTipo,
    modalAbierto,
    clienteEditando,
    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,
    guardarCliente,
    cargarClientes,
    metricas,
    tabsFiltro,
  } = useClientes();

  // Definición declarativa de columnas para el componente <Table />
  const columnas: Column<ClienteResponse>[] = useMemo(
    () => [
      {
        id: 'razon_social',
        label: 'SOLICITANTE / RAZÓN SOCIAL',
        render: (item: ClienteResponse) => (
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                color: UAGRM_TOKENS.colors.charcoal,
                fontSize: '0.92rem',
                textTransform: 'uppercase',
                lineHeight: 1.3,
                letterSpacing: '0.01em',
              }}
            >
              {item.razon_social}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: UAGRM_TOKENS.colors.slate,
                fontWeight: 600,
                fontSize: '0.8rem',
                mt: 0.3,
                display: 'block',
              }}
            >
              Registro N.º {item.id_cliente}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'tipo_cliente',
        label: 'TIPO',
        width: 140,
        render: (item: ClienteResponse) => {
          const t = normalizeTipo(item.tipo_cliente);
          const labels: Record<string, string> = {
            facultad: 'Facultad',
            docente: 'Docente',
            autoridad: 'Autoridad',
            estudiante: 'Estudiante',
            particular: 'Particular',
          };
          return (
            <Badge variant="info">
              {labels[t] || 'Particular'}
            </Badge>
          );
        },
      },
      {
        id: 'ci_nit',
        label: 'CI / NIT',
        width: 150,
        render: (item: ClienteResponse) => {
          const nitCi = item.ci_nit || item.nit_ci;
          return (
            <Typography sx={{ color: UAGRM_TOKENS.colors.charcoal, fontWeight: 600, fontSize: '0.88rem' }}>
              {nitCi || '—'}
            </Typography>
          );
        },
      },
      {
        id: 'dependencia',
        label: 'DEPENDENCIA',
        width: 220,
        render: (item: ClienteResponse) => (
          item.codigo_facultad ? (
            <Box>
              <Typography sx={{ fontWeight: 750, color: UAGRM_TOKENS.colors.charcoal, fontSize: '0.88rem' }}>
                {item.codigo_facultad}
              </Typography>
              <Typography sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.8rem', fontWeight: 500, mt: 0.2 }}>
                {item.dependencia || 'Sin dependencia asignada'}
              </Typography>
            </Box>
          ) : (
            <Typography
              sx={{
                color: item.dependencia ? UAGRM_TOKENS.colors.charcoal : UAGRM_TOKENS.colors.slate,
                fontSize: '0.85rem',
                fontWeight: item.dependencia ? 600 : 500,
              }}
            >
              {item.dependencia || 'Sin dependencia asignada'}
            </Typography>
          )
        ),
      },
      {
        id: 'contacto',
        label: 'CONTACTO',
        width: 220,
        render: (item: ClienteResponse) => (
          <Box>
            {item.telefono ? (
              <Typography sx={{ color: UAGRM_TOKENS.colors.charcoal, fontWeight: 600, fontSize: '0.88rem' }}>
                {item.telefono}
              </Typography>
            ) : null}
            {item.email ? (
              <Typography sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.82rem', mt: item.telefono ? 0.3 : 0 }}>
                {item.email}
              </Typography>
            ) : null}
            {!item.telefono && !item.email && (
              <Typography sx={{ color: UAGRM_TOKENS.colors.mutedSlate, fontSize: '0.82rem' }}>
                Sin contacto registrado
              </Typography>
            )}
          </Box>
        ),
      },
      {
        id: 'acciones',
        label: 'ACCIONES',
        align: 'right',
        width: 100,
        render: (item: ClienteResponse) => (
          <Tooltip title="Editar Solicitante">
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
                transition: 'all 0.15s ease',
                '&:hover': {
                  backgroundColor: UAGRM_TOKENS.colors.background.subtle,
                  borderColor: UAGRM_TOKENS.border.focus,
                  color: UAGRM_TOKENS.colors.primaryDark,
                },
              }}
            >
              <Edit2 size={16} />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [abrirModalEditar]
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 }, backgroundColor: UAGRM_TOKENS.background.default, minHeight: '100%' }}>
      {/* 1. Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3.5 }}>
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
            Clientes y Solicitantes
          </Typography>
          <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.925rem' }}>
            Registro de facultades, carreras, docentes y público universitario solicitante de impresiones.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="outline"
            onClick={cargarClientes}
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
            Nuevo Cliente
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

      {/* 2. Tarjetas Métricas KPI */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            title="Total Solicitantes"
            value={metricas.total}
            icon={<Users size={22} />}
            color="primary"
            trendLabel="Padrón activo"
            trendPositive={true}
            subtitle="Clientes registrados en el sistema"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            title="Facultades y Unidades"
            value={metricas.facultades}
            icon={<Building size={22} />}
            color="primary"
            trendLabel="Unidades UAGRM"
            trendPositive={true}
            subtitle="Direcciones y facultades registradas"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            title="Comunidad Universitaria"
            value={metricas.academicos}
            icon={<GraduationCap size={22} />}
            color="accent"
            trendLabel="Docentes y estudiantes"
            trendPositive={true}
            subtitle="Solicitantes académicos vinculados"
          />
        </Grid>
      </Grid>

      {/* 3. Búsqueda y Navegación por Pestañas (Diseño Original Estandarizado) */}
      <Box sx={{ mb: 2.5 }}>
        <SearchInput
          value={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar por Nombre, CI/NIT, Carrera o Correo..."
          maxWidth={{ xs: '100%', md: 740 }}
        />

        <Box sx={{ mt: 2.5 }}>
          <FilterTabs
            tabs={tabsFiltro}
            activeTab={filtroTipo}
            onTabChange={setFiltroTipo}
          />
        </Box>
      </Box>

      {/* 4. Tabla Institucional Reutilizable (<Table />) */}
      <Table<ClienteResponse>
        columns={columnas}
        data={clientesFiltrados}
        keyExtractor={(item) => item.id_cliente}
        isLoading={cargando}
        emptyMessage={
          busqueda
            ? 'No hay solicitantes que coincidan con los criterios de búsqueda.'
            : 'Empiece registrando una facultad, docente o solicitante para emitir proformas.'
        }
      />

      {/* 5. Modal Popup Modular de Registro / Edición */}
      <ClienteModal
        open={modalAbierto}
        clienteEditando={clienteEditando}
        guardando={guardando}
        onClose={cerrarModal}
        onSubmit={guardarCliente}
      />
    </Box>
  );
}
export default ClientesPage;
