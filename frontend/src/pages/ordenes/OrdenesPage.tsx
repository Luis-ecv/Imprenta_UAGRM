import { useState, useEffect, useCallback, useMemo } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import {
  Search,
  X,
  RefreshCw,
  Check,
  CheckCircle2,
  Printer,
} from 'lucide-react'
import { ordenesApi } from '@/api/ordenes.api'
import { insumosApi } from '@/api/insumos.api'
import { UAGRM_COLORS } from '@/theme/uagrmTheme'
import type { OrdenTrabajoResponse, InsumoResponse, EstadoOrden } from '@/types'
import { formatearFecha } from '@/utils/formatters'
import { TRANSICIONES_ESTADO } from '@/utils/constants'

// Definición secuencial exacta de las 6 estaciones de la imprenta litográfica
interface EtapaLitografica {
  id: EstadoOrden
  label: string
  color: string
}

const ETAPAS_LITOGRAFICAS: EtapaLitografica[] = [
  { id: 'REGISTRADO', label: 'Registradas', color: '#64748b' },
  { id: 'EN COLA', label: 'En cola', color: '#b45309' },
  { id: 'EN IMPRESION', label: 'En impresión', color: '#1d4ed8' },
  { id: 'EN ACABADO', label: 'En acabado', color: '#7c3aed' },
  { id: 'FINALIZADO', label: 'Finalizadas', color: '#047857' },
  { id: 'ENTREGADO', label: 'Entregadas', color: '#0f766e' },
]

// Cálculo reactivo de días restantes para la fecha de compromiso
function calcularCompromiso(fechaStr?: string | null) {
  if (!fechaStr) return { texto: 'Sin fecha', nivel: 'normal', dias: 999 }
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const partes = fechaStr.split('-')
  const compromiso = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]))
  compromiso.setHours(0, 0, 0, 0)

  const diffTime = compromiso.getTime() - hoy.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return { texto: `Vencida (${Math.abs(diffDays)}d)`, nivel: 'vencida', dias: diffDays }
  }
  if (diffDays === 0) {
    return { texto: 'Vence hoy', nivel: 'hoy', dias: 0 }
  }
  if (diffDays === 1) {
    return { texto: 'En 1 día', nivel: 'urgente', dias: 1 }
  }
  if (diffDays <= 7) {
    return { texto: `En ${diffDays} días`, nivel: 'semana', dias: diffDays }
  }
  return { texto: `En ${diffDays} días`, nivel: 'normal', dias: diffDays }
}

