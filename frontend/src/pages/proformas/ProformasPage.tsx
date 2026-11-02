import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import {
  Plus,
  Printer,
  CheckCircle,
  XCircle,
  PlayCircle,
  Calendar,
  RefreshCw,
} from 'lucide-react';

import {
  Button,
  Badge,
  Table,
  FilterTabs,
  SearchInput,
  type Column,
} from '@/components/ui';
import { UAGRM_TOKENS } from '@/theme/tokens';
import type { ProformaResponse, EstadoProforma } from '@/types';
import { formatearMoneda, formatearFecha } from '@/utils/formatters';
import { useProformas } from '@/hooks/useProformas';
import {
  NuevaProformaModal,
  ProformaPreviewModal,
  GenerarOrdenModal,
} from './components';

export function ProformasPage() {
  const navigate = useNavigate();

  const {
    proformasFiltradas,
    cargando,
    error,
    setError,
    mensajeExito,
    setMensajeExito,
    busqueda,
    setBusqueda,
    filtroEstado,
    setFiltroEstado,
    cargarProformas,
    cambiarEstado,
    imprimirProforma,
    obtenerHtmlProforma,
    tabsEstado,
  } = useProformas();

  // Estados de control para modales
  const [modalNuevaAbierto, setModalNuevaAbierto] = useState<boolean>(false);
  const [modalPreviewAbierto, setModalPreviewAbierto] = useState<boolean>(false);
  const [proformaEmitida, setProformaEmitida] = useState<ProformaResponse | null>(null);
  const [htmlDoc, setHtmlDoc] = useState<string>('');
  const [cargandoHtml, setCargandoHtml] = useState<boolean>(false);
  const [proformaParaOT, setProformaParaOT] = useState<ProformaResponse | null>(null);

  // Manejador al crear proforma desde modal
  const handleProformaCreada = useCallback(
    async (nueva: ProformaResponse) => {
      setProformaEmitida(nueva);
      await cargarProformas();

      // Cargar HTML para vista previa inmediata
      setCargandoHtml(true);
      setModalPreviewAbierto(true);
      try {
        const html = await obtenerHtmlProforma(nueva.id_proforma);
        setHtmlDoc(html);
      } catch {
        setHtmlDoc('');
      } finally {
        setCargandoHtml(false);
      }
    },
    [cargarProformas, obtenerHtmlProforma]
  );

  // Definición de columnas de la tabla institucional
  const columnas: Column<ProformaResponse>[] = useMemo(
    () => [
      {
        id: 'descripcion',
        label: 'PROFORMA / TRABAJO LITOGRÁFICO',
        render: (item: ProformaResponse) => {
          const detalle = item.detalles?.[0];
          return (
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
                {detalle?.descripcion_trabajo || 'Sin descripción'}
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
                {item.codigo_proforma} • {item.cliente?.razon_social || `Cliente #${item.cliente_id}`}
              </Typography>
            </Box>
          );
        },
      },
      {
        id: 'estado',
        label: 'ESTADO',
        width: 130,
        render: (item: ProformaResponse) => {
          const variantMap: Record<EstadoProforma, 'info' | 'success' | 'error' | 'warning'> = {
            EMITIDA: 'info',
            APROBADA: 'success',
            RECHAZADA: 'error',
            VENCIDA: 'warning',
          };
          return (
            <Badge variant={variantMap[item.estado] || 'info'}>
              {item.estado}
            </Badge>
          );
        },
      },
      {
        id: 'tiraje',
        label: 'TIRAJE / PÁGINAS',
        width: 150,
        render: (item: ProformaResponse) => {
          const detalle = item.detalles?.[0];
          return (
            <Box>
              <Typography sx={{ color: UAGRM_TOKENS.colors.charcoal, fontWeight: 700, fontSize: '0.88rem' }}>
                {(detalle?.tiraje || 0).toLocaleString()} ejs.
              </Typography>
              <Typography sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.8rem', fontWeight: 500, mt: 0.2 }}>
                {detalle?.numero_paginas || 0} págs.
              </Typography>
            </Box>
          );
        },
      },
      {
        id: 'modalidad',
        label: 'MODALIDAD',
        width: 160,
        render: (item: ProformaResponse) => (
          <Typography sx={{ color: UAGRM_TOKENS.colors.slate, fontWeight: 650, fontSize: '0.85rem' }}>
            {item.modalidad === 'insumos_imprenta' ? 'Insumos Imprenta' : 'Insumos Cliente'}
          </Typography>
        ),
      },
      {
        id: 'vencimiento',
        label: 'VENCIMIENTO',
        width: 140,
        render: (item: ProformaResponse) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: UAGRM_TOKENS.colors.slate, fontSize: '0.85rem' }}>
            <Calendar size={13} color={UAGRM_TOKENS.colors.mutedSlate} />
            <span style={{ fontWeight: 600 }}>{formatearFecha(item.fecha_vencimiento)}</span>
          </Box>
        ),
      },
      {
        id: 'presupuesto',
        label: 'PRESUPUESTO',
        align: 'right',
        width: 140,
        render: (item: ProformaResponse) => (
          <Typography sx={{ color: UAGRM_TOKENS.colors.ruby, fontWeight: 800, fontSize: '0.95rem' }}>
            {formatearMoneda(item.total_presupuesto)}
          </Typography>
        ),
      },
      {
        id: 'acciones',
        label: 'ACCIONES',
        align: 'right',
        width: 140,
        render: (item: ProformaResponse) => (
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
            <Tooltip title="Imprimir formato oficial UAGRM">
              <IconButton
                size="small"
                onClick={() => imprimirProforma(item.id_proforma)}
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
                <Printer size={16} />
              </IconButton>
            </Tooltip>

            {item.estado === 'EMITIDA' && (
              <>
                <Tooltip title="Aprobar Proforma">
                  <IconButton
                    size="small"
                    onClick={() => cambiarEstado(item.id_proforma, 'APROBADA')}
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      border: `1px solid ${UAGRM_TOKENS.colors.status.success.border}`,
                      backgroundColor: UAGRM_TOKENS.colors.status.success.light,
                      color: UAGRM_TOKENS.colors.status.success.dark,
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        backgroundColor: UAGRM_TOKENS.colors.status.success.light,
                        opacity: 0.85,
                      },
                    }}
                  >
                    <CheckCircle size={16} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Rechazar Proforma">
                  <IconButton
                    size="small"
                    onClick={() => cambiarEstado(item.id_proforma, 'RECHAZADA')}
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      border: `1px solid ${UAGRM_TOKENS.border.danger}`,
                      backgroundColor: UAGRM_TOKENS.colors.status.error.light,
                      color: UAGRM_TOKENS.colors.status.error.dark,
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        backgroundColor: UAGRM_TOKENS.colors.status.error.light,
                        opacity: 0.85,
                      },
                    }}
                  >
                    <XCircle size={16} />
                  </IconButton>
                </Tooltip>
              </>
            )}

            {item.estado === 'APROBADA' && (
              <Tooltip title="Generar Orden de Trabajo (OT)">
                <IconButton
                  size="small"
                  onClick={() => setProformaParaOT(item)}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    border: `1px solid ${UAGRM_TOKENS.colors.primaryDark}`,
                    backgroundColor: UAGRM_TOKENS.colors.primaryDark,
                    color: '#ffffff',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      backgroundColor: '#141d34',
                      borderColor: '#141d34',
                      color: '#ffffff',
                    },
                  }}
                >
                  <PlayCircle size={16} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        ),
      },
    ],
    [imprimirProforma, cambiarEstado]
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 }, backgroundColor: UAGRM_TOKENS.background.default, minHeight: '100%' }}>
      {/* 1. Encabezado de la Página */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3.5 }}>
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
            Gestión Comercial
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
            Proformas y Cotizaciones
          </Typography>
          <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.925rem' }}>
            Administra presupuestos emitidos, aprobaciones y emisión de órdenes de trabajo.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="outline"
            onClick={cargarProformas}
            disabled={cargando}
            icon={<RefreshCw size={16} className={cargando ? 'animate-spin' : ''} />}
          >
            Actualizar
          </Button>

          <Button
            variant="default"
            onClick={() => setModalNuevaAbierto(true)}
            icon={<Plus size={18} />}
          >
            Nueva Proforma
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

      {/* 2. Búsqueda y Navegación por Pestañas (Diseño Original Estandarizado - Imagen 1) */}
      <Box sx={{ mb: 2.5 }}>
        <SearchInput
          value={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar por código, cliente o descripción de trabajo..."
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

      {/* 3. Tabla Institucional de Proformas (<Table />) */}
      <Table<ProformaResponse>
        columns={columnas}
        data={proformasFiltradas}
        keyExtractor={(item) => item.id_proforma}
        isLoading={cargando}
        emptyMessage={
          busqueda
            ? 'No hay proformas que coincidan con los criterios de búsqueda.'
            : 'No se encontraron proformas registradas en este estado.'
        }
      />

      {/* Modales modulares desacoplados */}
      <NuevaProformaModal
        open={modalNuevaAbierto}
        onClose={() => setModalNuevaAbierto(false)}
        onProformaCreada={handleProformaCreada}
      />

      <ProformaPreviewModal
        open={modalPreviewAbierto}
        proforma={proformaEmitida}
        htmlDoc={htmlDoc}
        cargandoHtml={cargandoHtml}
        onClose={() => setModalPreviewAbierto(false)}
        onImprimirDirecto={imprimirProforma}
      />

      <GenerarOrdenModal
        proforma={proformaParaOT}
        onClose={() => setProformaParaOT(null)}
        onOrdenCreada={() => {
          cargarProformas();
          navigate('/ordenes');
        }}
      />
    </Box>
  );
}
export default ProformasPage;
