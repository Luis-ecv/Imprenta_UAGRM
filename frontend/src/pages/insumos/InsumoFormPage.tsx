import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
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
} from 'lucide-react';

import { insumosApi } from '@/api/insumos.api';
import { Button } from '@/components/ui';
import { UAGRM_TOKENS } from '@/theme/tokens';
import { UNIDADES_MEDIDA } from '@/hooks/useInsumos';
import type { CategoriaInsumoResponse } from '@/types';

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

  // Categorías de la base de datos
  const [categorias, setCategorias] = useState<CategoriaInsumoResponse[]>([]);

  // Estados de control y feedback
  const [cargandoInicial, setCargandoInicial] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar categorías y datos si estamos en modo edición
  useEffect(() => {
    async function inicializar() {
      try {
        setCargandoInicial(true);
        setError(null);

        const cats = await insumosApi.listarCategorias().catch(() => [] as CategoriaInsumoResponse[]);
        setCategorias(cats);

        if (esEdicion && id) {
          const insumo = await insumosApi.obtener(Number(id));
          setCodigo(insumo.codigo);
          setDescripcion(insumo.descripcion);
          setCategoriaId(insumo.categoria_id || (cats[0]?.id_categoria ?? 1));
          setUnidadMedida(insumo.unidad_medida || 'Pliego');
          setStockActual(insumo.stock_actual?.toString() || '0');
          setStockMinimo(insumo.stock_minimo?.toString() || '10');
          setCostoReposicion(insumo.costo_reposicion?.toString() || '0.00');
        } else if (cats.length > 0) {
          setCategoriaId(cats[0].id_categoria);
        }
      } catch {
        setError('No se pudo inicializar los datos del formulario de insumos.');
      } finally {
        setCargandoInicial(false);
      }
    }

    inicializar();
  }, [id, esEdicion]);

  // Manejador del guardado
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!codigo.trim() || !descripcion.trim()) {
      setError('Por favor complete todos los campos obligatorios.');
      return;
    }

    try {
      setGuardando(true);
      if (esEdicion && id) {
        // En edición no enviamos stock_actual para respetar Kardex
        await insumosApi.actualizar(Number(id), {
          categoria_id: Number(categoriaId),
          codigo: codigo.trim().toUpperCase(),
          descripcion: descripcion.trim(),
          unidad_medida: unidadMedida,
          stock_minimo: Math.max(0, parseFloat(stockMinimo) || 0),
          costo_reposicion: Math.max(0, parseFloat(costoReposicion) || 0),
        });
      } else {
        await insumosApi.crear({
          categoria_id: Number(categoriaId),
          codigo: codigo.trim().toUpperCase(),
          descripcion: descripcion.trim(),
          unidad_medida: unidadMedida,
          stock_actual: Math.max(0, parseFloat(stockActual) || 0),
          stock_minimo: Math.max(0, parseFloat(stockMinimo) || 0),
          costo_reposicion: Math.max(0, parseFloat(costoReposicion) || 0),
        });
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
        <CircularProgress size={40} sx={{ color: UAGRM_TOKENS.colors.royalBlue }} />
        <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, fontWeight: 600 }}>
          Cargando datos del insumo...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 }, backgroundColor: UAGRM_TOKENS.background.default, minHeight: '100%' }}>
      {/* Botón de retorno y encabezado */}
      <Box sx={{ mb: 3 }}>
        <Button
          component={Link}
          to="/insumos"
          variant="ghost"
          icon={<ArrowLeft size={16} />}
          style={{
            color: UAGRM_TOKENS.colors.ruby,
            padding: 0,
            marginBottom: 12,
          }}
        >
          Volver al Catálogo de Insumos
        </Button>

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
          Gestión de Almacén · Imprenta UAGRM
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 780,
            color: UAGRM_TOKENS.colors.primaryDark,
            letterSpacing: '-0.02em',
          }}
        >
          {esEdicion ? 'Editar Insumo de Imprenta' : 'Registrar Nuevo Insumo'}
        </Typography>
        <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, mt: 0.5 }}>
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
          border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
          backgroundColor: UAGRM_TOKENS.colors.background.paper,
          boxShadow: UAGRM_TOKENS.shadows.card,
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
                    backgroundColor: alpha(UAGRM_TOKENS.colors.royalBlue, 0.08),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: UAGRM_TOKENS.colors.royalBlue,
                  }}
                >
                  <Barcode size={18} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 780, color: UAGRM_TOKENS.colors.primaryDark }}>
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
                    disabled={guardando}
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
                      disabled={guardando}
                      onChange={(e) => setCategoriaId(Number(e.target.value))}
                    >
                      {categorias.map((cat) => (
                        <MenuItem key={cat.id_categoria} value={cat.id_categoria}>
                          {cat.nombre}
                        </MenuItem>
                      ))}
                      {categorias.length === 0 && (
                        <MenuItem value={1}>General</MenuItem>
                      )}
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
                      disabled={guardando}
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
                    disabled={guardando}
                    helperText="Nombre comercial, gramaje, dimensiones o características principales"
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3, borderColor: UAGRM_TOKENS.border.subtle }} />

            {/* Sección 2: Control de Stock y Parámetros Operativos */}
            <Box sx={{ mb: 3.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    backgroundColor: alpha(UAGRM_TOKENS.colors.ruby, 0.08),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: UAGRM_TOKENS.colors.ruby,
                  }}
                >
                  <Package size={18} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 780, color: UAGRM_TOKENS.colors.primaryDark }}>
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
                    disabled={guardando || esEdicion}
                    slotProps={{
                      input: {
                        endAdornment: <InputAdornment position="end">{unidadMedida}</InputAdornment>,
                      },
                    }}
                    helperText={
                      esEdicion
                        ? 'Inalterable directamente. Use "Registrar Movimiento" para Kardex'
                        : 'Saldo físico inicial en taller o depósito'
                    }
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
                    disabled={guardando}
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

            <Divider sx={{ my: 3, borderColor: UAGRM_TOKENS.border.subtle }} />

            {/* Sección 3: Costos de Reposición */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    backgroundColor: alpha(UAGRM_TOKENS.colors.emerald, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: UAGRM_TOKENS.colors.emerald,
                  }}
                >
                  <DollarSign size={18} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 780, color: UAGRM_TOKENS.colors.primaryDark }}>
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
                    disabled={guardando}
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
              backgroundColor: UAGRM_TOKENS.colors.background.subtle,
              borderTop: `1px solid ${UAGRM_TOKENS.border.subtle}`,
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
              variant="outline"
              style={{ minWidth: 125 }}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="default"
              isLoading={guardando}
              style={{ minWidth: 165 }}
            >
              {esEdicion ? 'Actualizar Insumo' : 'Registrar Insumo'}
            </Button>
          </Box>
        </form>
      </Card>
    </Box>
  );
}
