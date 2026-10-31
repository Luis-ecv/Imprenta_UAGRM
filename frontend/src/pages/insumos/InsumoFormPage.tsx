import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import {
  ArrowLeft,
  Package,
  DollarSign,
  Barcode,
  Check,
} from 'lucide-react';

import { insumosApi } from '@/api/insumos.api';
import { UAGRM_COLORS } from '@/theme/uagrmTheme';

// Categorías institucionales de la Imprenta UAGRM
const CATEGORIAS_INSUMO = [
  { id: 1, nombre: 'Papeles y Cartulinas' },
  { id: 2, nombre: 'Tintas Offset' },
  { id: 3, nombre: 'Matrices y Planchas' },
  { id: 4, nombre: 'Químicos y Acabados' },
];

const UNIDADES_MEDIDA = [
  'Pliego',
  'Resma',
  'Kg',
  'Litro',
  'Unidad',
  'Rollo',
  'Caja',
];

export function InsumoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const esEdicion = Boolean(id);

  // Estados del formulario
  const [codigo, setCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState<number>(1);
  const [unidadMedida, setUnidadMedida] = useState('Pliego');
  const [stockActual, setStockActual] = useState<string>('0');
  const [stockMinimo, setStockMinimo] = useState<string>('10');
  const [costoReposicion, setCostoReposicion] = useState<string>('0.00');

  // Estados de control y feedback
  const [cargandoInicial, setCargandoInicial] = useState<boolean>(esEdicion);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos si estamos en modo edición
  useEffect(() => {
    if (!esEdicion || !id) return;

    async function cargarInsumo() {
      try {
        setCargandoInicial(true);
        setError(null);
        const insumo = await insumosApi.obtener(Number(id));
        setCodigo(insumo.codigo);
        setDescripcion(insumo.descripcion);
        setCategoriaId(insumo.categoria_id || 1);
        setUnidadMedida(insumo.unidad_medida);
        setStockActual(insumo.stock_actual.toString());
        setStockMinimo(insumo.stock_minimo.toString());
        setCostoReposicion(insumo.costo_reposicion.toString());
      } catch {
        setError('No se pudo cargar la información del insumo para edición.');
      } finally {
        setCargandoInicial(false);
      }
    }

    cargarInsumo();
  }, [id, esEdicion]);

  // Manejador del guardado
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const payload = {
      categoria_id: Number(categoriaId),
      codigo: codigo.trim().toUpperCase(),
      descripcion: descripcion.trim(),
      stock_actual: Math.max(0, parseFloat(stockActual) || 0),
      stock_minimo: Math.max(0, parseFloat(stockMinimo) || 0),
      costo_reposicion: Math.max(0, parseFloat(costoReposicion) || 0),
      unidad_medida: unidadMedida,
    };

    if (!payload.codigo || !payload.descripcion) {
      setError('Por favor complete todos los campos obligatorios.');
      return;
    }

    try {
      setGuardando(true);
      if (esEdicion && id) {
        await insumosApi.actualizar(Number(id), payload);
      } else {
        await insumosApi.crear(payload);
      }
      navigate('/insumos');
    } catch {
      setError(
        esEdicion
          ? 'Error al actualizar el insumo. Verifique si el código ya existe.'
          : 'Error al registrar el nuevo insumo. Verifique si el código ya existe.'
      );
    } finally {
      setGuardando(false);
    }
  }

  if (cargandoInicial) {
    return (
      <Box sx={{ p: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={40} sx={{ color: UAGRM_COLORS.blue.main }} />
        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
          Cargando datos del insumo...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 }, backgroundColor: UAGRM_COLORS.background.default, minHeight: '100%' }}>
      {/* Botón de retorno y migas de pan */}
      <Box sx={{ mb: 3 }}>
        <Button
          component={Link}
          to="/insumos"
          startIcon={<ArrowLeft size={16} />}
          sx={{
            color: UAGRM_COLORS.red.main,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.875rem',
            p: 0,
            mb: 1.5,
            '&:hover': { backgroundColor: 'transparent', color: UAGRM_COLORS.red.dark },
          }}
        >
          Volver al Catálogo de Insumos
        </Button>

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
          Gestión de Almacén · Imprenta UAGRM
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 780,
            color: UAGRM_COLORS.blue.dark,
            letterSpacing: '-0.02em',
          }}
        >
          {esEdicion ? 'Editar Insumo de Imprenta' : 'Registrar Nuevo Insumo'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
          {esEdicion
            ? `Actualización de parámetros técnicos y costos para ${codigo || 'el insumo'}.`
            : 'Alta de material o insumo litográfico en el catálogo central de la universidad.'}
        </Typography>
      </Box>

      {/* Alerta de error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Formulario en Tarjeta Principal */}
      <Card
        elevation={0}
        sx={{
          maxWidth: 900,
          borderRadius: 3,
          border: `1px solid ${UAGRM_COLORS.border}`,
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        <form onSubmit={handleSubmit}>
          <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
            {/* Sección 1: Identificación del Material */}
            <Box sx={{ mb: 3.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    backgroundColor: alpha(UAGRM_COLORS.blue.main, 0.08),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: UAGRM_COLORS.blue.main,
                  }}
                >
                  <Barcode size={18} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 780, color: UAGRM_COLORS.blue.dark }}>
                  1. Identificación y Clasificación
                </Typography>
              </Box>

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Código Institucional *"
                    placeholder="Ej. PAP-BOND-75"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    required
                    slotProps={{ htmlInput: { style: { fontFamily: 'monospace', fontWeight: 700 } } }}
                    helperText="Identificador único de almacén"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="categoria-label">Categoría Litográfica *</InputLabel>
                    <Select
                      labelId="categoria-label"
                      value={categoriaId}
                      label="Categoría Litográfica *"
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

                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="unidad-label">Unidad de Medida *</InputLabel>
                    <Select
                      labelId="unidad-label"
                      value={unidadMedida}
                      label="Unidad de Medida *"
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

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Descripción del Insumo / Especificaciones Técnicas *"
                    placeholder="Ej. Papel Bond 75g Tamaño Oficio 65 x 90 cm blanco"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    required
                    helperText="Nombre comercial, gramaje, dimensiones o características principales"
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3, borderColor: UAGRM_COLORS.border }} />

            {/* Sección 2: Control de Stock y Parámetros Operativos */}
            <Box sx={{ mb: 3.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    backgroundColor: alpha(UAGRM_COLORS.red.main, 0.08),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: UAGRM_COLORS.red.main,
                  }}
                >
                  <Package size={18} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 780, color: UAGRM_COLORS.blue.dark }}>
                  2. Parámetros de Inventario y Seguridad
                </Typography>
              </Box>

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Stock Actual en Kardex *"
                    value={stockActual}
                    onChange={(e) => setStockActual(e.target.value)}
                    required
                    slotProps={{
                      input: {
                        endAdornment: <InputAdornment position="end">{unidadMedida}</InputAdornment>,
                      },
                    }}
                    helperText="Saldo físico actual en taller o depósito"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Stock Mínimo de Seguridad *"
                    value={stockMinimo}
                    onChange={(e) => setStockMinimo(e.target.value)}
                    required
                    slotProps={{
                      input: {
                        endAdornment: <InputAdornment position="end">{unidadMedida}</InputAdornment>,
                      },
                    }}
                    helperText="Umbral que dispara alertas para reposición y compras"
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3, borderColor: UAGRM_COLORS.border }} />

            {/* Sección 3: Costos de Reposición */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    backgroundColor: alpha('#15803d', 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#15803d',
                  }}
                >
                  <DollarSign size={18} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 780, color: UAGRM_COLORS.blue.dark }}>
                  3. Costos de Reposición y Cotización
                </Typography>
              </Box>

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Costo Unitario de Reposición (Bs.) *"
                    value={costoReposicion}
                    onChange={(e) => setCostoReposicion(e.target.value)}
                    required
                    slotProps={{
                      htmlInput: { step: '0.01', min: '0' },
                      input: {
                        startAdornment: <InputAdornment position="start">Bs.</InputAdornment>,
                        endAdornment: <InputAdornment position="end">por {unidadMedida}</InputAdornment>,
                      },
                    }}
                    helperText="Costo base utilizado para calcular presupuestos de proformas"
                  />
                </Grid>
              </Grid>
            </Box>
          </CardContent>

          {/* Barra inferior de acciones */}
          <Box
            sx={{
              p: 2.5,
              px: { xs: 2.5, sm: 4 },
              backgroundColor: '#f8fafc',
              borderTop: `1px solid ${UAGRM_COLORS.border}`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2.5,
            }}
          >
            <Button
              component={Link}
              to="/insumos"
              disabled={guardando}
              sx={{
                backgroundColor: '#607285',
                color: '#ffffff',
                fontWeight: 700,
                px: 3.5,
                py: 1.1,
                borderRadius: 50.5,
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
              disabled={guardando}
              endIcon={guardando ? <CircularProgress size={16} color="inherit" /> : <Check size={18} />}
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
              {guardando ? 'Confirmando...' : 'Confirmar'}
            </Button>
          </Box>
        </form>
      </Card>
    </Box>
  );
}
