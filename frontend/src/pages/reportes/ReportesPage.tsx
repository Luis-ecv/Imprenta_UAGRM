import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import {
  BarChart3,
  Download,
  Layers,
  FileText,
  TrendingDown,
  RefreshCw,
  Search,
  X,
  Printer,
  CheckCircle2,
} from 'lucide-react'
import { reportesApi } from '@/api/reportes.api'
import { UAGRM_COLORS } from '@/theme/uagrmTheme'

type TipoReporte = 'consumo' | 'proformas' | 'inventario'

interface TabConfig {
  key: TipoReporte
  label: string
  icon: typeof TrendingDown
  descripcion: string
}

const TABS_REPORTES: TabConfig[] = [
  {
    key: 'consumo',
    label: 'Consumo y Mermas',
    icon: TrendingDown,
    descripcion: 'Análisis de insumos utilizados, pliegos útiles y porcentaje de desperdicio litográfico.',
  },
  {
    key: 'proformas',
    label: 'Proformas y Finanzas',
    icon: FileText,
    descripcion: 'Rendimiento financiero, montos cotizados vs. órdenes aprobadas por facultad.',
  },
  {
    key: 'inventario',
    label: 'Estado de Almacén',
    icon: Layers,
    descripcion: 'Disponibilidad de insumos críticos, puntos de reorden y rotación de stock.',
  },
]