export function OrdenesPage() {
  const [ordenes, setOrdenes] = useState<OrdenTrabajoResponse[]>([])
  const [insumos, setInsumos] = useState<InsumoResponse[]>([])
  const [cargando, setCargando] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState<string>('')
  const [filtroTab, setFiltroTab] = useState<string>('TODAS')

  // Modal de Cierre Técnico
  const [ordenParaCierre, setOrdenParaCierre] = useState<OrdenTrabajoResponse | null>(null)
  const [insumoId, setInsumoId] = useState<number | ''>('')
  const [papelUtilizado, setPapelUtilizado] = useState<string>('500')
  const [papelMerma, setPapelMerma] = useState<string>('15')
  const [tintaUtilizada, setTintaUtilizada] = useState<string>('0.8')
  const [planchasUtilizadas, setPlanchasUtilizadas] = useState<string>('4')
  const [planchasMerma, setPlanchasMerma] = useState<string>('0')
  const [observacionesCierre, setObservacionesCierre] = useState<string>('')
  const [guardandoCierre, setGuardandoCierre] = useState<boolean>(false)

  const cargarOrdenes = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      const [resOrdenes, resInsumos] = await Promise.all([
        ordenesApi.listar({ por_pagina: 150 }),
        insumosApi.listar({ por_pagina: 100 }),
      ])
      setOrdenes(resOrdenes.datos || [])
      setInsumos(resInsumos.datos || [])
      if (resInsumos.datos?.length > 0) {
        setInsumoId(resInsumos.datos[0].id_insumo)
      }
    } catch {
      setError('No se pudieron sincronizar las órdenes de trabajo del servidor.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarOrdenes()
  }, [cargarOrdenes])

  async function handleAvanzarEstado(orden: OrdenTrabajoResponse) {
    const siguienteEstado = TRANSICIONES_ESTADO[orden.estado_actual]
    if (!siguienteEstado) return

    // Si avanza a FINALIZADO, requerir cierre técnico y registro de consumo real
    if (siguienteEstado === 'FINALIZADO') {
      setOrdenParaCierre(orden)
      return
    }

    try {
      await ordenesApi.cambiarEstado(orden.id_orden, {
        estado_nuevo: siguienteEstado,
        observaciones: `Avance operativo a ${siguienteEstado}`,
      })
      cargarOrdenes()
    } catch {
      setError(`Error al cambiar el estado de la orden ${orden.codigo_ot} a ${siguienteEstado}.`)
    }
  }

  // Totales calculados en el modal de cierre técnico
  const totalesModal = useMemo(() => {
    const pU = Math.max(0, parseFloat(papelUtilizado) || 0)
    const pM = Math.max(0, parseFloat(papelMerma) || 0)
    const plU = Math.max(0, parseFloat(planchasUtilizadas) || 0)
    const plM = Math.max(0, parseFloat(planchasMerma) || 0)
    return {
      papelTotal: pU + pM,
      planchasTotal: plU + plM,
    }
  }, [papelUtilizado, papelMerma, planchasUtilizadas, planchasMerma])

  async function handleConfirmarCierre(event: React.FormEvent) {
    event.preventDefault()
    if (!ordenParaCierre) return

    try {
      setGuardandoCierre(true)

      // 1. Registrar el consumo real de sustrato y merma
      if (insumoId) {
        await ordenesApi.registrarConsumoReal(ordenParaCierre.id_orden, {
          orden_id: ordenParaCierre.id_orden,
          insumo_id: Number(insumoId),
          cantidad_utilizada: parseFloat(papelUtilizado) || 0,
          cantidad_merma: parseFloat(papelMerma) || 0,
        })
      }

      // 2. Avanzar estado a FINALIZADO
      await ordenesApi.cambiarEstado(ordenParaCierre.id_orden, {
        estado_nuevo: 'FINALIZADO',
        observaciones: observacionesCierre || 'Cierre técnico de taller con registro de consumo real y merma.',
      })

      setOrdenParaCierre(null)
      cargarOrdenes()
    } catch {
      setError('Error al registrar el consumo real y finalizar la orden.')
    } finally {
      setGuardandoCierre(false)
    }
  }

  // Pestañas dinámicas con conteo
  const tabsFiltro = useMemo(() => {
    const conteo = {
      TODAS: ordenes.length,
      PROCESO: ordenes.filter((o) => o.estado_actual !== 'ENTREGADO').length,
      VENCEN_7D: ordenes.filter((o) => {
        const c = calcularCompromiso(o.fecha_compromiso)
        return o.estado_actual !== 'ENTREGADO' && c.dias >= 0 && c.dias <= 7
      }).length,
      ALTA: ordenes.filter((o) => o.prioridad === 'URGENTE').length,
      ENTREGADAS: ordenes.filter((o) => o.estado_actual === 'ENTREGADO').length,
    }

    return [
      { key: 'TODAS', label: 'Todas', count: conteo.TODAS },
      { key: 'PROCESO', label: 'En Proceso', count: conteo.PROCESO },
      { key: 'VENCEN_7D', label: 'Vencen en 7 días', count: conteo.VENCEN_7D },
      { key: 'ALTA', label: 'Prioridad Urgente / Alta', count: conteo.ALTA },
      { key: 'ENTREGADAS', label: 'Entregadas', count: conteo.ENTREGADAS },
    ]
  }, [ordenes])

  // Filtrado reactivo de órdenes
  const ordenesFiltradas = useMemo(() => {
    return ordenes.filter((o) => {
      // Filtro pestaña
      if (filtroTab === 'PROCESO' && o.estado_actual === 'ENTREGADO') return false
      if (filtroTab === 'VENCEN_7D') {
        const c = calcularCompromiso(o.fecha_compromiso)
        if (o.estado_actual === 'ENTREGADO' || c.dias < 0 || c.dias > 7) return false
      }
      if (filtroTab === 'ALTA' && o.prioridad !== 'URGENTE') return false
      if (filtroTab === 'ENTREGADAS' && o.estado_actual !== 'ENTREGADO') return false

      // Filtro texto
      const termino = busqueda.toLowerCase().trim()
      if (!termino) return true

      const desc = o.proforma?.detalles?.[0]?.descripcion_trabajo?.toLowerCase() || ''
      const cliente = o.proforma?.cliente?.razon_social?.toLowerCase() || ''
      const codigo = o.codigo_ot.toLowerCase()

      return desc.includes(termino) || cliente.includes(termino) || codigo.includes(termino)
    })
  }, [ordenes, busqueda, filtroTab])

  // Estilo visual del botón de acción según la etapa destino
  const getActionConfig = (orden: OrdenTrabajoResponse) => {
    const siguiente = TRANSICIONES_ESTADO[orden.estado_actual]
    if (!siguiente) {
      return {
        esFinal: true,
        label: '✓ Entregada',
        color: '#047857',
        bg: 'transparent',
        border: 'transparent',
      }
    }

    switch (siguiente) {
      case 'EN COLA':
        return {
          esFinal: false,
          label: 'Enviar a cola ➔',
          color: '#9a3412',
          border: '#ea580c',
          bgHover: '#fff7ed',
        }
      case 'EN IMPRESION':
        return {
          esFinal: false,
          label: 'Enviar a impresión ➔',
          color: '#1d4ed8',
          border: '#2563eb',
          bgHover: '#eff6ff',
        }
      case 'EN ACABADO':
        return {
          esFinal: false,
          label: 'Pasar a acabado ➔',
          color: '#7c3aed',
          border: '#8b5cf6',
          bgHover: '#faf5ff',
        }
      case 'FINALIZADO':
        return {
          esFinal: false,
          label: 'Marcar finalizada ➔',
          color: '#047857',
          border: '#059669',
          bgHover: '#ecfdf5',
        }
      case 'ENTREGADO':
        return {
          esFinal: false,
          label: 'Entregar a cliente ➔',
          color: '#0f766e',
          border: '#0d9488',
          bgHover: '#f0fdfa',
        }
      default:
        return {
          esFinal: false,
          label: `Avanzar a ${siguiente} ➔`,
          color: '#1e2b4d',
          border: '#1e2b4d',
          bgHover: '#f8fafc',
        }
    }
  }

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
      {/* 1. Encabezado Oficial UAGRM */}
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
            CENTRO DE OPERACIONES Y TALLER
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
            Tablero de Producción Litográfica
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
            Supervisa el flujo secuencial de los trabajos en prensa offset, acabados y registro de mermas.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            onClick={cargarOrdenes}
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
        </Stack>
      </Box>

      {/* Alerta de Error General */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 2. Buscador Alargado y Pestañas Horizontales */}
      <Box sx={{ mb: 2.5 }}>
        <TextField
          size="small"
          placeholder="Buscar por código, trabajo o cliente..."
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

        {/* Pestañas horizontales idénticas al estándar: activo y hover en negro y negrita */}
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
          {tabsFiltro.map((tab) => {
            const isActive = filtroTab === tab.key
            return (
              <Box
                key={tab.key}
                component="button"
                onClick={() => setFiltroTab(tab.key)}
                sx={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  pb: 1.2,
                  px: 0.5,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.8,
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
                  '&:hover span': {
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
                <span>{tab.label}</span>
                <Typography
                  component="span"
                  sx={{
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 800 : 500,
                    color: isActive ? '#000000' : '#64748b',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.count}
                </Typography>
              </Box>
            )
          })}
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
            backgroundColor: '#ffffff',
            borderRadius: 3,
            border: '1px solid #ebe6df',
          }}
        >
          <CircularProgress size={36} sx={{ color: UAGRM_COLORS.blue.main }} />
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
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
            backgroundColor: '#ffffff',
            borderRadius: 3,
            border: '1px dashed #cbd5e1',
          }}
        >
          <Printer size={44} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e2b4d', mb: 0.5 }}>
            No hay órdenes de trabajo en esta etapa
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 440, mx: 'auto' }}>
            Prueba cambiando el filtro de búsqueda o genera una nueva orden aprobando una proforma en mostrador.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {ordenesFiltradas.map((orden) => {
            const detalle = orden.detalles_orden?.[0]
            const proformaDetalle = orden.proforma?.detalles?.[0]
            const compromisoInfo = calcularCompromiso(orden.fecha_compromiso)
            const action = getActionConfig(orden)

            // Posición de la etapa actual (0 a 5)
            const currentStageIndex = ETAPAS_LITOGRAFICAS.findIndex((e) => e.id === orden.estado_actual)
            const activeStage = ETAPAS_LITOGRAFICAS[currentStageIndex] || ETAPAS_LITOGRAFICAS[0]
            const accentColor = activeStage.color

            // Badge de prioridad
            const esUrgente = orden.prioridad === 'URGENTE'

            return (
              <Paper
                key={orden.id_orden}
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 2.5, md: 3 },
                  borderRadius: 3.5,
                  backgroundColor: '#ffffff',
                  border: '1px solid #e8e4dc',
                  transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                    borderColor: '#cbd5e1',
                  },
                }}
              >
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  {/* SECCIÓN 1: Identificación y Detalle Litográfico (Izquierda) */}
                  <Grid size={{ xs: 12, md: 3.8 }}>
                    <Box sx={{ pr: { md: 1 } }}>
                      {/* Código + Prioridad Pill */}
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.8 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            
                            fontWeight: 800,
                            color: '#475569',
                            fontSize: '0.85rem',
                          }}
                        >
                          {orden.codigo_ot}
                        </Typography>

                        <Box
                          component="span"
                          sx={{
                            borderRadius: 50,
                            px: 1.2,
                            py: 0.2,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            backgroundColor: esUrgente ? '#fef2f2' : '#f1f5f9',
                            color: esUrgente ? '#dc2626' : '#475569',
                            border: `1px solid ${esUrgente ? '#fecaca' : '#e2e8f0'}`,
                          }}
                        >
                          {orden.prioridad}
                        </Box>
                      </Stack>

                      {/* Título del Trabajo en MAYÚSCULAS Y NEGRITA */}
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 800,
                          color: '#0f172a',
                          fontSize: '0.98rem',
                          lineHeight: 1.25,
                          mb: 0.6,
                        }}
                      >
                        {proformaDetalle?.descripcion_trabajo || `Trabajo OT #${orden.id_orden}`}
                      </Typography>

                      {/* Subtítulo: Cliente y especificaciones técnicas */}
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#64748b',
                          fontSize: '0.8rem',
                          lineHeight: 1.4,
                          display: 'block',
                        }}
                      >
                        {orden.proforma?.cliente?.razon_social || 'Cliente UAGRM'}
                        {detalle?.formato_corte ? ` · ${detalle.formato_corte}` : ''}
                        {detalle?.tipo_encuadernacion ? ` · ${detalle.tipo_encuadernacion}` : ''}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* SECCIÓN 2: Stepper Horizontal Litográfico (Centro) */}
                  <Grid size={{ xs: 12, md: 5.4 }}>
                    <Box sx={{ px: { xs: 0, md: 1 } }}>
                      {/* Contenedor Stepper */}
                      <Box sx={{ position: 'relative', width: '100%', py: 1 }}>
                        {/* Línea base completa gris */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 15,
                            left: '8%',
                            right: '8%',
                            height: '3px',
                            backgroundColor: '#e2e8f0',
                            zIndex: 1,
                          }}
                        />

                        {/* Línea coloreada activa hasta el paso actual */}
                        {currentStageIndex > 0 && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 15,
                              left: '8%',
                              width: `${(currentStageIndex / (ETAPAS_LITOGRAFICAS.length - 1)) * 84}%`,
                              height: '3px',
                              backgroundColor: accentColor,
                              transition: 'width 0.4s ease',
                              zIndex: 2,
                            }}
                          />
                        )}

                        {/* Nodos y etiquetas de cada estación */}
                        <Box
                          sx={{
                            position: 'relative',
                            zIndex: 3,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                          }}
                        >
                          {ETAPAS_LITOGRAFICAS.map((etapa, idx) => {
                            const isCompleted = idx < currentStageIndex
                            const isCurrent = idx === currentStageIndex

                            return (
                              <Box
                                key={etapa.id}
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  width: '16.6%',
                                }}
                              >
                                {/* Punto circular del nodo */}
                                <Box
                                  sx={{
                                    width: isCurrent ? 18 : 14,
                                    height: isCurrent ? 18 : 14,
                                    borderRadius: '50%',
                                    backgroundColor: isCompleted
                                      ? accentColor
                                      : isCurrent
                                      ? '#ffffff'
                                      : '#ffffff',
                                    border: isCompleted
                                      ? `3px solid ${accentColor}`
                                      : isCurrent
                                      ? `4px solid ${accentColor}`
                                      : '3px solid #cbd5e1',
                                    transition: 'all 0.3s ease',
                                    boxShadow: isCurrent ? `0 0 0 3px rgba(0,0,0,0.05)` : 'none',
                                    mb: 0.8,
                                  }}
                                />

                                {/* Texto de la estación debajo */}
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: '0.68rem',
                                    textAlign: 'center',
                                    whiteSpace: 'nowrap',
                                    fontWeight: isCurrent ? 800 : isCompleted ? 600 : 500,
                                    color: isCurrent
                                      ? '#0f172a'
                                      : isCompleted
                                      ? '#334155'
                                      : '#94a3b8',
                                    letterSpacing: '-0.01em',
                                  }}
                                >
                                  {etapa.label}
                                </Typography>
                              </Box>
                            )
                          })}
                        </Box>
                      </Box>
                    </Box>
                  </Grid>

                  {/* SECCIÓN 3: Compromiso y Botón de Acción Directo (Derecha) */}
                  <Grid size={{ xs: 12, md: 2.8 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: { xs: 'flex-start', md: 'flex-end' },
                        gap: 1.2,
                      }}
                    >
                      {/* Fecha de Compromiso + Badge Semántico */}
                      <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.78rem' }}>
                          Compromiso{' '}
                          <strong style={{ color: '#0f172a' }}>
                            {formatearFecha(orden.fecha_compromiso)}
                          </strong>
                        </Typography>

                        {compromisoInfo.texto && orden.estado_actual !== 'ENTREGADO' && (
                          <Box
                            component="span"
                            sx={{
                              borderRadius: 50,
                              px: 1,
                              py: 0.2,
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                              backgroundColor:
                                compromisoInfo.nivel === 'vencida' || compromisoInfo.nivel === 'hoy'
                                  ? '#fef2f2'
                                  : compromisoInfo.nivel === 'urgente' || compromisoInfo.nivel === 'semana'
                                  ? '#fef3c7'
                                  : '#f1f5f9',
                              color:
                                compromisoInfo.nivel === 'vencida' || compromisoInfo.nivel === 'hoy'
                                  ? '#dc2626'
                                  : compromisoInfo.nivel === 'urgente' || compromisoInfo.nivel === 'semana'
                                  ? '#b45309'
                                  : '#475569',
                              border: `1px solid ${
                                compromisoInfo.nivel === 'vencida' || compromisoInfo.nivel === 'hoy'
                                  ? '#fecaca'
                                  : compromisoInfo.nivel === 'urgente' || compromisoInfo.nivel === 'semana'
                                  ? '#fde68a'
                                  : '#e2e8f0'
                              }`,
                            }}
                          >
                            {compromisoInfo.texto}
                          </Box>
                        )}
                      </Stack>

                      {/* Botón de Acción de Avance de Estación */}
                      {action.esFinal ? (
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.6,
                            color: '#047857',
                            fontWeight: 800,
                            fontSize: '0.88rem',
                            py: 0.7,
                          }}
                        >
                          <CheckCircle2 size={18} /> {action.label}
                        </Box>
                      ) : (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleAvanzarEstado(orden)}
                          sx={{
                            borderRadius: 50,
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.825rem',
                            px: 2.2,
                            py: 0.7,
                            color: action.color,
                            borderColor: action.border,
                            backgroundColor: '#ffffff',
                            width: { xs: '100%', sm: 'auto' },
                            '&:hover': {
                              backgroundColor: action.bgHover,
                              borderColor: action.border,
                            },
                          }}
                        >
                          {action.label}
                        </Button>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )
          })}
        </Stack>
      )}

      {/* MODAL DIALOG OFICIAL UAGRM: CIERRE TÉCNICO DE PRODUCCIÓN Y MERMAS */}
      <Dialog
        open={Boolean(ordenParaCierre)}
        onClose={() => !guardandoCierre && setOrdenParaCierre(null)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3.5,
              p: 1,
              maxHeight: '90vh',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3, position: 'relative', textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e2b4d', fontSize: '1.5rem', mb: 0.5 }}>
            Cierre Técnico y Reporte de Mermas
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.875rem' }}>
            Taller de Producción Litográfica
          </Typography>
          <IconButton
            onClick={() => setOrdenParaCierre(null)}
            disabled={guardandoCierre}
            size="small"
            sx={{ position: 'absolute', right: 16, top: 16, color: '#94a3b8', '&:hover': { color: '#475569' } }}
          >
            <X size={18} />
          </IconButton>
        </DialogTitle>

        {ordenParaCierre && (
          <form onSubmit={handleConfirmarCierre}>
            <DialogContent sx={{ px: 2.5, py: 1.5 }}>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2, fontSize: '0.85rem' }}>
                Registra el consumo real y las mermas generadas para {ordenParaCierre.codigo_ot}. Los datos descontarán automáticamente el inventario de almacén y alimentarán el dataset de inferencia ML.
              </Typography>

              <Box sx={{ p: 2, mb: 2.5, borderRadius: 2.5, border: `1px solid ${UAGRM_COLORS.border}`, backgroundColor: '#f8fafc' }}>
                <Typography variant="body2" sx={{ fontWeight: 800, color: UAGRM_COLORS.blue.dark }}>
                  {ordenParaCierre.codigo_ot} — {ordenParaCierre.proforma?.detalles?.[0]?.descripcion_trabajo || 'Trabajo Litográfico'}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    select
                    required
                    size="small"
                    label="Insumo de Sustrato Principal *"
                    value={insumoId}
                    onChange={(e) => setInsumoId(Number(e.target.value))}
                  >
                    {insumos.map((i) => (
                      <MenuItem key={i.id_insumo} value={i.id_insumo}>
                        {i.codigo} - {i.descripcion} (Stock: {i.stock_actual} {i.unidad_medida})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Pliegos Útiles (Ejemplares OK)"
                    value={papelUtilizado}
                    onChange={(e) => setPapelUtilizado(e.target.value)}
                    slotProps={{ htmlInput: { min: 0 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Merma de Calibración"
                    value={papelMerma}
                    onChange={(e) => setPapelMerma(e.target.value)}
                    slotProps={{ htmlInput: { min: 0 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, border: `1px solid ${UAGRM_COLORS.border}`, backgroundColor: '#f8fafc', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                      Total a Deducir
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e2b4d', fontFamily: 'monospace' }}>
                      {totalesModal.papelTotal} pliegos
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Tinta CMYK Utilizada (kg)"
                    value={tintaUtilizada}
                    onChange={(e) => setTintaUtilizada(e.target.value)}
                    slotProps={{ htmlInput: { min: 0, step: '0.1' } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Planchas OK"
                      value={planchasUtilizadas}
                      onChange={(e) => setPlanchasUtilizadas(e.target.value)}
                      slotProps={{ htmlInput: { min: 0 } }}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Planchas Merma"
                      value={planchasMerma}
                      onChange={(e) => setPlanchasMerma(e.target.value)}
                      slotProps={{ htmlInput: { min: 0 } }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    label="Observaciones Técnicas de Producción"
                    placeholder="Ej. Merma por ajuste de registro en pinzas y secado rápido..."
                    value={observacionesCierre}
                    onChange={(e) => setObservacionesCierre(e.target.value)}
                  />
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, pt: 2, borderTop: `1px solid ${UAGRM_COLORS.border}`, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2.5 }}>
              <Button
                onClick={() => setOrdenParaCierre(null)}
                disabled={guardandoCierre}
                sx={{
                  backgroundColor: '#607285',
                  color: '#ffffff',
                  fontWeight: 700,
                  px: 3.5,
                  py: 1.1,
                  borderRadius: 50,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  minWidth: 125,
                  '&:hover': {
                    backgroundColor: '#4f5e6d',
                  },
                }}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={guardandoCierre}
                endIcon={guardandoCierre ? <CircularProgress size={16} color="inherit" /> : <Check size={18} />}
                sx={{
                  backgroundColor: '#1e2b4d',
                  color: '#ffffff',
                  fontWeight: 700,
                  px: 3.5,
                  py: 1.1,
                  borderRadius: 50,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  minWidth: 185,
                  boxShadow: '0 2px 8px rgba(30, 43, 77, 0.25)',
                  '&:hover': {
                    backgroundColor: '#141d34',
                  },
                }}
              >
                {guardandoCierre ? 'Confirmando...' : 'Confirmar'}
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>
    </Box>
  )
}
