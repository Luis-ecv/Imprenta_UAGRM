import { useState, useEffect, useCallback, useMemo, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import { alpha } from '@mui/material/styles';
import {
  Layers,
  AlertTriangle,
  TrendingDown,
  Plus,
  Search,
  Edit2,
  PackagePlus,
  X,
  RefreshCw,
  FolderPlus,
  Check,
} from 'lucide-react';

import { insumosApi } from '@/api/insumos.api';
import { UAGRM_COLORS } from '@/theme/uagrmTheme';
import type { InsumoResponse, CategoriaInsumoResponse } from '@/types';
import { formatearMoneda } from '@/utils/formatters';

// Categorías institucionales de la Imprenta UAGRM
const CATEGORIAS_INSUMO = [
  { id: 1, nombre: 'Papeles y Cartulinas' },
  { id: 2, nombre: 'Tintas Offset' },
  { id: 3, nombre: 'Matrices y Planchas' },
  { id: 4, nombre: 'Químicos y Acabados' },
];

export const UNIDADES_MEDIDA = [
  'Pliego',
  'Resma',
  'Kg',
  'Litro',
  'Unidad',
  'Rollo',
  'Caja',
];

export function InsumosPage() {
  const [insumos, setInsumos] = useState<InsumoResponse[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState<string>('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('TODAS');

  // Modal para registrar movimiento de almacén
  const [insumoParaMovimiento, setInsumoParaMovimiento] = useState<InsumoResponse | null>(null);
  const [tipoMovimiento, setTipoMovimiento] = useState<'INGRESO_COMPRA' | 'AJUSTE' | 'MERMA'>('INGRESO_COMPRA');
  const [cantidad, setCantidad] = useState<string>('10');
  const [referencia, setReferencia] = useState<string>('');
  const [guardandoMovimiento, setGuardandoMovimiento] = useState<boolean>(false);

  // Modal para Crear Nueva Categoría
  const [modalCategoriaAbierto, setModalCategoriaAbierto] = useState<boolean>(false);
  const [nombreNuevaCategoria, setNombreNuevaCategoria] = useState<string>('');
  const [unidadBaseNuevaCategoria, setUnidadBaseNuevaCategoria] = useState<string>('Unidad');
  const [guardandoCategoria, setGuardandoCategoria] = useState<boolean>(false);
  const [errorCategoria, setErrorCategoria] = useState<string | null>(null);
  const [categoriasDb, setCategoriasDb] = useState<CategoriaInsumoResponse[]>([]);

  // Modal para Crear / Editar Insumo
  const [modalInsumoAbierto, setModalInsumoAbierto] = useState<boolean>(false);
  const [insumoEditando, setInsumoEditando] = useState<InsumoResponse | null>(null);
  const [codigo, setCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState<number>(1);
  const [unidadMedida, setUnidadMedida] = useState('Pliego');
  const [stockActual, setStockActual] = useState<string>('0');
  const [stockMinimo, setStockMinimo] = useState<string>('10');
  const [costoReposicion, setCostoReposicion] = useState<string>('0.00');
  const [guardandoInsumo, setGuardandoInsumo] = useState<boolean>(false);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);

  const cargarInsumos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const [resInsumos, resCats] = await Promise.all([
        insumosApi.listar({ por_pagina: 150 }),
        insumosApi.listarCategorias().catch(() => []),
      ]);
      setInsumos(resInsumos.datos || []);
      setCategoriasDb(resCats || []);
    } catch {
      setError('Error al cargar el catálogo de insumos.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarInsumos();
  }, [cargarInsumos]);

  // Manejo de creación de nueva categoría
  const handleGuardarCategoria = async (e: FormEvent) => {
    e.preventDefault();
    if (!nombreNuevaCategoria.trim()) {
      setErrorCategoria('El nombre de la categoría es obligatorio.');
      return;
    }

    try {
      setGuardandoCategoria(true);
      setErrorCategoria(null);
      await insumosApi.crearCategoria({
        nombre: nombreNuevaCategoria.trim(),
        unidad_base: unidadBaseNuevaCategoria,
      });
      setMensajeExito(`Categoría "${nombreNuevaCategoria.trim()}" registrada exitosamente.`);
      setModalCategoriaAbierto(false);
      setNombreNuevaCategoria('');
      setUnidadBaseNuevaCategoria('Unidad');
      await cargarInsumos();
      setTimeout(() => setMensajeExito(null), 4000);
    } catch {
      setErrorCategoria('Error al registrar la nueva categoría en el servidor.');
    } finally {
      setGuardandoCategoria(false);
    }
  };

  // Manejo de registro de movimiento de inventario
  async function handleGuardarMovimiento(event: FormEvent) {
    event.preventDefault();
    if (!insumoParaMovimiento) return;

    try {
      setGuardandoMovimiento(true);
      setError(null);
      await insumosApi.registrarMovimiento({
        insumo_id: insumoParaMovimiento.id_insumo,
        tipo_movimiento: tipoMovimiento,
        cantidad: Math.abs(parseFloat(cantidad) || 0),
        referencia: referencia.trim() || undefined,
      });

      setMensajeExito(`Movimiento registrado correctamente para "${insumoParaMovimiento.descripcion}".`);
      setInsumoParaMovimiento(null);
      setCantidad('10');
      setReferencia('');
      await cargarInsumos();

      setTimeout(() => {
        setMensajeExito(null);
      }, 4000);
    } catch {
      setError('Error al registrar el movimiento de inventario.');
    } finally {
      setGuardandoMovimiento(false);
    }
  }

  // Manejo de apertura / cierre del modal de insumos
  function abrirModalCrear() {
    setInsumoEditando(null);
    setCodigo('');
    setDescripcion('');
    setCategoriaId(1);
    setUnidadMedida('Pliego');
    setStockActual('0');
    setStockMinimo('10');
    setCostoReposicion('0.00');
    setErrorFormulario(null);
    setModalInsumoAbierto(true);
  }

  function abrirModalEditar(insumo: InsumoResponse) {
    setInsumoEditando(insumo);
    setCodigo(insumo.codigo);
    setDescripcion(insumo.descripcion);
    setCategoriaId(insumo.categoria_id || 1);
    setUnidadMedida(insumo.unidad_medida || 'Pliego');
    setStockActual(insumo.stock_actual?.toString() || '0');
    setStockMinimo(insumo.stock_minimo?.toString() || '10');
    setCostoReposicion(insumo.costo_reposicion?.toString() || '0.00');
    setErrorFormulario(null);
    setModalInsumoAbierto(true);
  }

  function cerrarModalInsumo() {
    if (guardandoInsumo) return;
    setModalInsumoAbierto(false);
    setInsumoEditando(null);
    setErrorFormulario(null);
  }

  async function handleGuardarInsumo(event: FormEvent) {
    event.preventDefault();
    setErrorFormulario(null);

    const payload = {
      categoria_id: Number(categoriaId),
      codigo: codigo.trim().toUpperCase(),
      descripcion: descripcion.trim(),
      unidad_medida: unidadMedida,
      stock_actual: parseFloat(stockActual) || 0,
      stock_minimo: parseFloat(stockMinimo) || 0,
      costo_reposicion: parseFloat(costoReposicion) || 0,
    };

    try {
      setGuardandoInsumo(true);
      if (insumoEditando) {
        await insumosApi.actualizar(insumoEditando.id_insumo, payload);
        setMensajeExito(`Insumo "${payload.codigo}" actualizado correctamente.`);
      } else {
        await insumosApi.crear(payload);
        setMensajeExito(`Insumo "${payload.codigo}" registrado exitosamente en el catálogo.`);
      }
      setModalInsumoAbierto(false);
      await cargarInsumos();
      setTimeout(() => setMensajeExito(null), 4000);
    } catch {
      setErrorFormulario('Error al guardar el insumo. Verifique que el código no esté duplicado.');
    } finally {
      setGuardandoInsumo(false);
    }
  }

  // Métricas calculadas para tarjetas superiores
  const metricas = useMemo(() => {
    const total = insumos.length;
    let alerta = 0;
    let critico = 0;

    insumos.forEach((i) => {
      const stock = Number(i.stock_actual);
      const min = Number(i.stock_minimo);
      if (stock <= min) {
        critico++;
      } else if (stock <= min * 1.5) {
        alerta++;
      }
    });

    return { total, alerta, critico };
  }, [insumos]);

  // Lista de categorías institucionales ordenadas (combinando BD y fallback)
  const categorias = useMemo(() => {
    const catNombres = ['Papeles y Cartulinas', 'Tintas Offset', 'Matrices y Planchas', 'Químicos y Acabados'];
    categoriasDb.forEach((c) => {
      if (c.nombre && !catNombres.includes(c.nombre)) {
        catNombres.push(c.nombre);
      }
    });
    insumos.forEach((i) => {
      if (i.categoria?.nombre && !catNombres.includes(i.categoria.nombre)) {
        catNombres.push(i.categoria.nombre);
      }
    });
    return catNombres;
  }, [insumos, categoriasDb]);

  // Tabs de filtro por categoría con conteo dinámico
  const tabsCategoria = useMemo(() => {
    const tabs = [
      { key: 'TODAS', label: 'Todos', count: insumos.length },
      ...categorias.map((cat) => ({
        key: cat,
        label: cat,
        count: insumos.filter((i) => (i.categoria?.nombre || '').toLowerCase() === cat.toLowerCase()).length,
      })),
    ];
    return tabs;
  }, [insumos, categorias]);

  // Filtrado reactivo por texto y categoría
  const insumosFiltrados = useMemo(() => {
    return insumos.filter((i) => {
      const q = busqueda.toLowerCase().trim();
      const coincideTexto =
        !q ||
        i.descripcion.toLowerCase().includes(q) ||
        i.codigo.toLowerCase().includes(q) ||
        (i.categoria?.nombre && i.categoria.nombre.toLowerCase().includes(q));

      const coincideCategoria =
        categoriaSeleccionada === 'TODAS' ||
        (i.categoria?.nombre && i.categoria.nombre.toLowerCase() === categoriaSeleccionada.toLowerCase());

      return coincideTexto && coincideCategoria;
    });
  }, [insumos, busqueda, categoriaSeleccionada]);

  // Badge suave de categoría (todos celestes)
  const renderCategoriaBadge = (catNombre?: string) => {
    const nombre = catNombre || 'General';
    return (
      <Box
        sx={{
          display: 'inline-block',
          px: 1.6,
          py: 0.35,
          borderRadius: 50,
          backgroundColor: '#eef8fc',
          color: '#0284c7',
          fontWeight: 700,
          fontSize: '0.78rem',
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        {nombre}
      </Box>
    );
  };

  // Badge suave de estado de stock
  const renderEstadoBadge = (stockActual: number, stockMinimo: number) => {
    if (stockActual <= stockMinimo) {
      return (
        <Box
          sx={{
            display: 'inline-block',
            px: 1.5,
            py: 0.35,
            borderRadius: 50,
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            fontWeight: 700,
            fontSize: '0.75rem',
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          Crítico
        </Box>
      );
    }
    if (stockActual <= stockMinimo * 1.5) {
      return (
        <Box
          sx={{
            display: 'inline-block',
            px: 1.5,
            py: 0.35,
            borderRadius: 50,
            backgroundColor: '#fef3c7',
            color: '#b45309',
            fontWeight: 700,
            fontSize: '0.75rem',
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          Alerta
        </Box>
      );
    }
    return (
      <Box
        sx={{
          display: 'inline-block',
          px: 1.5,
          py: 0.35,
          borderRadius: 50,
          backgroundColor: '#dcfce7',
          color: '#15803d',
          fontWeight: 700,
          fontSize: '0.75rem',
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        Normal
      </Box>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 }, backgroundColor: UAGRM_COLORS.background.default, minHeight: '100%' }}>
      {/* 1. Encabezado de la Página */}
      <Box sx={{ mb: 3.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography
            variant="overline"
            sx={{
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: UAGRM_COLORS.cyan.main,
              display: 'block',
              lineHeight: 1.2,
            }}
          >
            {/* Gestión de Almacén */}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 780,
              color: UAGRM_COLORS.blue.dark,
              letterSpacing: '-0.02em',
              mb: 0.5,
            }}
          >
            Insumos y Materiales
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.925rem' }}>
            Control de stocks, costos de reposición y movimientos de inventario litográfico.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshCw size={16} className={cargando ? 'animate-spin' : ''} />}
            onClick={cargarInsumos}
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
            component={Link}
            to="/insumos/alertas"
            variant="outlined"
            startIcon={<AlertTriangle size={17} />}
            sx={{
              borderColor: UAGRM_COLORS.red.light,
              color: UAGRM_COLORS.red.main,
              backgroundColor: alpha(UAGRM_COLORS.red.main, 0.04),
              fontWeight: 700,
              borderRadius: 50,
              px: 2.2,
              py: 0.9,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: alpha(UAGRM_COLORS.red.main, 0.1),
                borderColor: UAGRM_COLORS.red.main,
              },
            }}
          >
            Stock Crítico ({metricas.critico})
          </Button>

          <Button
            onClick={() => setModalCategoriaAbierto(true)}
            variant="outlined"
            startIcon={<FolderPlus size={16} />}
            sx={{
              borderColor: '#cbd5e1',
              color: '#0f172a',
              backgroundColor: '#ffffff',
              fontWeight: 700,
              borderRadius: 50,
              px: 2.2,
              py: 0.9,
              textTransform: 'none',
              '&:hover': { backgroundColor: '#f8fafc', borderColor: '#94a3b8' },
            }}
          >
            Nueva Categoría
          </Button>

          <Button
            onClick={abrirModalCrear}
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
            Nuevo Insumo
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

      {/* 2. Tarjetas Métricas Superiores (3 KPIs) usando Grid size */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {/* Total Insumos */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${UAGRM_COLORS.border}`,
              backgroundColor: '#ffffff',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.06)',
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mb: 0.5 }}>
                    Total Insumos
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: UAGRM_COLORS.blue.dark }}>
                    {metricas.total}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    Materiales registrados
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    backgroundColor: alpha(UAGRM_COLORS.blue.main, 0.08),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: UAGRM_COLORS.blue.main,
                  }}
                >
                  <Layers size={24} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Stock en Alerta */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${UAGRM_COLORS.border}`,
              backgroundColor: '#ffffff',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.06)',
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mb: 0.5 }}>
                    Próximos a Mínimo
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#b45309' }}>
                    {metricas.alerta}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    Reposición preventiva
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    backgroundColor: alpha('#f59e0b', 0.12),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#b45309',
                  }}
                >
                  <AlertTriangle size={24} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Stock Crítico / Agotado */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${UAGRM_COLORS.border}`,
              backgroundColor: '#ffffff',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.06)',
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mb: 0.5 }}>
                    Stock Crítico
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: UAGRM_COLORS.red.main }}>
                    {metricas.critico}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    Por debajo del límite seguro
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    backgroundColor: alpha(UAGRM_COLORS.red.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: UAGRM_COLORS.red.main,
                  }}
                >
                  <TrendingDown size={24} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 3. Búsqueda y Navegación por Pestañas (Al igual que en Clientes) */}
      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Buscar por código o descripción de material..."
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
          {tabsCategoria.map((tab) => {
            const isActive = categoriaSeleccionada === tab.key;
            return (
              <Box
                key={tab.key}
                component="button"
                onClick={() => setCategoriaSeleccionada(tab.key)}
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

      {/* 4. Tabla Institucional de Insumos (Diseño Arena / Crema) */}
      {cargando ? (
        <Box sx={{ p: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={36} sx={{ color: UAGRM_COLORS.blue.main }} />
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
            Cargando catálogo de materiales...
          </Typography>
        </Box>
      ) : insumosFiltrados.length === 0 ? (
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
            backgroundColor: '#ffffff',
            borderRadius: 3,
            border: '1px dashed #e2e8f0',
          }}
        >
          <Layers size={44} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: UAGRM_COLORS.blue.dark, mb: 0.5 }}>
            No se encontraron insumos
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Prueba modificando los términos de búsqueda o la categoría seleccionada.
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
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ backgroundColor: '#f7f4ee' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df' }}>
                  Material / Insumo
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df' }}>
                  Categoría
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df' }}>
                  Stock Actual
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df' }}>
                  Mínimo
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df' }}>
                  Costo Reposición
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df' }}>
                  Estado
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.8, borderBottom: '1px solid #ebe6df', pr: 3 }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {insumosFiltrados.map((item) => {
                const stockActual = Number(item.stock_actual);
                const stockMinimo = Number(item.stock_minimo);

                return (
                  <TableRow
                    key={item.id_insumo}
                    hover
                    sx={{
                      '&:hover': { backgroundColor: '#faf8f5' },
                      '& td': { borderBottom: '1px solid #f0ede6', py: 1.8 },
                      '&:last-child td': { borderBottom: 0 },
                    }}
                  >
                    {/* 1. Material / Insumo (Mayúsculas y Negrita, sin encapsular en círculo) */}
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
                          {item.descripcion}
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
                          Código: {item.codigo} • Unidad: {item.unidad_medida}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* 2. Categoría */}
                    <TableCell>
                      {renderCategoriaBadge(item.categoria?.nombre)}
                    </TableCell>

                    {/* 3. Stock Actual */}
                    <TableCell align="right">
                      <Typography sx={{ color: '#1a1a1a', fontWeight: 750, fontSize: '0.9rem' }}>
                        {stockActual.toLocaleString()} {item.unidad_medida}
                      </Typography>
                    </TableCell>

                    {/* 4. Mínimo */}
                    <TableCell align="right">
                      <Typography sx={{ color: '#88847e', fontWeight: 600, fontSize: '0.85rem' }}>
                        {stockMinimo.toLocaleString()} {item.unidad_medida}
                      </Typography>
                    </TableCell>

                    {/* 5. Costo Reposición */}
                    <TableCell align="right">
                      <Typography sx={{ color: '#2d2b28', fontWeight: 750, fontSize: '0.88rem' }}>
                        {formatearMoneda(item.costo_reposicion)}
                      </Typography>
                    </TableCell>

                    {/* 6. Estado */}
                    <TableCell align="center">
                      {renderEstadoBadge(stockActual, stockMinimo)}
                    </TableCell>

                    {/* 7. Acciones */}
                    <TableCell align="right" sx={{ pr: 3 }}>
                      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                        <Tooltip title="Registrar movimiento (Ingreso / Ajuste / Merma)">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setInsumoParaMovimiento(item);
                              setTipoMovimiento('INGRESO_COMPRA');
                              setCantidad('10');
                              setReferencia('');
                            }}
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
                            <PackagePlus size={16} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Editar insumo">
                          <IconButton
                            size="small"
                            onClick={() => abrirModalEditar(item)}
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
                            <Edit2 size={16} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 5. Modal Institucional de Movimiento de Almacén (Dialog MUI) */}
      <Dialog
        open={Boolean(insumoParaMovimiento)}
        onClose={() => !guardandoMovimiento && setInsumoParaMovimiento(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 1,
              border: `1px solid ${UAGRM_COLORS.border}`,
            },
          },
        }}
      >
        <form onSubmit={handleGuardarMovimiento}>
          <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3, position: 'relative', textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e2b4d', fontSize: '1.5rem', mb: 0.5 }}>
              Registrar Movimiento de Almacén
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.875rem' }}>
              Inventario Físico
            </Typography>
            <IconButton
              size="small"
              onClick={() => setInsumoParaMovimiento(null)}
              disabled={guardandoMovimiento}
              sx={{ position: 'absolute', right: 16, top: 16, color: '#94a3b8', '&:hover': { color: '#475569' } }}
            >
              <X size={18} />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers sx={{ borderColor: UAGRM_COLORS.border, my: 1 }}>
            {insumoParaMovimiento && (
              <Box sx={{ mb: 3, p: 2, borderRadius: 2, backgroundColor: '#f8fafc', border: `1px solid ${UAGRM_COLORS.border}` }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: UAGRM_COLORS.blue.dark }}>
                  {insumoParaMovimiento.codigo} — {insumoParaMovimiento.descripcion}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Stock actual en kardex:{' '}
                  <strong>
                    {insumoParaMovimiento.stock_actual} {insumoParaMovimiento.unidad_medida}
                  </strong>
                </Typography>
              </Box>
            )}

            <Stack spacing={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel id="tipo-movimiento-label">Tipo de Movimiento</InputLabel>
                <Select
                  labelId="tipo-movimiento-label"
                  value={tipoMovimiento}
                  label="Tipo de Movimiento"
                  onChange={(e) =>
                    setTipoMovimiento(e.target.value as 'INGRESO_COMPRA' | 'AJUSTE' | 'MERMA')
                  }
                >
                  <MenuItem value="INGRESO_COMPRA">Ingreso por Compra / Recepción (+)</MenuItem>
                  <MenuItem value="AJUSTE">Ajuste de Inventario (Conteo físico)</MenuItem>
                  <MenuItem value="MERMA">Merma / Descarte Litográfico (-)</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                size="small"
                label="Cantidad"
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                required
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        {insumoParaMovimiento?.unidad_medida || 'Uds'}
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                fullWidth
                size="small"
                label="Referencia / Nota"
                placeholder="Ej. Factura 451, Acta de merma en guillotina..."
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, pt: 2, borderTop: `1px solid ${UAGRM_COLORS.border}`, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2.5 }}>
            <Button
              onClick={() => setInsumoParaMovimiento(null)}
              disabled={guardandoMovimiento}
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
              disabled={guardandoMovimiento}
              endIcon={guardandoMovimiento ? <CircularProgress size={16} color="inherit" /> : <Check size={18} />}
              sx={{
                backgroundColor: '#1e2b4d',
                color: '#ffffff',
                fontWeight: 700,
                px: 3.5,
                py: 1.1,
                borderRadius: 2.5,
                textTransform: 'none',
                fontSize: '0.875rem',
                minWidth: 165,
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
              {guardandoMovimiento ? 'Confirmando...' : 'Confirmar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* 6. Modal Institucional para Crear / Editar Insumo (Dialog MUI) */}
      <Dialog
        open={modalInsumoAbierto}
        onClose={cerrarModalInsumo}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 1,
              border: `1px solid ${UAGRM_COLORS.border}`,
            },
          },
        }}
      >
        <form onSubmit={handleGuardarInsumo}>
          <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3, position: 'relative', textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e2b4d', fontSize: '1.5rem', mb: 0.5 }}>
              {insumoEditando ? `Editar Insumo: ${insumoEditando.codigo}` : 'Registrar Nuevo Insumo'}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.875rem' }}>
              Catálogo de Materiales Litográficos
            </Typography>
            <IconButton
              size="small"
              onClick={cerrarModalInsumo}
              disabled={guardandoInsumo}
              sx={{ position: 'absolute', right: 16, top: 16, color: '#94a3b8', '&:hover': { color: '#475569' } }}
            >
              <X size={18} />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers sx={{ borderColor: UAGRM_COLORS.border, my: 1 }}>
            {errorFormulario && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setErrorFormulario(null)}>
                {errorFormulario}
              </Alert>
            )}

            <Grid container spacing={2.5} sx={{ mt: 0.2 }}>
              {/* Código */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Código Institucional"
                  placeholder="Ej. PAP-BOND-75"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  required
                  disabled={guardandoInsumo}
                  helperText="Identificador único de almacén"
                />
              </Grid>

              {/* Categoría */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="modal-categoria-label">Categoría Litográfica</InputLabel>
                  <Select
                    labelId="modal-categoria-label"
                    value={categoriaId}
                    label="Categoría Litográfica"
                    disabled={guardandoInsumo}
                    onChange={(e) => setCategoriaId(Number(e.target.value))}
                  >
                    {CATEGORIAS_INSUMO.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Unidad de Medida */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="modal-unidad-label">Unidad de Medida</InputLabel>
                  <Select
                    labelId="modal-unidad-label"
                    value={unidadMedida}
                    label="Unidad de Medida"
                    disabled={guardandoInsumo}
                    onChange={(e) => setUnidadMedida(e.target.value)}
                  >
                    {UNIDADES_MEDIDA.map((u) => (
                      <MenuItem key={u} value={u}>
                        {u}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Descripción */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Descripción del Insumo / Especificaciones Técnicas"
                  placeholder="Ej. Papel Bond 75g Tamaño Oficio 65 x 90 cm blanco"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                  disabled={guardandoInsumo}
                  helperText="Nombre comercial, gramaje, dimensiones o características principales"
                />
              </Grid>

              {/* Stock Actual */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Stock Actual"
                  value={stockActual}
                  onChange={(e) => setStockActual(e.target.value)}
                  required
                  disabled={guardandoInsumo}
                  slotProps={{
                    input: {
                      endAdornment: <InputAdornment position="end">{unidadMedida}</InputAdornment>,
                    },
                  }}
                  helperText="Saldo físico actual en taller"
                />
              </Grid>

              {/* Stock Mínimo */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Stock Mínimo"
                  value={stockMinimo}
                  onChange={(e) => setStockMinimo(e.target.value)}
                  required
                  disabled={guardandoInsumo}
                  slotProps={{
                    input: {
                      endAdornment: <InputAdornment position="end">{unidadMedida}</InputAdornment>,
                    },
                  }}
                  helperText="Umbral para alerta de compra"
                />
              </Grid>

              {/* Costo Reposición */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Costo Reposición"
                  value={costoReposicion}
                  onChange={(e) => setCostoReposicion(e.target.value)}
                  required
                  disabled={guardandoInsumo}
                  slotProps={{
                    htmlInput: { step: '0.01', min: '0' },
                    input: {
                      startAdornment: <InputAdornment position="start">Bs.</InputAdornment>,
                    },
                  }}
                  helperText={`Por cada ${unidadMedida}`}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, pt: 2, borderTop: `1px solid ${UAGRM_COLORS.border}`, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2.5 }}>
            <Button
              onClick={cerrarModalInsumo}
              disabled={guardandoInsumo}
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
              disabled={guardandoInsumo}
              endIcon={guardandoInsumo ? <CircularProgress size={16} color="inherit" /> : <Check size={18} />}
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
                '&.Mui-disabled': {
                  backgroundColor: '#1e2b4d',
                  color: '#ffffff',
                  opacity: 0.65,
                },
              }}
            >
              {guardandoInsumo ? 'Confirmando...' : 'Confirmar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* MODAL OFICIAL UAGRM: NUEVA CATEGORÍA DE INSUMO (POST /insumos/categorias/) */}
      <Dialog
        open={modalCategoriaAbierto}
        onClose={() => !guardandoCategoria && setModalCategoriaAbierto(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 1,
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.12)',
            },
          },
        }}
      >
        <form onSubmit={handleGuardarCategoria}>
          <DialogTitle sx={{ px: 3, pt: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#000000', fontSize: '1.2rem' }}>
                Nueva Categoría de Insumo
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                Clasificación para el catálogo de almacén litográfico
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setModalCategoriaAbierto(false)}
              disabled={guardandoCategoria}
              sx={{ color: '#94a3b8' }}
            >
              <X size={18} />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ px: 3, py: 2 }}>
            {errorCategoria && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {errorCategoria}
              </Alert>
            )}

            <Stack spacing={2.5}>
              <Box>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, display: 'block', mb: 0.8, textTransform: 'uppercase', fontSize: '0.74rem' }}>
                  Nombre de la Categoría *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  required
                  value={nombreNuevaCategoria}
                  onChange={(e) => setNombreNuevaCategoria(e.target.value)}
                  placeholder="Ej. Planchas CTP, Barnices UV, Químicos de Prensa..."
                  slotProps={{
                    input: { sx: { borderRadius: 2.5, fontWeight: 600 } },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, display: 'block', mb: 0.8, textTransform: 'uppercase', fontSize: '0.74rem' }}>
                  Unidad de Medida Base *
                </Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={unidadBaseNuevaCategoria}
                  onChange={(e) => setUnidadBaseNuevaCategoria(e.target.value)}
                  slotProps={{
                    input: { sx: { borderRadius: 2.5, fontWeight: 600 } },
                  }}
                >
                  {UNIDADES_MEDIDA.map((u) => (
                    <MenuItem key={u} value={u}>
                      {u}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
            <Button
              onClick={() => setModalCategoriaAbierto(false)}
              disabled={guardandoCategoria}
              sx={{ borderRadius: 50, color: '#64748b', fontWeight: 700, textTransform: 'none' }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={guardandoCategoria}
              sx={{
                borderRadius: 50,
                backgroundColor: '#1e2b4d',
                color: '#ffffff',
                fontWeight: 700,
                px: 3,
                py: 0.8,
                textTransform: 'none',
                '&:hover': { backgroundColor: '#141d34' },
              }}
            >
              {guardandoCategoria ? 'Guardando...' : 'Guardar Categoría'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
