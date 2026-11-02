import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import {
  AlertTriangle,
  FileText,
  Printer,
  TrendingUp,
  Plus,
  ArrowRight,
  BrainCircuit,
  Package,
  Layers,
} from 'lucide-react';

import { ordenesApi } from '@/api/ordenes.api';
import { proformasApi } from '@/api/proformas.api';
import { useAuth } from '@/hooks/useAuth';
import { useAlertas } from '@/hooks/useAlertas';
import { Button, KpiCard, Badge, Table, type Column } from '@/components/ui';
import { GraficoProduccionArea } from './components';
import { UAGRM_TOKENS } from '@/theme/tokens';
import type { OrdenTrabajoResponse, ProformaResponse } from '@/types';
import { formatearMoneda, formatearFecha } from '@/utils/formatters';

export function DashboardPage() {
  const { usuario } = useAuth();
  const { cantidadAlertas } = useAlertas();

  const [ordenes, setOrdenes] = useState<OrdenTrabajoResponse[]>([]);
  const [proformas, setProformas] = useState<ProformaResponse[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);

  useEffect(() => {
    async function cargarDatos() {
      try {
        setCargando(true);
        const [resOrdenes, resProformas] = await Promise.all([
          ordenesApi.listar({ por_pagina: 6 }),
          proformasApi.listar({ por_pagina: 6 }),
        ]);
        setOrdenes(resOrdenes.datos || []);
        setProformas(resProformas.datos || []);
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
      } finally {
        setCargando(false);
      }
    }
    cargarDatos();
  }, []);

  const ordenesActivas = ordenes.filter(
    (o) => !['FINALIZADO', 'CANCELADO', 'ENTREGADO'].includes((o.estado_actual || '').toUpperCase())
  ).length;

  const columnasOrdenes: Column<OrdenTrabajoResponse>[] = [
    {
      id: 'codigo_ot',
      label: 'N° ORDEN',
      width: 120,
      render: (item) => (
        <Typography sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primaryDark, fontSize: '0.85rem' }}>
          {item.codigo_ot || `OT-${String(item.id_orden).padStart(4, '0')}`}
        </Typography>
      ),
    },
    {
      id: 'estado_actual',
      label: 'ETAPA LITOGRÁFICA',
      render: (item) => (
        <Badge
          variant={
            item.estado_actual === 'ENTREGADO' || item.estado_actual === 'FINALIZADO'
              ? 'success'
              : item.estado_actual === 'EN IMPRESION'
              ? 'primary'
              : 'warning'
          }
        >
          {item.estado_actual}
        </Badge>
      ),
    },
    {
      id: 'created_at',
      label: 'FECHA INICIO',
      width: 130,
      render: (item) => (
        <Typography sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.825rem' }}>
          {formatearFecha(item.created_at)}
        </Typography>
      ),
    },
  ];

  const columnasProformas: Column<ProformaResponse>[] = [
    {
      id: 'codigo_proforma',
      label: 'N° COTIZACIÓN',
      width: 130,
      render: (item) => (
        <Typography sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primaryDark, fontSize: '0.85rem' }}>
          {item.codigo_proforma || `COT-${String(item.id_proforma).padStart(4, '0')}`}
        </Typography>
      ),
    },
    {
      id: 'total_presupuesto',
      label: 'TOTAL',
      align: 'right',
      width: 120,
      render: (item) => (
        <Typography sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.charcoal, fontSize: '0.88rem' }}>
          {formatearMoneda(item.total_presupuesto)}
        </Typography>
      ),
    },
    {
      id: 'estado',
      label: 'ESTADO',
      align: 'center',
      width: 120,
      render: (item) => (
        <Badge
          variant={
            item.estado === 'APROBADA'
              ? 'success'
              : item.estado === 'RECHAZADA'
              ? 'error'
              : 'warning'
          }
        >
          {item.estado}
        </Badge>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 }, backgroundColor: UAGRM_TOKENS.background.default, minHeight: '100%' }}>
      {/* 1. Encabezado de Bienvenida y Accesos Rápidos */}
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
            Panel de Control Ejecutivo
          </Typography>
          <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.925rem' }}>
            Bienvenido, <strong>{usuario?.nombre_completo || 'Operador'}</strong> ({usuario?.rol || 'Administración'}). Resumen operativo de la Imprenta Universitaria.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="outline"
            component={Link}
            to="/predicciones"
            icon={<BrainCircuit size={16} />}
          >
            Inferencia ML
          </Button>

          <Button
            variant="default"
            component={Link}
            to="/proformas"
            icon={<Plus size={18} />}
          >
            Nueva Cotización
          </Button>
        </Stack>
      </Box>

      {/* 2. Tarjetas Métricas Principales (KPIs) */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Órdenes en Taller"
            value={ordenesActivas}
            icon={<Printer size={22} />}
            color="primary"
            subtitle="En etapas activas de taller"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Proformas Registradas"
            value={proformas.length}
            icon={<FileText size={22} />}
            color="secondary"
            subtitle="Cotizaciones del periodo"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Alertas de Inventario"
            value={cantidadAlertas}
            icon={<AlertTriangle size={22} />}
            color={cantidadAlertas > 0 ? 'error' : 'accent'}
            subtitle="Insumos bajo stock de seguridad"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Eficiencia de Taller"
            value="94.2%"
            icon={<TrendingUp size={22} />}
            color="accent"
            subtitle="Apego a tiempos estándar"
          />
        </Grid>
      </Grid>

      {/* 3. Gráfica de Tendencia y Accesos Operativos */}
      <Grid container spacing={3} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <GraficoProduccionArea />
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Box
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: `${UAGRM_TOKENS.radii.xl}px`,
              border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
              backgroundColor: UAGRM_TOKENS.colors.background.paper,
              boxShadow: UAGRM_TOKENS.shadows.card,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primaryDark, mb: 0.5, fontSize: '0.95rem' }}
              >
                Módulos de Taller Litográfico
              </Typography>
              <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.825rem', mb: 2.5 }}>
                Accesos directos a la gestión de materiales y flujo de producción.
              </Typography>

              <Stack spacing={1.5}>
                <Button
                  variant="outline"
                  component={Link}
                  to="/insumos"
                  icon={<Package size={16} />}
                  style={{ justifyContent: 'flex-start' }}
                >
                  Gestión de Almacén e Insumos
                </Button>

                <Button
                  variant="outline"
                  component={Link}
                  to="/ordenes"
                  icon={<Layers size={16} />}
                  style={{ justifyContent: 'flex-start' }}
                >
                  Órdenes de Trabajo Litográfico
                </Button>

                <Button
                  variant="outline"
                  component={Link}
                  to="/compras"
                  icon={<FileText size={16} />}
                  style={{ justifyContent: 'flex-start' }}
                >
                  Órdenes de Compra y Abastecimiento
                </Button>
              </Stack>
            </Box>

            <Box sx={{ pt: 2, borderTop: `1px solid ${UAGRM_TOKENS.border.subtle}`, mt: 2 }}>
              <Button
                variant="ghost"
                component={Link}
                to="/reportes"
                icon={<ArrowRight size={16} />}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Ver Informes Analíticos Completos
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* 4. Tablas Resumen de Actividad Reciente */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: `${UAGRM_TOKENS.radii.xl}px`,
              border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
              backgroundColor: UAGRM_TOKENS.colors.background.paper,
              boxShadow: UAGRM_TOKENS.shadows.card,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primaryDark }}>
                Órdenes de Trabajo Recientes
              </Typography>
              <Button variant="ghost" component={Link} to="/ordenes" style={{ padding: 0 }}>
                Ver todas
              </Button>
            </Box>

            <Table<OrdenTrabajoResponse>
              columns={columnasOrdenes}
              data={ordenes}
              keyExtractor={(item) => item.id_orden}
              isLoading={cargando}
              emptyMessage="No hay órdenes registradas recientemente."
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: `${UAGRM_TOKENS.radii.xl}px`,
              border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
              backgroundColor: UAGRM_TOKENS.colors.background.paper,
              boxShadow: UAGRM_TOKENS.shadows.card,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primaryDark }}>
                Cotizaciones y Proformas Recientes
              </Typography>
              <Button variant="ghost" component={Link} to="/proformas" style={{ padding: 0 }}>
                Ver todas
              </Button>
            </Box>

            <Table<ProformaResponse>
              columns={columnasProformas}
              data={proformas}
              keyExtractor={(item) => item.id_proforma}
              isLoading={cargando}
              emptyMessage="No hay cotizaciones registradas recientemente."
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardPage;
