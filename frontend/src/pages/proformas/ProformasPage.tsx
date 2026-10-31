import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Tooltip from '@mui/material/Tooltip'
import InputAdornment from '@mui/material/InputAdornment'
import { alpha } from '@mui/material/styles'
import {
  FileText,
  Plus,
  Printer,
  CheckCircle,
  XCircle,
  PlayCircle,
  Search,
  Calendar,
  X,
  Calculator,
  Layers,
  ExternalLink,
  Check,
  RefreshCw,
} from 'lucide-react'
import { proformasApi } from '@/api/proformas.api'
import { ordenesApi } from '@/api/ordenes.api'
import { clientesApi } from '@/api/clientes.api'
import { tarifasApi, type TipoTrabajoResponse } from '@/api/tarifas.api'
import { UAGRM_COLORS } from '@/theme/uagrmTheme'
import type { ProformaResponse, EstadoProforma, PrioridadOrden, ClienteResponse, Modalidad } from '@/types'
import { formatearMoneda, formatearFecha } from '@/utils/formatters'
import { imprimirDocumentoHtml, abrirDocumentoEnPestana } from '@/utils/impresion'

export function ProformasPage() {
  const navigate = useNavigate()

  // Lista de proformas y filtros
  const [proformas, setProformas] = useState<ProformaResponse[]>([])
  const [cargando, setCargando] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<string>('TODAS')
  const [busqueda, setBusqueda] = useState<string>('')

  // Catálogos maestros para el Popup de Nueva Proforma
  const [clientes, setClientes] = useState<ClienteResponse[]>([])
  const [tiposTrabajo, setTiposTrabajo] = useState<TipoTrabajoResponse[]>([])
  const [cargandoMaestros, setCargandoMaestros] = useState<boolean>(false)

  // Estado del MODAL DIALOG "Nueva Proforma" (Diseño Oficial MUI UAGRM)
  const [modalNuevaProforma, setModalNuevaProforma] = useState<boolean>(false)
  const [clienteId, setClienteId] = useState<number | ''>('')
  const [tipoTrabajoId, setTipoTrabajoId] = useState<number | ''>('')
  const [descripcionTrabajo, setDescripcionTrabajo] = useState<string>('')
  const [modalidad, setModalidad] = useState<Modalidad>('insumos_imprenta')
  const [tiraje, setTiraje] = useState<number>(1000)
  const [numeroPaginas, setNumeroPaginas] = useState<number>(64)
  const [diasVigencia, setDiasVigencia] = useState<number>(15)
  const [guardandoProforma, setGuardandoProforma] = useState<boolean>(false)
  const [errorModal, setErrorModal] = useState<string | null>(null)

  // Modal Vista Previa / Impresión de Proforma Oficial Emitida
  const [modalPreviewAbierto, setModalPreviewAbierto] = useState<boolean>(false)
  const [proformaEmitida, setProformaEmitida] = useState<ProformaResponse | null>(null)
  const [htmlDoc, setHtmlDoc] = useState<string>('')
  const [cargandoHtml, setCargandoHtml] = useState<boolean>(false)

  // Modal para generar Orden de Trabajo desde Proforma Aprobada
  const [proformaParaOT, setProformaParaOT] = useState<ProformaResponse | null>(null)
  const [fechaCompromiso, setFechaCompromiso] = useState<string>('')
  const [prioridad, setPrioridad] = useState<PrioridadOrden>('NORMAL')
  const [formatoCorte, setFormatoCorte] = useState<string>('Carta 21.5 x 28 cm')
  const [tipoEncuadernacion, setTipoEncuadernacion] = useState<string>('Anillado plástico')
  const [especificaciones, setEspecificaciones] = useState<string>('')
  const [creandoOT, setCreandoOT] = useState<boolean>(false)

  // Cargar proformas de la base de datos (carga catálogo completo para contadores)
  const cargarProformas = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      const res = await proformasApi.listar({ por_pagina: 150 })
      setProformas(res.datos || [])
    } catch {
      setError('No se pudieron cargar las proformas del servidor.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarProformas()
  }, [cargarProformas])

  // Contadores dinámicos por estado
  const tabsEstado = useMemo(() => {
    return [
      { key: 'TODAS', label: 'Todas', count: proformas.length },
      { key: 'EMITIDA', label: 'Emitida', count: proformas.filter((p) => p.estado === 'EMITIDA').length },
      { key: 'APROBADA', label: 'Aprobada', count: proformas.filter((p) => p.estado === 'APROBADA').length },
      { key: 'RECHAZADA', label: 'Rechazada', count: proformas.filter((p) => p.estado === 'RECHAZADA').length },
      { key: 'VENCIDA', label: 'Vencida', count: proformas.filter((p) => p.estado === 'VENCIDA').length },
    ]
  }, [proformas])

  // Helper de badge de estado suave
  const renderEstadoBadge = (estado: EstadoProforma | string) => {
    let bg = '#eef8fc'
    let color = '#0284c7'

    switch (estado) {
      case 'EMITIDA':
        bg = '#eef8fc'
        color = '#0284c7'
        break
      case 'APROBADA':
        bg = '#f0fdf4'
        color = '#16a34a'
        break
      case 'RECHAZADA':
        bg = '#fef2f2'
        color = '#dc2626'
        break
      case 'VENCIDA':
        bg = '#fef3c7'
        color = '#b45309'
        break
    }

    return (
      <Box
        sx={{
          display: 'inline-block',
          px: 1.6,
          py: 0.35,
          borderRadius: 50,
          backgroundColor: bg,
          color: color,
          fontWeight: 700,
          fontSize: '0.78rem',
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        {estado}
      </Box>
    )
  }

  // Cargar catálogos maestros cuando se abre el Popup de Nueva Proforma
  const handleAbrirModalNueva = async () => {
    setErrorModal(null)
    setModalNuevaProforma(true)
    if (clientes.length === 0 || tiposTrabajo.length === 0) {
      try {
        setCargandoMaestros(true)
        const [resClientes, resTipos] = await Promise.all([
          clientesApi.listar({ por_pagina: 100 }),
          tarifasApi.listarTiposTrabajo(),
        ])
        setClientes(resClientes.datos || [])
        setTiposTrabajo(resTipos || [])
        if (!clienteId && resClientes.datos?.length > 0) {
          setClienteId(resClientes.datos[0].id_cliente)
        }
        if (!tipoTrabajoId && resTipos?.length > 0) {
          setTipoTrabajoId(resTipos[0].id_tipo_trabajo)
        }
      } catch {
        setErrorModal('Error al cargar clientes o tipos de trabajo.')
      } finally {
        setCargandoMaestros(false)
      }
    }
  }

  // Cálculo paramétrico automático de costos litográficos
  const calculos = useMemo(() => {
    const safeTiraje = Math.max(0, Number(tiraje) || 0)
    const safePaginas = Math.max(0, Number(numeroPaginas) || 0)
    // Pliegos = (Tiraje * Páginas) / 2 páginas por pliego doble cara
    const hojas = Math.ceil((safeTiraje * safePaginas) / 2)

    // Costo Papel: 0 si la modalidad es insumos_cliente
    const costoPapel = modalidad === 'insumos_imprenta' ? Number((hojas * 0.45).toFixed(2)) : 0
    const costoTinta = Number((safeTiraje * safePaginas * 0.04).toFixed(2))
    const costoPlanchas = 150 * 4 // 4 planchas CTP térmicas (CMYK) = 600 Bs
    const costoManoObra = Number((50 + safeTiraje * 0.05).toFixed(2))
    const total = Number((costoPapel + costoTinta + costoPlanchas + costoManoObra).toFixed(2))

    return {
      hojas,
      costoPapel,
      costoTinta,
      costoPlanchas,
      costoManoObra,
      total,
    }
  }, [modalidad, tiraje, numeroPaginas])

  // Guardar nueva proforma desde el Popup
  async function handleGuardarProforma(event: React.FormEvent) {
    event.preventDefault()
    if (!clienteId || !tipoTrabajoId || !descripcionTrabajo.trim()) {
      setErrorModal('Por favor completa todos los campos requeridos.')
      return
    }

    try {
      setGuardandoProforma(true)
      setErrorModal(null)

      const payload = {
        cliente_id: Number(clienteId),
        modalidad,
        dias_vigencia: diasVigencia,
        detalles: [
          {
            descripcion_trabajo: descripcionTrabajo.trim(),
            tipo_trabajo_id: Number(tipoTrabajoId),
            tiraje: Number(tiraje),
            paginas_totales: Number(numeroPaginas),
            numero_paginas: Number(numeroPaginas),
            costo_papel: calculos.costoPapel,
            costo_tinta: calculos.costoTinta,
            costo_planchas: calculos.costoPlanchas,
            costo_mano_obra: calculos.costoManoObra,
            subtotal: calculos.total,
          },
        ],
      }

      const res = await proformasApi.crear(payload)
      setProformaEmitida(res)
      setModalNuevaProforma(false)
      cargarProformas()

      // Cargar HTML oficial para el modal de vista previa e impresión
      setCargandoHtml(true)
      setModalPreviewAbierto(true)
      try {
        const html = await proformasApi.obtenerImpresionHtml(res.id_proforma)
        setHtmlDoc(html)
      } catch {
        // En caso de fallo de red al pedir HTML
      } finally {
        setCargandoHtml(false)
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: unknown } } }
        const detail = axiosErr.response?.data?.detail
        if (typeof detail === 'string') {
          setErrorModal(detail)
        } else if (Array.isArray(detail)) {
          const msgs = detail.map((d) => (typeof d === 'object' && d !== null && 'msg' in d ? (d as { msg: string }).msg : String(d)))
          setErrorModal(msgs.join(', ') || 'Error de validación en la proforma.')
        } else {
          setErrorModal('Error al emitir la proforma litográfica.')
        }
      } else {
        setErrorModal('Error al conectar con el servidor.')
      }
    } finally {
      setGuardandoProforma(false)
    }
  }

  async function handleCambiarEstado(id: number, nuevoEstado: EstadoProforma) {
    try {
      await proformasApi.cambiarEstado(id, nuevoEstado)
      cargarProformas()
    } catch {
      setError(`No se pudo cambiar el estado de la proforma a ${nuevoEstado}.`)
    }
  }

  async function handleImprimir(id: number) {
    try {
      const html = await proformasApi.obtenerImpresionHtml(id)
      imprimirDocumentoHtml(html)
    } catch {
      setError('Error al generar el formato imprimible oficial.')
    }
  }

  async function handleCrearOT(event: React.FormEvent) {
    event.preventDefault()
    if (!proformaParaOT) return

    try {
      setCreandoOT(true)
      await ordenesApi.crear({
        proforma_id: proformaParaOT.id_proforma,
        fecha_compromiso: fechaCompromiso || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        prioridad,
        detalle_orden: {
          formato_corte: formatoCorte,
          tipo_encuadernacion: tipoEncuadernacion,
          especificaciones_taller: especificaciones || undefined,
        },
      })
      setProformaParaOT(null)
      navigate('/ordenes')
    } catch {
      setError('No se pudo generar la orden de trabajo para esta proforma.')
    } finally {
      setCreandoOT(false)
    }
  }

  const proformasFiltradas = useMemo(() => {
    return proformas.filter((p) => {
      const q = busqueda.toLowerCase().trim()
      const coincideTexto =
        !q ||
        p.codigo_proforma.toLowerCase().includes(q) ||
        (p.cliente?.razon_social && p.cliente.razon_social.toLowerCase().includes(q)) ||
        (p.detalles?.[0]?.descripcion_trabajo && p.detalles[0].descripcion_trabajo.toLowerCase().includes(q))

      const coincideEstado = filtroEstado === 'TODAS' || p.estado === filtroEstado

      return coincideTexto && coincideEstado
    })
  }, [proformas, busqueda, filtroEstado])

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 }, backgroundColor: UAGRM_COLORS.background.default, minHeight: '100%' }}>
      {/* 1. Encabezado de la Página */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3.5 }}>
        <Box>
          {/* <Typography
            variant="overline"
            sx={{
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: UAGRM_COLORS.cyan.main,
              display: 'block',
              lineHeight: 1.2,
            }}
          >
            Gestión Comercial
          </Typography> */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 780,
              color: UAGRM_COLORS.blue.dark,
              letterSpacing: '-0.02em',
              mb: 0.5,
            }}
          >
            Proformas y Cotizaciones
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.925rem' }}>
            Administra presupuestos emitidos, aprobaciones y emisión de órdenes de trabajo.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshCw size={16} className={cargando ? 'animate-spin' : ''} />}
            onClick={cargarProformas}
            disabled={cargando}
            sx={{
              borderColor: UAGRM_COLORS.border,
              color: UAGRM_COLORS.blue.dark,
              backgroundColor: '#ffffff',
              fontWeight: 700,
              borderRadius: 50,
              px: 2,
              py: 0.9,
              textTransform: 'none',
              '&:hover': { backgroundColor: '#f8fafc', borderColor: '#cbd5e1' },
            }}
          >
            Actualizar
          </Button>

          <Button
            onClick={handleAbrirModalNueva}
            variant="contained"
            startIcon={<Plus size={18} />}
            sx={{
              backgroundColor: '#1e2b4d',
              color: '#ffffff',
              fontWeight: 700,
              borderRadius: 50,
              px: 2.5,
              py: 1.0,
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(30, 43, 77, 0.25)',
              '&:hover': {
                backgroundColor: '#141d34',
              },
            }}
          >
            Nueva Proforma
          </Button>
        </Stack>
      </Box>

      {/* Alerta de Error General */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 2. Búsqueda y Navegación por Pestañas (Idéntico a Insumos y Clientes) */}
      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Buscar por código, cliente o descripción de trabajo..."
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

        {/* Pestañas horizontales idénticas al diseño: activo y hover en negro y negrita */}
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
          {tabsEstado.map((tab) => {
            const isActive = filtroEstado === tab.key;
            return (
              <Box
                key={tab.key}
                component="button"
                onClick={() => setFiltroEstado(tab.key)}
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
            );
          })}
        </Box>
      </Box>

      {/* 3. Tabla Institucional de Proformas (Diseño Arena / Crema) */}
      {cargando ? (
        <Box sx={{ p: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={36} sx={{ color: UAGRM_COLORS.blue.main }} />
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
            Cargando proformas y cotizaciones...
          </Typography>
        </Box>
      ) : proformasFiltradas.length === 0 ? (
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
            backgroundColor: '#ffffff',
            borderRadius: 3,
            border: '1px dashed #e2e8f0',
          }}
        >
          <FileText size={44} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: UAGRM_COLORS.blue.dark, mb: 0.5 }}>
            No se encontraron proformas
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Prueba modificando los términos de búsqueda o el filtro de estado.
          </Typography>
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid #ebe6df',
            backgroundColor: '#ffffff',
            overflow: 'hidden',
          }}
        >
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ backgroundColor: '#f7f4ee' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df' }}>
                  Proforma / Trabajo Litográfico
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df' }}>
                  Estado
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df' }}>
                  Tiraje / Páginas
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df' }}>
                  Modalidad
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df' }}>
                  Vencimiento
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df' }}>
                  Presupuesto
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df', pr: 3 }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {proformasFiltradas.map((p) => {
                const detalle = p.detalles?.[0];

                return (
                  <TableRow
                    key={p.id_proforma}
                    hover
                    sx={{
                      '&:hover': { backgroundColor: '#faf8f5' },
                      '& td': { borderBottom: '1px solid #f0ede6', py: 1.8 },
                      '&:last-child td': { borderBottom: 0 },
                    }}
                  >
                    {/* 1. Proforma / Trabajo (Mayúsculas y Negrita, sin círculo) */}
                    <TableCell>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 800,
                            color: '#1a1a1a',
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
                            color: '#88847e',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            mt: 0.3,
                            display: 'block',
                          }}
                        >
                          {p.codigo_proforma} • {p.cliente?.razon_social || `Cliente #${p.cliente_id}`}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* 2. Estado */}
                    <TableCell>
                      {renderEstadoBadge(p.estado)}
                    </TableCell>

                    {/* 3. Tiraje / Páginas */}
                    <TableCell>
                      <Typography sx={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.88rem' }}>
                        {(detalle?.tiraje || 0).toLocaleString()} ejs.
                      </Typography>
                      <Typography sx={{ color: '#88847e', fontSize: '0.8rem', fontWeight: 500, mt: 0.2 }}>
                        {detalle?.numero_paginas || 0} págs.
                      </Typography>
                    </TableCell>

                    {/* 4. Modalidad */}
                    <TableCell>
                      <Typography sx={{ color: '#334155', fontWeight: 650, fontSize: '0.85rem', textTransform: 'capitalize' }}>
                        {p.modalidad === 'insumos_imprenta' ? 'Insumos Imprenta' : 'Insumos Cliente'}
                      </Typography>
                    </TableCell>

                    {/* 5. Vencimiento */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#475569', fontSize: '0.85rem' }}>
                        <Calendar size={13} color="#88847e" />
                        <span style={{ fontWeight: 600 }}>{formatearFecha(p.fecha_vencimiento)}</span>
                      </Box>
                    </TableCell>

                    {/* 6. Presupuesto */}
                    <TableCell align="right">
                      <Typography sx={{ color: '#800000', fontWeight: 800, fontSize: '0.95rem' }}>
                        {formatearMoneda(p.total_presupuesto)}
                      </Typography>
                    </TableCell>

                    {/* 7. Acciones */}
                    <TableCell align="right" sx={{ pr: 3 }}>
                      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                        <Tooltip title="Imprimir formato oficial UAGRM">
                          <IconButton
                            size="small"
                            onClick={() => handleImprimir(p.id_proforma)}
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 2,
                              border: '1px solid #dcd8d0',
                              backgroundColor: '#ffffff',
                              color: '#55514a',
                              transition: 'all 0.15s ease',
                              '&:hover': {
                                backgroundColor: '#f7f5f0',
                                borderColor: '#c5c0b6',
                                color: '#1a1918',
                              },
                            }}
                          >
                            <Printer size={16} />
                          </IconButton>
                        </Tooltip>

                        {p.estado === 'EMITIDA' && (
                          <>
                            <Tooltip title="Aprobar Proforma">
                              <IconButton
                                size="small"
                                onClick={() => handleCambiarEstado(p.id_proforma, 'APROBADA')}
                                sx={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 2,
                                  border: '1px solid #bbf7d0',
                                  backgroundColor: '#f0fdf4',
                                  color: '#16a34a',
                                  transition: 'all 0.15s ease',
                                  '&:hover': {
                                    backgroundColor: '#dcfce7',
                                    borderColor: '#86efac',
                                  },
                                }}
                              >
                                <CheckCircle size={16} />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Rechazar Proforma">
                              <IconButton
                                size="small"
                                onClick={() => handleCambiarEstado(p.id_proforma, 'RECHAZADA')}
                                sx={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 2,
                                  border: '1px solid #fecaca',
                                  backgroundColor: '#fef2f2',
                                  color: '#dc2626',
                                  transition: 'all 0.15s ease',
                                  '&:hover': {
                                    backgroundColor: '#fee2e2',
                                    borderColor: '#fca5a5',
                                  },
                                }}
                              >
                                <XCircle size={16} />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}

                        {p.estado === 'APROBADA' && (
                          <Tooltip title="Generar Orden de Trabajo (OT)">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setProformaParaOT(p);
                                setFechaCompromiso(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
                              }}
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: 2,
                                border: '1px solid #1e2b4d',
                                backgroundColor: '#1e2b4d',
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
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 1. MODAL DIALOG OFICIAL UAGRM: NUEVA PROFORMA / COTIZACIÓN */}
      <Dialog
        open={modalNuevaProforma}
        onClose={() => !guardandoProforma && setModalNuevaProforma(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3.5,
              p: 1,
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3, position: 'relative', textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e2b4d', fontSize: '1.5rem', mb: 0.5 }}>
            Nueva Proforma Litográfica
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.875rem' }}>
            Cálculo Oficial y Presupuesto Comercial
          </Typography>
          <IconButton onClick={() => setModalNuevaProforma(false)} disabled={guardandoProforma} size="small" sx={{ position: 'absolute', right: 16, top: 16, color: '#94a3b8', '&:hover': { color: '#475569' } }}>
            <X size={18} />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleGuardarProforma}>
          <DialogContent sx={{ px: 2.5, py: 1.5 }}>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2, fontSize: '0.85rem' }}>
              Cálculo técnico paramétrico oficial UAGRM según tiraje de ejemplares, pliegos y costos de taller.
            </Typography>

            {errorModal && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setErrorModal(null)}>
                {errorModal}
              </Alert>
            )}

            {/* Tarjeta de Cálculo Automático Litográfico (AL INICIO) */}
            <Box
              sx={{
                p: 2,
                mb: 2.5,
                borderRadius: 50,
                border: `1px solid ${UAGRM_COLORS.border}`,
                backgroundColor: '#f8fafc',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5, borderBottom: `1px solid ${UAGRM_COLORS.border}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Calculator size={18} color={UAGRM_COLORS.red.main} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: UAGRM_COLORS.blue.dark }}>
                    Cálculo Automático Litográfico
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Chip
                    label={`${calculos.hojas} pliegos`}
                    size="small"
                    sx={{ fontWeight: 700, backgroundColor: '#ffffff', color: '#475569', border: `1px solid ${UAGRM_COLORS.border}` }}
                  />
                  <Typography variant="h5" sx={{ fontWeight: 800, color: UAGRM_COLORS.red.main, fontFamily: 'monospace' }}>
                    {formatearMoneda(calculos.total)}
                  </Typography>
                </Stack>
              </Box>

              <Grid container spacing={1.5} sx={{ pt: 1.5 }}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 700 }}>
                    <Layers size={12} color={UAGRM_COLORS.red.main} /> Papel:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b', fontFamily: 'monospace' }}>
                    {formatearMoneda(calculos.costoPapel)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>
                    Tinta CMYK:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b', fontFamily: 'monospace' }}>
                    {formatearMoneda(calculos.costoTinta)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>
                    Planchas CTP (4):
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b', fontFamily: 'monospace' }}>
                    {formatearMoneda(calculos.costoPlanchas)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>
                    Mano de Obra:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b', fontFamily: 'monospace' }}>
                    {formatearMoneda(calculos.costoManoObra)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {cargandoMaestros ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                <CircularProgress sx={{ color: UAGRM_COLORS.red.main, mb: 1.5 }} size={28} />
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Cargando catálogo de solicitantes y trabajos...
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    select
                    required
                    size="small"
                    label="Cliente o Facultad Solicitante *"
                    value={clienteId}
                    onChange={(e) => setClienteId(Number(e.target.value))}
                  >
                    {clientes.map((c) => (
                      <MenuItem key={c.id_cliente} value={c.id_cliente}>
                        {c.razon_social} ({c.tipo_cliente})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    select
                    required
                    size="small"
                    label="Tipo de Trabajo Litográfico *"
                    value={tipoTrabajoId}
                    onChange={(e) => setTipoTrabajoId(Number(e.target.value))}
                  >
                    {tiposTrabajo.map((t) => (
                      <MenuItem key={t.id_tipo_trabajo} value={t.id_tipo_trabajo}>
                        {t.nombre}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    required
                    size="small"
                    label="Descripción Detallada del Trabajo *"
                    placeholder="Ej. Libro Académico 'Cálculo II' con tapa a color y anillado"
                    value={descripcionTrabajo}
                    onChange={(e) => setDescripcionTrabajo(e.target.value)}
                  />
                </Grid>

                {/* Modalidad de Suministro */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', textTransform: 'uppercase', mb: 1 }}>
                    Modalidad de Suministro de Insumos *
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box
                        onClick={() => setModalidad('insumos_imprenta')}
                        sx={{
                          p: 1.5,
                          borderRadius: 50,
                          border: `2px solid ${modalidad === 'insumos_imprenta' ? UAGRM_COLORS.red.main : UAGRM_COLORS.border}`,
                          backgroundColor: modalidad === 'insumos_imprenta' ? alpha(UAGRM_COLORS.red.main, 0.04) : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': { borderColor: UAGRM_COLORS.red.main },
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: modalidad === 'insumos_imprenta' ? UAGRM_COLORS.red.main : '#1e293b' }}>
                          Insumos de Imprenta
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.3 }}>
                          La Imprenta Universitaria provee el papel institucional.
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box
                        onClick={() => setModalidad('insumos_cliente')}
                        sx={{
                          p: 1.5,
                          borderRadius: 50,
                          border: `2px solid ${modalidad === 'insumos_cliente' ? UAGRM_COLORS.red.main : UAGRM_COLORS.border}`,
                          backgroundColor: modalidad === 'insumos_cliente' ? alpha(UAGRM_COLORS.red.main, 0.04) : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': { borderColor: UAGRM_COLORS.red.main },
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: modalidad === 'insumos_cliente' ? UAGRM_COLORS.red.main : '#1e293b' }}>
                          Insumos del Cliente
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.3 }}>
                          Papel provisto por el cliente (costo papel 0.00 Bs).
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Parámetros: Tiraje, Páginas, Vigencia */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    required
                    size="small"
                    type="number"
                    label="Tiraje (Ejemplares) *"
                    value={tiraje}
                    onChange={(e) => setTiraje(Math.max(1, parseInt(e.target.value) || 0))}
                    slotProps={{ htmlInput: { min: 1 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    required
                    size="small"
                    type="number"
                    label="Número de Páginas *"
                    value={numeroPaginas}
                    onChange={(e) => setNumeroPaginas(Math.max(1, parseInt(e.target.value) || 0))}
                    slotProps={{ htmlInput: { min: 1 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    required
                    size="small"
                    type="number"
                    label="Vigencia (Días) *"
                    value={diasVigencia}
                    onChange={(e) => setDiasVigencia(Math.max(1, parseInt(e.target.value) || 0))}
                    slotProps={{ htmlInput: { min: 1, max: 90 } }}
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2.5, pt: 2, borderTop: `1px solid ${UAGRM_COLORS.border}`, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2.5 }}>
            <Button
              onClick={() => setModalNuevaProforma(false)}
              disabled={guardandoProforma}
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
              disabled={guardandoProforma}
              endIcon={guardandoProforma ? <CircularProgress size={16} color="inherit" /> : <Check size={18} />}
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
                '&.Mui-disabled': {
                  backgroundColor: '#1e2b4d',
                  color: '#ffffff',
                  opacity: 0.65,
                },
              }}
            >
              {guardandoProforma ? 'Confirmando...' : 'Confirmar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

            {/* 2. MODAL DIALOG OFICIAL UAGRM: VISTA PREVIA Y FORMATO IMPRIMIBLE */}
      <Dialog
        open={modalPreviewAbierto}
        onClose={() => setModalPreviewAbierto(false)}
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
            Vista Previa de Proforma Oficial
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.875rem' }}>
            Documento Imprimible Litográfico UAGRM
          </Typography>
          <IconButton onClick={() => setModalPreviewAbierto(false)} size="small" sx={{ position: 'absolute', right: 16, top: 16, color: '#94a3b8', '&:hover': { color: '#475569' } }}>
            <X size={18} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 2.5, py: 1.5 }}>
          {cargandoHtml ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 2 }}>
              <CircularProgress size={32} />
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Generando formato oficial de cotización...
              </Typography>
            </Box>
          ) : htmlDoc ? (
            <Box sx={{ width: '100%', height: '60vh', border: `1px solid ${UAGRM_COLORS.border}`, borderRadius: 2, overflow: 'hidden' }}>
              <iframe
                title="Vista previa de proforma oficial"
                srcDoc={htmlDoc}
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </Box>
          ) : (
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              ¡La proforma fue registrada exitosamente en el sistema con código{' '}
              <strong>{proformaEmitida?.codigo_proforma}</strong> por un total de{' '}
              <strong>{formatearMoneda(proformaEmitida?.total_presupuesto || 0)}</strong>!
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 2, borderTop: `1px solid ${UAGRM_COLORS.border}`, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2.5 }}>
          <Button
            onClick={() => setModalPreviewAbierto(false)}
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

          {htmlDoc && (
            <Button
              variant="outlined"
              startIcon={<ExternalLink size={16} />}
              onClick={() => abrirDocumentoEnPestana(htmlDoc)}
              sx={{
                borderColor: UAGRM_COLORS.border,
                color: UAGRM_COLORS.blue.main,
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: 50,
                px: 2.5,
                py: 1.1,
                fontSize: '0.875rem',
                '&:hover': { backgroundColor: '#f8fafc' },
              }}
            >
              Ver en Pestaña
            </Button>
          )}

          <Button
            variant="contained"
            endIcon={<Check size={18} />}
            onClick={() => {
              if (htmlDoc) {
                imprimirDocumentoHtml(htmlDoc)
              } else if (proformaEmitida) {
                handleImprimir(proformaEmitida.id_proforma)
              }
            }}
            sx={{
              backgroundColor: '#1e2b4d',
              color: '#ffffff',
              fontWeight: 700,
              px: 3.5,
              py: 1.1,
              borderRadius: 50,
              textTransform: 'none',
              fontSize: '0.875rem',
              minWidth: 165,
              boxShadow: '0 2px 8px rgba(30, 43, 77, 0.25)',
              '&:hover': {
                backgroundColor: '#141d34',
              },
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* 3. MODAL DIALOG OFICIAL UAGRM: GENERAR ORDEN DE TRABAJO */}
      <Dialog
        open={Boolean(proformaParaOT)}
        onClose={() => !creandoOT && setProformaParaOT(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3.5,
              p: 1,
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3, position: 'relative', textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e2b4d', fontSize: '1.5rem', mb: 0.5 }}>
            Generar Orden de Trabajo
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.875rem' }}>
            Taller y Producción Litográfica
          </Typography>
          <IconButton onClick={() => setProformaParaOT(null)} disabled={creandoOT} size="small" sx={{ position: 'absolute', right: 16, top: 16, color: '#94a3b8', '&:hover': { color: '#475569' } }}>
            <X size={18} />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleCrearOT}>
          <DialogContent sx={{ px: 2.5, py: 1.5 }}>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2, fontSize: '0.85rem' }}>
              Pase a taller de impresión offset según proforma comercial aprobada.
            </Typography>

            {proformaParaOT && (
              <Box sx={{ p: 2, mb: 2.5, borderRadius: 50, border: `1px solid ${UAGRM_COLORS.border}`, backgroundColor: '#f8fafc' }}>
                <Typography variant="body2" sx={{ fontWeight: 800, color: UAGRM_COLORS.blue.dark }}>
                  Proforma: {proformaParaOT.codigo_proforma}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                  {proformaParaOT.detalles?.[0]?.descripcion_trabajo || 'Sin descripción'}
                </Typography>
              </Box>
            )}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  required
                  size="small"
                  type="date"
                  label="Fecha de Compromiso de Entrega"
                  value={fechaCompromiso}
                  onChange={(e) => setFechaCompromiso(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Prioridad"
                  value={prioridad}
                  onChange={(e) => setPrioridad(e.target.value as PrioridadOrden)}
                >
                  <MenuItem value="NORMAL">Normal</MenuItem>
                  <MenuItem value="URGENTE">Urgente</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Formato de Corte"
                  value={formatoCorte}
                  onChange={(e) => setFormatoCorte(e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tipo de Encuadernación"
                  value={tipoEncuadernacion}
                  onChange={(e) => setTipoEncuadernacion(e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  label="Especificaciones para el Taller"
                  placeholder="Ej. Planchas térmicas 4 colores, secado rápido..."
                  value={especificaciones}
                  onChange={(e) => setEspecificaciones(e.target.value)}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, pt: 2, borderTop: `1px solid ${UAGRM_COLORS.border}`, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2.5 }}>
            <Button
              onClick={() => setProformaParaOT(null)}
              disabled={creandoOT}
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
              disabled={creandoOT}
              endIcon={creandoOT ? <CircularProgress size={16} color="inherit" /> : <Check size={18} />}
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
                '&.Mui-disabled': {
                  backgroundColor: '#1e2b4d',
                  color: '#ffffff',
                  opacity: 0.65,
                },
              }}
            >
              {creandoOT ? 'Confirmando...' : 'Confirmar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}