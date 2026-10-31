import { Link } from 'react-router-dom'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
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
import InputAdornment from '@mui/material/InputAdornment'
import { alpha } from '@mui/material/styles'
import {
  ShoppingCart,
  Plus,
  Search,
  X,
  Sparkles,
  Check,
  RefreshCw,
  Eye,
} from 'lucide-react'
import { comprasApi } from '@/api/compras.api'
import { UAGRM_COLORS } from '@/theme/uagrmTheme'
import type { OrdenCompraResponse, ProveedorResponse } from '@/types'
import { formatearMoneda, formatearFecha } from '@/utils/formatters'

export function ComprasPage() {
  const [compras, setCompras] = useState<OrdenCompraResponse[]>([])
  const [cargando, setCargando] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState<string>('')
  const [filtroEstado, setFiltroEstado] = useState<string>('TODAS')

  // Estado del Modal Popup de Nueva Orden de Compra (Diseño Oficial MUI Dialog)
  const [modalNuevaCompra, setModalNuevaCompra] = useState<boolean>(false)
  const [proveedores, setProveedores] = useState<ProveedorResponse[]>([])
  const [proveedorId, setProveedorId] = useState<number | ''>('')
  const [totalEstimado, setTotalEstimado] = useState<string>('1500')
  const [estado, setEstado] = useState<string>('SUGERIDA')
  const [cargandoProveedores, setCargandoProveedores] = useState<boolean>(false)
  const [guardandoCompra, setGuardandoCompra] = useState<boolean>(false)
  const [errorModal, setErrorModal] = useState<string | null>(null)

  const cargarCompras = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      const res = await comprasApi.listar({ por_pagina: 100 })
      setCompras(res.datos || [])
    } catch {
      setError('Error al sincronizar órdenes de compra con el servidor.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarCompras()
  }, [cargarCompras])

  // Abrir Popup y cargar proveedores autorizados
  const handleAbrirModal = async () => {
    setErrorModal(null)
    setModalNuevaCompra(true)
    if (proveedores.length === 0) {
      try {
        setCargandoProveedores(true)
        const data = await comprasApi.listarProveedores()
        setProveedores(data || [])
        if (data?.length > 0 && !proveedorId) {
          setProveedorId(data[0].id_proveedor)
        }
      } catch {
        setErrorModal('Error al cargar la lista de proveedores autorizados.')
      } finally {
        setCargandoProveedores(false)
      }
    }
  }

  // Guardar nueva orden de compra desde el popup
  async function handleGuardarCompra(event: React.FormEvent) {
    event.preventDefault()
    if (!proveedorId) {
      setErrorModal('Por favor selecciona un proveedor autorizado.')
      return
    }

    const monto = parseFloat(totalEstimado)
    if (isNaN(monto) || monto <= 0) {
      setErrorModal('El monto estimado debe ser mayor a 0.00 Bs.')
      return
    }

    try {
      setGuardandoCompra(true)
      setErrorModal(null)

      await comprasApi.crear({
        proveedor_id: Number(proveedorId),
        total_estimado: monto,
        estado,
      })

      setModalNuevaCompra(false)
      setTotalEstimado('1500')
      cargarCompras()
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: unknown } } }
        const detail = axiosErr.response?.data?.detail
        if (typeof detail === 'string') {
          setErrorModal(detail)
        } else if (Array.isArray(detail)) {
          const msgs = detail.map((d) => (typeof d === 'object' && d !== null && 'msg' in d ? (d as { msg: string }).msg : String(d)))
          setErrorModal(msgs.join(', ') || 'Error de validación al emitir la orden.')
        } else {
          setErrorModal('Error al emitir la orden de compra.')
        }
      } else {
        setErrorModal('Error al conectar con el servidor.')
      }
    } finally {
      setGuardandoCompra(false)
    }
  }

  // Proveedor seleccionado actualmente en el modal
  const proveedorSeleccionado = useMemo(() => {
    return proveedores.find((p) => p.id_proveedor === Number(proveedorId))
  }, [proveedores, proveedorId])

  // Pestañas de estado con conteos dinámicos
  const tabsEstado = useMemo(() => {
    const conteo = {
      TODAS: compras.length,
      SUGERIDA: compras.filter((c) => c.estado === 'SUGERIDA').length,
      ENVIADA: compras.filter((c) => c.estado === 'ENVIADA').length,
      APROBADA: compras.filter((c) => c.estado === 'APROBADA').length,
      CANCELADA: compras.filter((c) => c.estado === 'CANCELADA').length,
    }

    const tabs = [
      { key: 'TODAS', label: 'Todas', count: conteo.TODAS },
      { key: 'SUGERIDA', label: 'Sugerida', count: conteo.SUGERIDA },
      { key: 'ENVIADA', label: 'Enviada', count: conteo.ENVIADA },
      { key: 'APROBADA', label: 'Aprobada', count: conteo.APROBADA },
    ]

    if (conteo.CANCELADA > 0) {
      tabs.push({ key: 'CANCELADA', label: 'Cancelada', count: conteo.CANCELADA })
    }

    return tabs
  }, [compras])

  // Filtrado reactivo de compras
  const comprasFiltradas = useMemo(() => {
    return compras.filter((c) => {
      const coincideEstado = filtroEstado === 'TODAS' || c.estado === filtroEstado
      const termino = busqueda.toLowerCase().trim()
      const coincideTexto =
        !termino ||
        c.id_orden_compra.toString().includes(termino) ||
        c.proveedor?.razon_social?.toLowerCase().includes(termino) ||
        (c.prediccion_id && c.prediccion_id.toString().includes(termino))
      return coincideEstado && coincideTexto
    })
  }, [compras, busqueda, filtroEstado])

  // Renderizador de badge de estado con bordes pill suaves
  const renderEstadoBadge = (st: string) => {
    let bg = '#fffbeb'
    let color = '#b45309'
    let border = '#fde68a'

    if (st === 'APROBADA') {
      bg = '#ecfdf5'
      color = '#047857'
      border = '#a7f3d0'
    } else if (st === 'ENVIADA') {
      bg = '#eff6ff'
      color = '#1d4ed8'
      border = '#bfdbfe'
    } else if (st === 'CANCELADA') {
      bg = '#fff1f2'
      color = '#be123c'
      border = '#fecdd3'
    }

    return (
      <Box
        component="span"
        sx={{
          display: 'inline-block',
          backgroundColor: bg,
          color: color,
          border: `1px solid ${border}`,
          borderRadius: 50,
          px: 1.5,
          py: 0.35,
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.03em',
        }}
      >
        {st}
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
      {/* 1. Encabezado Oficial UAGRM con Botón Pill */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 3 }}>
        <Box>
          {/* <Typography variant="overline" sx={{ color: '#0284c7', fontWeight: 800, letterSpacing: '0.12em', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
            GESTIÓN DE ABASTECIMIENTO
          </Typography> */}
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e2b4d', letterSpacing: '-0.02em', mb: 0.5 }}>
            Órdenes de Compra
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
            Adquisición de insumos litográficos y reposición a proveedores autorizados.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            onClick={cargarCompras}
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
            onClick={handleAbrirModal}
            startIcon={<Plus size={18} />}
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
            Nueva Orden de Compra
          </Button>
        </Stack>
      </Box>

      {/* Alerta de Error General */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 2. Búsqueda y Navegación por Pestañas (Idéntico a Insumos, Clientes y Proformas) */}
      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Buscar por ID, proveedor o inferencia ML..."
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

      {/* 3. Tabla Institucional de Órdenes de Compra (Diseño Arena / Crema) */}
      {cargando ? (
        <Box sx={{ p: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={36} sx={{ color: UAGRM_COLORS.blue.main }} />
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
            Cargando órdenes de compra litográficas...
          </Typography>
        </Box>
      ) : comprasFiltradas.length === 0 ? (
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
            backgroundColor: '#ffffff',
            borderRadius: 3,
            border: '1px dashed #e2e8f0',
          }}
        >
          <ShoppingCart size={44} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: UAGRM_COLORS.blue.dark, mb: 0.5 }}>
            No se encontraron órdenes de compra
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
          <Table sx={{ minWidth: 750 }}>
            <TableHead sx={{ backgroundColor: '#f7f4ee' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df' }}>
                  Proveedor / Detalle de Compra
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df' }}>
                  Estado
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df' }}>
                  Fecha de Emisión
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df' }}>
                  Origen / Inferencia
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df' }}>
                  Monto Estimado
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df', pr: 3 }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comprasFiltradas.map((c) => (
                <TableRow
                  key={c.id_orden_compra}
                  hover
                  sx={{
                    '&:hover': { backgroundColor: '#faf8f5' },
                    '& td': { borderBottom: '1px solid #f0ede6', py: 1.8 },
                    '&:last-child td': { borderBottom: 0 },
                  }}
                >
                  {/* 1. Proveedor / Orden (Mayúsculas y Negrita, clicable hacia detalle) */}
                  <TableCell>
                    <Box
                      component={Link}
                      to={`/compras/${c.id_orden_compra}`}
                      sx={{ textDecoration: 'none', display: 'block', '&:hover .nombre-prov': { textDecoration: 'underline' } }}
                    >
                      <Typography
                        className="nombre-prov"
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
                        {c.proveedor?.razon_social || `Proveedor #${c.proveedor_id}`}
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
                        ORDEN #{c.id_orden_compra} {c.proveedor?.nit ? `• NIT: ${c.proveedor.nit}` : ''}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* 2. Estado */}
                  <TableCell>
                    {renderEstadoBadge(c.estado)}
                  </TableCell>

                  {/* 3. Fecha de Emisión */}
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>
                      {formatearFecha(c.fecha_generacion)}
                    </Typography>
                  </TableCell>

                  {/* 4. Origen / Inferencia ML */}
                  <TableCell>
                    {c.prediccion_id ? (
                      <Box
                        component="span"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.6,
                          backgroundColor: '#eef8fc',
                          color: '#0284c7',
                          border: '1px solid #bae6fd',
                          borderRadius: 50,
                          px: 1.2,
                          py: 0.3,
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      >
                        <Sparkles size={12} /> ML #{c.prediccion_id}
                      </Box>
                    ) : (
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                        Manual / Preventiva
                      </Typography>
                    )}
                  </TableCell>

                  {/* 5. Monto Estimado */}
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 800,
                        color: '#1a1a1a',
                        
                        fontSize: '0.95rem',
                      }}
                    >
                      {formatearMoneda(c.total_estimado)}
                    </Typography>
                  </TableCell>

                  {/* 6. Acciones con botón claro Ver Detalle */}
                  <TableCell align="right" sx={{ pr: 3 }}>
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      <Button
                        component={Link}
                        to={`/compras/${c.id_orden_compra}`}
                        variant="outlined"
                        size="small"
                        startIcon={<Eye size={14} />}
                        sx={{
                          borderRadius: 50,
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          color: '#0f172a',
                          borderColor: '#cbd5e1',
                          backgroundColor: '#ffffff',
                          px: 1.8,
                          py: 0.45,
                          '&:hover': {
                            backgroundColor: '#f1f5f9',
                            borderColor: '#94a3b8',
                          },
                        }}
                      >
                        Ver Detalle
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* MODAL POPUP DIALOG OFICIAL UAGRM: NUEVA ORDEN DE COMPRA */}
      <Dialog
        open={modalNuevaCompra}
        onClose={() => !guardandoCompra && setModalNuevaCompra(false)}
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
            Nueva Orden de Compra
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.875rem' }}>
            Gestión de Abastecimiento Litográfico
          </Typography>
          <IconButton onClick={() => setModalNuevaCompra(false)} disabled={guardandoCompra} size="small" sx={{ position: 'absolute', right: 16, top: 16, color: '#94a3b8', '&:hover': { color: '#475569' } }}>
            <X size={18} />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleGuardarCompra}>
          <DialogContent sx={{ px: 2.5, py: 1.5 }}>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2.5, fontSize: '0.85rem' }}>
              Complete la información de adquisición de insumos litográficos para reponer inventario en almacén.
            </Typography>

            {errorModal && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setErrorModal(null)}>
                {errorModal}
              </Alert>
            )}

            {/* Tarjeta de Resumen en Tiempo Real */}
            <Box
              sx={{
                p: 2,
                mb: 2.5,
                borderRadius: 2.5,
                border: `1px solid ${UAGRM_COLORS.border}`,
                backgroundColor: '#f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Total Estimado de la Orden
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e2b4d', fontFamily: 'monospace' }}>
                  {formatearMoneda(parseFloat(totalEstimado) || 0)}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Chip
                  label={estado}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    backgroundColor: alpha(UAGRM_COLORS.blue.main, 0.1),
                    color: UAGRM_COLORS.blue.dark,
                    mb: 0.5,
                  }}
                />
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {proveedorSeleccionado?.razon_social || 'Seleccione proveedor'}
                </Typography>
              </Box>
            </Box>

            {cargandoProveedores ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                <CircularProgress sx={{ color: UAGRM_COLORS.red.main, mb: 1.5 }} size={28} />
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Cargando catálogo de proveedores...
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    select
                    required
                    size="small"
                    label="Proveedor Autorizado *"
                    value={proveedorId}
                    onChange={(e) => setProveedorId(Number(e.target.value))}
                  >
                    {proveedores.map((p) => (
                      <MenuItem key={p.id_proveedor} value={p.id_proveedor}>
                        {p.razon_social} (NIT: {p.nit})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    required
                    size="small"
                    type="number"
                    label="Monto Estimado (Bs.)"
                    value={totalEstimado}
                    onChange={(e) => setTotalEstimado(e.target.value)}
                    slotProps={{ htmlInput: { min: 0.01, step: '0.01' } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    select
                    size="small"
                    label="Estado Inicial"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                  >
                    <MenuItem value="SUGERIDA">Sugerida por ML / Preventiva</MenuItem>
                    <MenuItem value="ENVIADA">Enviada al Proveedor</MenuItem>
                    <MenuItem value="APROBADA">Aprobada por Administración</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2.5, pt: 2, borderTop: `1px solid ${UAGRM_COLORS.border}`, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2.5 }}>
            <Button
              onClick={() => setModalNuevaCompra(false)}
              disabled={guardandoCompra}
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
              disabled={guardandoCompra}
              endIcon={guardandoCompra ? <CircularProgress size={16} color="inherit" /> : <Check size={18} />}
              sx={{
                backgroundColor: '#1e2b4d',
                color: '#ffffff',
                fontWeight: 700,
                px: 3.5,
                py: 1.1,
                borderRadius: 50,
                textTransform: 'none',
                fontSize: '0.875rem',
                minWidth: 175,
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
              {guardandoCompra ? 'Confirmando...' : 'Confirmar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