export function ReportesPage() {
  const [cargando, setCargando] = useState<boolean>(false)
  const [reporteActivo, setReporteActivo] = useState<TipoReporte>('consumo')
  const [busqueda, setBusqueda] = useState<string>('')
  const [datosReporte, setDatosReporte] = useState<unknown>(null)

  async function cargarReporte(tipo: TipoReporte) {
    try {
      setCargando(true)
      setReporteActivo(tipo)
      let data: unknown
      if (tipo === 'consumo') {
        data = await reportesApi.consumo()
      } else if (tipo === 'proformas') {
        data = await reportesApi.proformas()
      } else {
        data = await reportesApi.inventario()
      }
      setDatosReporte(data)
    } catch {
      // Silencioso o manejo local
    } finally {
      setCargando(false)
    }
  }

  function handleImprimir() {
    window.print()
  }

  const tabActual = TABS_REPORTES.find((t) => t.key === reporteActivo) || TABS_REPORTES[0]

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
      {/* 1. Encabezado Oficial UAGRM con Botones Pill */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          {/* <Typography
            variant="overline"
            sx={{
              color: '#0284c7',
              fontWeight: 800,
              letterSpacing: '0.12em',
              fontSize: '0.75rem',
              display: 'block',
              mb: 0.5,
            }}
          >
            REPORTES ANALÍTICOS
          </Typography> */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#1e2b4d',
              letterSpacing: '-0.02em',
              mb: 0.5,
            }}
          >
            Informes de Gestión Litográfica
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
            {tabActual.descripcion}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            onClick={() => cargarReporte(reporteActivo)}
            disabled={cargando}
            startIcon={<RefreshCw size={16} className={cargando ? 'animate-spin' : ''} />}
            sx={{
              borderRadius: 50,
              textTransform: 'none',
              fontWeight: 700,
              color: '#475569',
              borderColor: '#e2e8f0',
              backgroundColor: '#ffffff',
              px: 2.2,
              py: 0.9,
              '&:hover': {
                borderColor: '#cbd5e1',
                backgroundColor: '#f8fafc',
              },
            }}
          >
            Actualizar
          </Button>

          <Button
            variant="contained"
            onClick={handleImprimir}
            startIcon={<Printer size={18} />}
            sx={{
              backgroundColor: '#1e2b4d',
              color: '#ffffff',
              borderRadius: 50,
              textTransform: 'none',
              fontWeight: 700,
              px: 2.8,
              py: 0.9,
              boxShadow: '0 4px 12px rgba(30, 43, 77, 0.2)',
              '&:hover': {
                backgroundColor: '#141d34',
              },
            }}
          >
            Imprimir / Exportar
          </Button>
        </Stack>
      </Box>

      {/* 2. Buscador Alargado y Pestañas Horizontales Oficiales */}
      <Box sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Buscar en el informe analítico o filtrar parámetros..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} color="#94a3b8" />
                </InputAdornment>
              ),
              endAdornment: busqueda ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setBusqueda('')}>
                    <X size={14} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
          sx={{
            maxWidth: { xs: '100%', md: 740 },
            width: '100%',
            mb: 2.5,
            backgroundColor: '#ffffff',
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: '#ffffff',
              '& fieldset': {
                borderColor: '#e2e8f0',
              },
              '&:hover fieldset': {
                borderColor: '#cbd5e1',
              },
            },
          }}
        />

        {/* Pestañas horizontales idénticas al estándar institucional: activo y hover en negro y negrita */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 2.5, sm: 4 },
            borderBottom: '1px solid #e8e4dc',
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            msOverflowStyle: 'none',
            pb: 0,
          }}
        >
          {TABS_REPORTES.map((tab) => {
            const isActive = reporteActivo === tab.key
            const Icon = tab.icon

            return (
              <Box
                key={tab.key}
                component="button"
                onClick={() => cargarReporte(tab.key)}
                sx={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  pb: 1.2,
                  px: 0.5,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  fontFamily: 'inherit',
                  fontSize: '0.925rem',
                  fontWeight: isActive ? 800 : 500,
                  color: isActive ? '#000000' : '#64748b',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    color: '#000000',
                    fontWeight: 800,
                  },
                  '&::after': isActive
                    ? {
                        content: '""',
                        position: 'absolute',
                        bottom: -1,
                        left: 0,
                        right: 0,
                        height: '2.5px',
                        backgroundColor: '#000000',
                        borderRadius: '2px 2px 0 0',
                      }
                    : undefined,
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </Box>
            )
          })}
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
            backgroundColor: '#ffffff',
            borderRadius: 3,
            border: '1px solid #ebe6df',
          }}
        >
          <CircularProgress size={36} sx={{ color: UAGRM_COLORS.blue.main }} />
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
            Generando y consolidando informe analítico...
          </Typography>
        </Box>
      ) : datosReporte ? (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid #ebe6df',
            backgroundColor: '#ffffff',
            overflow: 'hidden',
          }}
        >
          {/* Cabecera del Reporte Consolidado */}
          <Box
            sx={{
              backgroundColor: '#f7f4ee',
              p: 2.5,
              borderBottom: '1px solid #ebe6df',
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
                  color: '#1a1a1a',
                  textTransform: 'uppercase',
                  fontSize: '0.95rem',
                }}
              >
                Consolidado Oficial: {tabActual.label}
              </Typography>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
                Datos validados por el servidor • Taller Litográfico Imprenta UAGRM
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.8,
                backgroundColor: '#ecfdf5',
                color: '#047857',
                border: '1px solid #a7f3d0',
                borderRadius: 50,
                px: 1.8,
                py: 0.5,
                fontSize: '0.78rem',
                fontWeight: 700,
              }}
            >
              <CheckCircle2 size={14} /> Sincronizado
            </Box>
          </Box>

          <Box sx={{ p: 3 }}>
            {Array.isArray(datosReporte) && datosReporte.length > 0 ? (
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead sx={{ backgroundColor: '#faf8f5' }}>
                    <TableRow>
                      {Object.keys(datosReporte[0] as object).map((key) => (
                        <TableCell
                          key={key}
                          sx={{
                            fontWeight: 800,
                            color: '#475569',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            py: 1.5,
                            borderBottom: '1px solid #ebe6df',
                          }}
                        >
                          {key.replace(/_/g, ' ')}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(datosReporte as Record<string, unknown>[]).map((fila, idx) => (
                      <TableRow
                        key={idx}
                        hover
                        sx={{
                          '&:hover': { backgroundColor: '#faf8f5' },
                          '& td': { borderBottom: '1px solid #f0ede6', py: 1.5 },
                        }}
                      >
                        {Object.values(fila).map((val, cIdx) => (
                          <TableCell key={cIdx} sx={{ fontSize: '0.875rem', color: '#1a1a1a' }}>
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
                  backgroundColor: '#faf8f5',
                  borderRadius: 2,
                  border: '1px solid #ebe6df',
                  fontSize: '0.825rem',
                  fontFamily: 'monospace',
                  color: '#1a1a1a',
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
            backgroundColor: '#ffffff',
            borderRadius: 3,
            border: '1px dashed #cbd5e1',
          }}
        >
          <BarChart3 size={44} color="#94a3b8" style={{ margin: '0 auto 14px' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e2b4d', mb: 0.5 }}>
            Visualización del Informe: {tabActual.label}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 480, mx: 'auto', mb: 3 }}>
            Haga clic en &ldquo;Generar Reporte&rdquo; o &ldquo;Actualizar&rdquo; para consolidar los datos operativos de {tabActual.label.toLowerCase()} desde la base de datos institucional.
          </Typography>
          <Button
            variant="contained"
            onClick={() => cargarReporte(reporteActivo)}
            startIcon={<Download size={16} />}
            sx={{
              backgroundColor: '#1e2b4d',
              color: '#ffffff',
              borderRadius: 50,
              textTransform: 'none',
              fontWeight: 700,
              px: 3.5,
              py: 1,
              boxShadow: '0 4px 12px rgba(30, 43, 77, 0.2)',
              '&:hover': {
                backgroundColor: '#141d34',
              },
            }}
          >
            Generar Reporte Ahora
          </Button>
        </Paper>
      )}
    </Box>
  )
}
