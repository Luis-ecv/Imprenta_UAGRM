import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';
import {
  BarChart3,
  Download,
  RefreshCw,
  Printer,
} from 'lucide-react';

import { reportesApi } from '@/api/reportes.api';
import { Button, FilterTabs, SearchInput, Badge, type TabItem } from '@/components/ui';
import { UAGRM_TOKENS } from '@/theme/tokens';

type TipoReporte = 'consumo' | 'proformas' | 'inventario';

export function ReportesPage() {
  const [cargando, setCargando] = useState<boolean>(false);
  const [reporteActivo, setReporteActivo] = useState<TipoReporte>('consumo');
  const [busqueda, setBusqueda] = useState<string>('');
  const [datosReporte, setDatosReporte] = useState<unknown>(null);

  const tabsReporte: TabItem[] = useMemo(
    () => [
      { key: 'consumo', label: 'Consumo y Mermas' },
      { key: 'proformas', label: 'Proformas y Cotizaciones' },
      { key: 'inventario', label: 'Estado de Almacén' },
    ],
    []
  );

  async function cargarReporte(tipo: TipoReporte) {
    try {
      setCargando(true);
      setReporteActivo(tipo);
      let data: unknown;
      if (tipo === 'consumo') {
        data = await reportesApi.consumo();
      } else if (tipo === 'proformas') {
        data = await reportesApi.proformas();
      } else {
        data = await reportesApi.inventario();
      }
      setDatosReporte(data);
    } catch {
      // Manejo silencioso
    } finally {
      setCargando(false);
    }
  }

  const handleTabChange = (key: string) => {
    cargarReporte(key as TipoReporte);
  };

  const filasFiltradas = useMemo(() => {
    if (!Array.isArray(datosReporte)) return [];
    if (!busqueda.trim()) return datosReporte as Record<string, unknown>[];
    const q = busqueda.toLowerCase().trim();
    return (datosReporte as Record<string, unknown>[]).filter((fila) =>
      Object.values(fila).some((val) =>
        String(val ?? '')
          .toLowerCase()
          .includes(q)
      )
    );
  }, [datosReporte, busqueda]);

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 }, backgroundColor: UAGRM_TOKENS.background.default, minHeight: '100%' }}>
      {/* 1. Encabezado de la Página */}
      <Box sx={{ mb: 3.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <BarChart3 size={28} color={UAGRM_TOKENS.colors.ruby} />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 780,
                color: UAGRM_TOKENS.colors.primaryDark,
                letterSpacing: '-0.02em',
              }}
            >
              Informes de Gestión Litográfica
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.925rem' }}>
            Consolidado analítico de mermas, presupuestos aprobados, rotación de stock y rendimiento de taller.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="outline"
            onClick={() => cargarReporte(reporteActivo)}
            disabled={cargando}
            icon={<RefreshCw size={16} className={cargando ? 'animate-spin' : ''} />}
          >
            Actualizar
          </Button>

          <Button
            variant="default"
            onClick={() => window.print()}
            icon={<Printer size={18} />}
          >
            Imprimir / Exportar
          </Button>
        </Stack>
      </Box>

      {/* 2. Buscador Alargado y Pestañas Horizontales Oficiales (Imagen 1 Layout) */}
      <Box sx={{ mb: 3 }}>
        <SearchInput
          value={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar en el informe analítico o filtrar parámetros..."
          maxWidth={{ xs: '100%', md: 740 }}
        />

        <Box sx={{ mt: 2.5 }}>
          <FilterTabs
            tabs={tabsReporte}
            activeTab={reporteActivo}
            onTabChange={handleTabChange}
          />
        </Box>
      </Box>

      {/* 3. Contenedor de Datos / Tabla Institucional */}
      {cargando ? (
        <Box
          sx={{
            p: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            backgroundColor: UAGRM_TOKENS.colors.background.paper,
            borderRadius: `${UAGRM_TOKENS.radii.xl}px`,
            border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
          }}
        >
          <CircularProgress size={36} sx={{ color: UAGRM_TOKENS.colors.primaryDark }} />
          <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, fontWeight: 600 }}>
            Generando y consolidando informe analítico institucional...
          </Typography>
        </Box>
      ) : datosReporte ? (
        <Paper
          elevation={0}
          sx={{
            borderRadius: `${UAGRM_TOKENS.radii.xl}px`,
            border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
            backgroundColor: UAGRM_TOKENS.colors.background.paper,
            overflow: 'hidden',
            boxShadow: UAGRM_TOKENS.shadows.card,
          }}
        >
          {/* Cabecera del Reporte Consolidado */}
          <Box
            sx={{
              backgroundColor: UAGRM_TOKENS.colors.background.subtle,
              p: 2.5,
              borderBottom: `1px solid ${UAGRM_TOKENS.border.subtle}`,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 1.5,
            }}
          >
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  color: UAGRM_TOKENS.colors.charcoal,
                  textTransform: 'uppercase',
                  fontSize: '0.92rem',
                }}
              >
                Informe Oficial: {reporteActivo.toUpperCase()}
              </Typography>
              <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.slate, fontWeight: 600 }}>
                Datos validados por el servidor institucional • Imprenta Universitaria UAGRM
              </Typography>
            </Box>

            <Badge variant="success">
              Sincronizado
            </Badge>
          </Box>

          <Box sx={{ p: 2 }}>
            {filasFiltradas.length > 0 ? (
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead sx={{ backgroundColor: UAGRM_TOKENS.colors.background.subtle }}>
                    <TableRow>
                      {Object.keys(filasFiltradas[0] as object).map((key) => (
                        <TableCell
                          key={key}
                          sx={{
                            fontWeight: 800,
                            color: UAGRM_TOKENS.colors.slate,
                            fontSize: '0.78rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            py: 1.5,
                            borderBottom: `1px solid ${UAGRM_TOKENS.border.subtle}`,
                          }}
                        >
                          {key.replace(/_/g, ' ')}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filasFiltradas.map((fila, idx) => (
                      <TableRow
                        key={idx}
                        hover
                        sx={{
                          '&:hover': { backgroundColor: UAGRM_TOKENS.colors.background.subtle },
                          '& td': { borderBottom: `1px solid ${UAGRM_TOKENS.border.subtle}`, py: 1.5 },
                        }}
                      >
                        {Object.values(fila).map((val, cIdx) => (
                          <TableCell key={cIdx} sx={{ fontSize: '0.875rem', color: UAGRM_TOKENS.colors.charcoal }}>
                            {typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val ?? '-')}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 2.5,
                  backgroundColor: UAGRM_TOKENS.colors.background.subtle,
                  borderRadius: 2,
                  border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
                  fontSize: '0.825rem',
                  fontFamily: 'monospace',
                  color: UAGRM_TOKENS.colors.charcoal,
                  overflowX: 'auto',
                }}
              >
                {JSON.stringify(datosReporte, null, 2)}
              </Box>
            )}
          </Box>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          sx={{
            py: 8,
            px: 3,
            textAlign: 'center',
            backgroundColor: UAGRM_TOKENS.colors.background.paper,
            borderRadius: `${UAGRM_TOKENS.radii.xl}px`,
            border: `1px dashed ${UAGRM_TOKENS.border.subtle}`,
          }}
        >
          <BarChart3 size={44} color={UAGRM_TOKENS.colors.slate} style={{ margin: '0 auto 14px' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primaryDark, mb: 0.5 }}>
            Visualización del Informe: {reporteActivo.toUpperCase()}
          </Typography>
          <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, maxWidth: 480, mx: 'auto', mb: 3 }}>
            Haga clic en «Generar Reporte Ahora» o «Actualizar» para consolidar los datos operativos desde la base de datos institucional.
          </Typography>
          <Button
            variant="default"
            onClick={() => cargarReporte(reporteActivo)}
            icon={<Download size={16} />}
          >
            Generar Reporte Ahora
          </Button>
        </Paper>
      )}
    </Box>
  );
}

export default ReportesPage;
