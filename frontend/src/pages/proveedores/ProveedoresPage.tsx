import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import {
  Truck,
  Plus,
  RefreshCw,
  Edit2,
  Building2,
  Phone,
  Mail,
  FileText,
  MapPin,
} from 'lucide-react';

import { useProveedores } from '@/hooks/useProveedores';
import { Button, Table, SearchInput, KpiCard, type Column } from '@/components/ui';
import { ProveedorModal } from './components';
import { UAGRM_TOKENS } from '@/theme/tokens';
import type { ProveedorResponse, ProveedorCreate, ProveedorUpdate } from '@/types';

export function ProveedoresPage() {
  const {
    proveedoresFiltrados,
    cargando,
    error,
    busqueda,
    setBusqueda,
    cargarProveedores,
    crearProveedor,
    actualizarProveedor,
    guardando,
    metricas,
  } = useProveedores();

  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [proveedorEditando, setProveedorEditando] = useState<ProveedorResponse | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const abrirModalCrear = () => {
    setProveedorEditando(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (prov: ProveedorResponse) => {
    setProveedorEditando(prov);
    setModalAbierto(true);
  };

  const handleGuardarProveedor = async (datos: ProveedorCreate | ProveedorUpdate) => {
    let exito = false;
    if (proveedorEditando) {
      exito = await actualizarProveedor(proveedorEditando.id_proveedor, datos);
      if (exito) setMensajeExito('Información del proveedor actualizada exitosamente.');
    } else {
      exito = await crearProveedor(datos as ProveedorCreate);
      if (exito) setMensajeExito('Nuevo proveedor registrado en el padrón institucional.');
    }
    return exito;
  };

  const columnas: Column<ProveedorResponse>[] = useMemo(
    () => [
      {
        id: 'razon_social',
        label: 'PROVEEDOR / RAZÓN SOCIAL',
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
              <Building2 size={18} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, color: UAGRM_TOKENS.colors.charcoal, fontSize: '0.9rem' }}>
                {item.razon_social}
              </Typography>
              {item.direccion && (
                <Typography sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
                  <MapPin size={12} />
                  {item.direccion}
                </Typography>
              )}
            </Box>
          </Box>
        ),
      },
      {
        id: 'nit',
        label: 'NIT / IDENTIFICACIÓN',
        width: 170,
        render: (item) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <FileText size={14} color={UAGRM_TOKENS.colors.slate} />
            <Typography sx={{ fontWeight: 650, color: UAGRM_TOKENS.colors.charcoal, fontSize: '0.88rem' }}>
              {item.nit || 'Sin NIT'}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'contacto',
        label: 'PERSONA DE CONTACTO',
        width: 200,
        render: (item) => (
          <Typography sx={{ color: UAGRM_TOKENS.colors.charcoal, fontWeight: 550, fontSize: '0.85rem' }}>
            {item.contacto || 'No especificado'}
          </Typography>
        ),
      },
      {
        id: 'comunicacion',
        label: 'CANALES DE CONTACTO',
        width: 240,
        render: (item) => (
          <Stack spacing={0.3}>
            {item.telefono && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: UAGRM_TOKENS.colors.slate, fontSize: '0.82rem' }}>
                <Phone size={13} />
                <span>{item.telefono}</span>
              </Box>
            )}
            {item.email && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: UAGRM_TOKENS.colors.slate, fontSize: '0.82rem' }}>
                <Mail size={13} />
                <span>{item.email}</span>
              </Box>
            )}
            {!item.telefono && !item.email && (
              <Typography sx={{ color: UAGRM_TOKENS.colors.mutedSlate, fontSize: '0.8rem', fontStyle: 'italic' }}>
                Sin canales registrados
              </Typography>
            )}
          </Stack>
        ),
      },
      {
        id: 'acciones',
        label: 'ACCIONES',
        align: 'right',
        width: 100,
        render: (item) => (
          <Tooltip title="Editar proveedor">
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
            Proveedores Autorizados
          </Typography>
          <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.925rem' }}>
            Padrón de casas comerciales, papeleras y distribuidoras de insumos gráficos de la UAGRM.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="outline"
            onClick={cargarProveedores}
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
            Nuevo Proveedor
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
            title="Total Proveedores"
            value={metricas.total}
            icon={<Truck size={22} />}
            color="primary"
            subtitle="Padrón activo registrado"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            title="Con NIT Habilitado"
            value={metricas.conNit}
            icon={<FileText size={22} />}
            color="secondary"
            subtitle="Facturación y respaldo legal"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            title="Con Asesor / Contacto"
            value={metricas.conContacto}
            icon={<Phone size={22} />}
            color="accent"
            subtitle="Canal de comunicación directo"
          />
        </Grid>
      </Grid>

      {/* 3. Buscador */}
      <Box sx={{ mb: 2.5 }}>
        <SearchInput
          value={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar por Razón Social, NIT, Contacto, Teléfono o Correo..."
          maxWidth={{ xs: '100%', md: 740 }}
        />
      </Box>

      {/* 4. Tabla Institucional Reutilizable */}
      <Table<ProveedorResponse>
        columns={columnas}
        data={proveedoresFiltrados}
        keyExtractor={(item) => item.id_proveedor}
        isLoading={cargando}
        emptyMessage={
          busqueda
            ? 'No se encontraron proveedores que coincidan con la búsqueda.'
            : 'No hay proveedores registrados en el sistema. Comience agregando uno.'
        }
      />

      {/* Modal Desacoplado */}
      <ProveedorModal
        open={modalAbierto}
        proveedorEditando={proveedorEditando}
        guardando={guardando}
        onClose={() => setModalAbierto(false)}
        onSubmit={handleGuardarProveedor}
      />
    </Box>
  );
}

export default ProveedoresPage;
