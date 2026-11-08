import { useState, useMemo, useEffect, useCallback } from 'react';
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
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import {
  BarChart3,
  RefreshCw,
  Printer,
  PackageOpen,
  CheckCircle2,
  FileText,
  Layers,
  Calendar,
} from 'lucide-react';

import {
  reportesApi,
  type ConsumoMensualItem,
  type InsumoStockBajoItem,
  type InsumoInventarioItem,
  type ProformaReporteItem,
} from '@/api/reportes.api';
import { Button, FilterTabs, SearchInput, Badge, type TabItem } from '@/components/ui';
import { UAGRM_TOKENS } from '@/theme/tokens';

type TipoReporte = 'consumo' | 'proformas' | 'inventario';

const MESES = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

export function ReportesPage() {
  const [cargando, setCargando] = useState<boolean>(false);
  const [reporteActivo, setReporteActivo] = useState<TipoReporte>('consumo');
  const [busqueda, setBusqueda] = useState<string>('');

  // Filtros dinámicos de período
  const ahora = useMemo(() => new Date(), []);
  const [mesSeleccionado, setMesSeleccionado] = useState<number>(ahora.getMonth() + 1);
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(ahora.getFullYear());

  // Filtro dinámico de inventario
  const [modoAlmacen, setModoAlmacen] = useState<'alerta' | 'todos'>('alerta');

  // Filtro de proformas
  const [filtroEstadoProforma, setFiltroEstadoProforma] = useState<string>('');

  // Colecciones tipadas
  const [datosConsumo, setDatosConsumo] = useState<ConsumoMensualItem[]>([]);
  const [datosInventario, setDatosInventario] = useState<(InsumoStockBajoItem | InsumoInventarioItem)[]>([]);
  const [datosProformas, setDatosProformas] = useState<ProformaReporteItem[]>([]);

  const opcionesAnio = useMemo(() => {
    const actual = ahora.getFullYear();
    return [
      { value: actual, label: `Año ${actual}` },
      { value: actual - 1, label: `Año ${actual - 1}` },
      { value: actual - 2, label: `Año ${actual - 2}` },
      { value: actual - 3, label: `Año ${actual - 3}` },
    ];
  }, [ahora]);

  const cargarReporte = useCallback(
    async (
      tipo: TipoReporte,
      mes?: number,
      anio?: number,
      modoInv?: 'alerta' | 'todos',
      estadoProf?: string
    ) => {
      try {
        setCargando(true);
        const m = mes ?? mesSeleccionado;
        const a = anio ?? anioSeleccionado;
        const modo = modoInv ?? modoAlmacen;
        const est = estadoProf ?? filtroEstadoProforma;

        if (tipo === 'consumo') {
          const res = await reportesApi.consumo(a, m);
          setDatosConsumo(Array.isArray(res) ? res : []);
        } else if (tipo === 'proformas') {
          const res = await reportesApi.proformas(est || undefined);
          setDatosProformas(Array.isArray(res) ? res : []);
        } else {
          const res = await reportesApi.inventario(modo === 'alerta');
          setDatosInventario(Array.isArray(res) ? res : []);
        }
      } catch (err) {
        console.error('Error al consultar reporte litográfico:', err);
      } finally {
        setCargando(false);
      }
    },
    [mesSeleccionado, anioSeleccionado, modoAlmacen, filtroEstadoProforma]
  );

  useEffect(() => {
    cargarReporte('consumo');
  }, [cargarReporte]);

  const handleTabChange = (key: string) => {
    const nuevoTipo = key as TipoReporte;
    setReporteActivo(nuevoTipo);
    setBusqueda('');
    cargarReporte(nuevoTipo);
  };

  // Filtrado reactivo en memoria por búsqueda
  const filasConsumoFiltradas = useMemo(() => {
    if (!busqueda.trim()) return datosConsumo;
    const q = busqueda.toLowerCase().trim();
    return datosConsumo.filter(
      (item) =>
        (item.codigo && item.codigo.toLowerCase().includes(q)) ||
        (item.descripcion && item.descripcion.toLowerCase().includes(q))
    );
  }, [datosConsumo, busqueda]);

  const filasInventarioFiltradas = useMemo(() => {
    if (!busqueda.trim()) return datosInventario;
    const q = busqueda.toLowerCase().trim();
    return datosInventario.filter(
      (item) =>
        (item.codigo && item.codigo.toLowerCase().includes(q)) ||
        (item.descripcion && item.descripcion.toLowerCase().includes(q)) ||
        (item.unidad_medida && item.unidad_medida.toLowerCase().includes(q))
    );
  }, [datosInventario, busqueda]);

  const filasProformasFiltradas = useMemo(() => {
    if (!busqueda.trim()) return datosProformas;
    const q = busqueda.toLowerCase().trim();
    return datosProformas.filter(
      (item) =>
        (item.numero_proforma && item.numero_proforma.toLowerCase().includes(q)) ||
        (item.cliente?.nombre_razon_social && item.cliente.nombre_razon_social.toLowerCase().includes(q)) ||
        (item.tipo_trabajo?.nombre && item.tipo_trabajo.nombre.toLowerCase().includes(q)) ||
        (item.estado && item.estado.toLowerCase().includes(q))
    );
  }, [datosProformas, busqueda]);

  const conteoActivo = useMemo(() => {
    if (reporteActivo === 'consumo') return filasConsumoFiltradas.length;
    if (reporteActivo === 'proformas') return filasProformasFiltradas.length;
    return filasInventarioFiltradas.length;
  }, [reporteActivo, filasConsumoFiltradas.length, filasProformasFiltradas.length, filasInventarioFiltradas.length]);

  const tabsReporte: TabItem[] = useMemo(
    () => [
      {
        key: 'consumo',
        label: 'Consumo y Mermas',
        count: reporteActivo === 'consumo' ? conteoActivo : undefined,
      },
      {
        key: 'proformas',
        label: 'Proformas y Cotizaciones',
        count: reporteActivo === 'proformas' ? conteoActivo : undefined,
      },
      {
        key: 'inventario',
        label: 'Estado de Almacén',
        count: reporteActivo === 'inventario' ? conteoActivo : undefined,
      },
    ],
    [reporteActivo, conteoActivo]
  );

  const nombreMesActual = MESES.find((m) => m.value === mesSeleccionado)?.label ?? '';

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

      {/* 2. Buscador y Pestañas Horizontales */}
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

      {/* 3. Barra de Controles y Parámetros Dinámicos Específicos por Tipo de Reporte */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: `${UAGRM_TOKENS.radii.lg}px`,
          border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
          backgroundColor: UAGRM_TOKENS.colors.background.paper,
        }}
      >
        {reporteActivo === 'consumo' && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel id="mes-select-label">Mes</InputLabel>
              <Select
                labelId="mes-select-label"
                label="Mes"
                value={mesSeleccionado}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMesSeleccionado(val);
                  cargarReporte('consumo', val, anioSeleccionado);
                }}
              >
                {MESES.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    {m.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="anio-select-label">Año</InputLabel>
              <Select
                labelId="anio-select-label"
                label="Año"
                value={anioSeleccionado}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setAnioSeleccionado(val);
                  cargarReporte('consumo', mesSeleccionado, val);
                }}
              >
                {opcionesAnio.map((a) => (
                  <MenuItem key={a.value} value={a.value}>
                    {a.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: UAGRM_TOKENS.colors.slate, fontSize: '0.85rem' }}>
              <Calendar size={16} />
              <span>
                Período en análisis: <strong>{nombreMesActual} {anioSeleccionado}</strong>
              </span>
            </Box>
          </Stack>
        )}

        {reporteActivo === 'inventario' && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
            <FormControl size="small" sx={{ minWidth: 280 }}>
              <InputLabel id="modo-almacen-label">Filtro de Inventario</InputLabel>
              <Select
                labelId="modo-almacen-label"
                label="Filtro de Inventario"
                value={modoAlmacen}
                onChange={(e) => {
                  const val = e.target.value as 'alerta' | 'todos';
                  setModoAlmacen(val);
                  cargarReporte('inventario', undefined, undefined, val);
                }}
              >
                <MenuItem value="alerta">Solo Stock Crítico / Bajo (Alertas)</MenuItem>
                <MenuItem value="todos">Inventario Completo de Taller</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.slate }}>
              {modoAlmacen === 'alerta'
                ? 'Monitoreando insumos por debajo del umbral mínimo de seguridad.'
                : 'Catálogo completo de existencias en almacén litográfico.'}
            </Typography>
          </Stack>
        )}

        {reporteActivo === 'proformas' && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="estado-proforma-label">Estado de Proforma</InputLabel>
              <Select
                labelId="estado-proforma-label"
                label="Estado de Proforma"
                value={filtroEstadoProforma}
                onChange={(e) => {
                  const val = e.target.value as string;
                  setFiltroEstadoProforma(val);
                  cargarReporte('proformas', undefined, undefined, undefined, val);
                }}
              >
                <MenuItem value="">Todos los Estados</MenuItem>
                <MenuItem value="EMITIDA">Emitida</MenuItem>
                <MenuItem value="APROBADA">Aprobada</MenuItem>
                <MenuItem value="RECHAZADA">Rechazada</MenuItem>
                <MenuItem value="CERRADA">Cerrada</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.slate }}>
              Filtrar cotizaciones litográficas por ciclo comercial institucional.
            </Typography>
          </Stack>
        )}
      </Paper>

      {/* 4. Contenedor de Datos / Tabla Institucional */}
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
      ) : (
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
                Informe Oficial:{' '}
                {reporteActivo === 'consumo'
                  ? `Consumo y Mermas (${nombreMesActual} ${anioSeleccionado})`
                  : reporteActivo === 'inventario'
                  ? `Estado de Almacén (${modoAlmacen === 'alerta' ? 'Alertas Críticas' : 'Inventario Completo'})`
                  : 'Proformas y Cotizaciones'}
              </Typography>
              <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.slate, fontWeight: 600 }}>
                Datos validados por el servidor institucional • Imprenta Universitaria UAGRM
              </Typography>
            </Box>

            <Badge variant="success">Sincronizado</Badge>
          </Box>

          <Box sx={{ p: 2 }}>
            {/* VISTA 1: CONSUMO Y MERMAS */}
            {reporteActivo === 'consumo' && (
              filasConsumoFiltradas.length > 0 ? (
                <TableContainer>
                  <Table sx={{ minWidth: 700 }}>
                    <TableHead sx={{ backgroundColor: UAGRM_TOKENS.colors.background.subtle }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.slate, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                          Código
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.slate, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                          Insumo / Descripción
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.slate, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                          Consumo Real
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.slate, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                          Merma Técnica
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.slate, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                          % Merma
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.slate, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                          Diagnóstico
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filasConsumoFiltradas.map((item) => {
                        const total = (item.total_utilizado || 0) + (item.total_merma || 0);
                        const porcentaje = total > 0 ? ((item.total_merma || 0) / total) * 100 : 0;
                        let badgeVariant: 'success' | 'warning' | 'error' = 'success';
                        let badgeLabel = 'Óptimo (<5%)';
                        if (porcentaje > 10) {
                          badgeVariant = 'error';
                          badgeLabel = 'Crítico (>10%)';
                        } else if (porcentaje >= 5) {
                          badgeVariant = 'warning';
                          badgeLabel = 'Tolerable (5-10%)';
                        }

                        return (
                          <TableRow
                            key={item.insumo_id}
                            hover
                            sx={{ '& td': { borderBottom: `1px solid ${UAGRM_TOKENS.border.subtle}`, py: 1.5 } }}
                          >
                            <TableCell sx={{ fontWeight: 700, color: UAGRM_TOKENS.colors.primaryDark, fontSize: '0.85rem' }}>
                              {item.codigo}
                            </TableCell>
                            <TableCell sx={{ color: UAGRM_TOKENS.colors.charcoal, fontSize: '0.875rem' }}>
                              {item.descripcion}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: UAGRM_TOKENS.colors.charcoal, fontSize: '0.875rem' }}>
                              {Number(item.total_utilizado).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: UAGRM_TOKENS.colors.ruby, fontSize: '0.875rem' }}>
                              {Number(item.total_merma).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.875rem', color: porcentaje > 10 ? UAGRM_TOKENS.colors.ruby : UAGRM_TOKENS.colors.charcoal }}>
                              {porcentaje.toFixed(1)}%
                            </TableCell>
                            <TableCell align="center">
                              <Badge variant={badgeVariant}>{badgeLabel}</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ py: 6, px: 3, textAlign: 'center' }}>
                  <PackageOpen size={46} color={UAGRM_TOKENS.colors.slate} style={{ margin: '0 auto 14px' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: UAGRM_TOKENS.colors.primaryDark, mb: 0.5 }}>
                    Sin Registros de Consumo en {nombreMesActual} {anioSeleccionado}
                  </Typography>
                  <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, maxWidth: 540, mx: 'auto', mb: 2 }}>
                    No se registran consumos reales ni mermas en este período. Recuerde que los consumos litográficos se contabilizan automáticamente al realizar el <strong>Cierre Técnico</strong> de cada orden de trabajo.
                  </Typography>
                  <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.slate, display: 'block' }}>
                    Puede consultar períodos anteriores utilizando los selectores superiores de Mes y Año.
                  </Typography>
                </Box>
              )
            )}

            {/* VISTA 2: ESTADO DE ALMACÉN */}
            {reporteActivo === 'inventario' && (
              filasInventarioFiltradas.length > 0 ? (
                <TableContainer>
                  <Table sx={{ minWidth: 720 }}>
                    <TableHead sx={{ backgroundColor: UAGRM_TOKENS.colors.background.subtle }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.slate, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                          Código
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.slate, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                          Insumo Litográfico
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.slate, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                          Stock Actual
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.slate, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                          Stock Mínimo
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.slate, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                          U. Medida
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.slate, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                          Costo Rep. (Bs.)
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.slate, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                          Estado Semafórico
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filasInventarioFiltradas.map((item) => {
                        const esCritico = Number(item.stock_actual) <= Number(item.stock_minimo);
                        return (
                          <TableRow
                            key={item.id_insumo}
                            hover
                            sx={{ '& td': { borderBottom: `1px solid ${UAGRM_TOKENS.border.subtle}`, py: 1.5 } }}
                          >
                            <TableCell sx={{ fontWeight: 700, color: UAGRM_TOKENS.colors.primaryDark, fontSize: '0.85rem' }}>
                              {item.codigo}
                            </TableCell>
                            <TableCell sx={{ color: UAGRM_TOKENS.colors.charcoal, fontSize: '0.875rem' }}>
                              {item.descripcion}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                fontWeight: 700,
                                color: esCritico ? UAGRM_TOKENS.colors.ruby : UAGRM_TOKENS.colors.emerald,
                                fontSize: '0.875rem',
                              }}
                            >
                              {Number(item.stock_actual).toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell align="right" sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.875rem' }}>
                              {Number(item.stock_minimo).toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.85rem' }}>
                              {item.unidad_medida}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: UAGRM_TOKENS.colors.charcoal, fontSize: '0.875rem' }}>
                              {Number(item.costo_reposicion).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.
                            </TableCell>
                            <TableCell align="center">
                              {esCritico ? (
                                <Badge variant="error" dot>
                                  Stock Crítico
                                </Badge>
                              ) : (
                                <Badge variant="success" dot>
                                  Nivel Óptimo
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : modoAlmacen === 'alerta' ? (
                <Box sx={{ py: 6, px: 3, textAlign: 'center' }}>
                  <CheckCircle2 size={46} color={UAGRM_TOKENS.colors.emerald} style={{ margin: '0 auto 14px' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: UAGRM_TOKENS.colors.primaryDark, mb: 0.5 }}>
                    Almacén en Niveles Óptimos
                  </Typography>
                  <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, maxWidth: 520, mx: 'auto', mb: 2.5 }}>
                    Actualmente no existen insumos por debajo del umbral mínimo de seguridad. Todas las materias primas del taller litográfico se encuentran con abastecimiento suficiente.
                  </Typography>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => {
                      setModoAlmacen('todos');
                      cargarReporte('inventario', undefined, undefined, 'todos');
                    }}
                    icon={<Layers size={16} />}
                  >
                    Ver Inventario Completo de Taller
                  </Button>
                </Box>
              ) : (
                <Box sx={{ py: 6, px: 3, textAlign: 'center' }}>
                  <Layers size={46} color={UAGRM_TOKENS.colors.slate} style={{ margin: '0 auto 14px' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: UAGRM_TOKENS.colors.primaryDark, mb: 0.5 }}>
                    Sin Insumos en el Catálogo
                  </Typography>
                  <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, maxWidth: 480, mx: 'auto' }}>
                    No se encontraron insumos activos en la base de datos institucional.
                  </Typography>
                </Box>
              )
            )}

            {/* VISTA 3: PROFORMAS Y COTIZACIONES */}
            {reporteActivo === 'proformas' && (
              filasProformasFiltradas.length > 0 ? (
                <TableContainer>
                  <Table sx={{ minWidth: 700 }}>
                    <TableHead sx={{ backgroundColor: UAGRM_TOKENS.colors.background.subtle }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.slate, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                          Nº Proforma
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.slate, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                          Cliente Institucional
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.slate, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                          Tipo de Trabajo
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.slate, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                          Tiraje
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.slate, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                          Total Presupuesto
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.slate, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                          Estado
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filasProformasFiltradas.map((item) => {
                        let estadoVariant: 'info' | 'success' | 'error' | 'primary' = 'info';
                        if (item.estado === 'APROBADA') estadoVariant = 'success';
                        else if (item.estado === 'RECHAZADA') estadoVariant = 'error';
                        else if (item.estado === 'CERRADA') estadoVariant = 'primary';

                        return (
                          <TableRow
                            key={item.id_proforma}
                            hover
                            sx={{ '& td': { borderBottom: `1px solid ${UAGRM_TOKENS.border.subtle}`, py: 1.5 } }}
                          >
                            <TableCell sx={{ fontWeight: 700, color: UAGRM_TOKENS.colors.primaryDark, fontSize: '0.85rem' }}>
                              {item.numero_proforma || `#PROF-${item.id_proforma}`}
                            </TableCell>
                            <TableCell sx={{ color: UAGRM_TOKENS.colors.charcoal, fontSize: '0.875rem' }}>
                              {item.cliente?.nombre_razon_social || 'Cliente General'}
                            </TableCell>
                            <TableCell sx={{ color: UAGRM_TOKENS.colors.charcoal, fontSize: '0.875rem' }}>
                              {item.tipo_trabajo?.nombre || 'Trabajo Litográfico'}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: UAGRM_TOKENS.colors.charcoal, fontSize: '0.875rem' }}>
                              {item.tiraje ? Number(item.tiraje).toLocaleString('es-BO') : '-'}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: UAGRM_TOKENS.colors.primaryDark, fontSize: '0.875rem' }}>
                              {item.total_presupuesto
                                ? `${Number(item.total_presupuesto).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.`
                                : '-'}
                            </TableCell>
                            <TableCell align="center">
                              <Badge variant={estadoVariant}>{item.estado || 'EMITIDA'}</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ py: 6, px: 3, textAlign: 'center' }}>
                  <FileText size={46} color={UAGRM_TOKENS.colors.slate} style={{ margin: '0 auto 14px' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: UAGRM_TOKENS.colors.primaryDark, mb: 0.5 }}>
                    Sin Proformas Registradas
                  </Typography>
                  <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, maxWidth: 480, mx: 'auto' }}>
                    No se encontraron cotizaciones litográficas con los filtros seleccionados.
                  </Typography>
                </Box>
              )
            )}
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default ReportesPage;
