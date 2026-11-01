import { useState, useEffect, type FormEvent } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { X } from 'lucide-react';

import { Button } from '@/components/ui';
import { UAGRM_TOKENS } from '@/theme/tokens';
import { UNIDADES_MEDIDA } from '@/hooks/useInsumos';
import type { InsumoResponse, InsumoCreate, InsumoUpdate, CategoriaInsumoResponse } from '@/types';

interface InsumoModalProps {
  open: boolean;
  insumoEditando: InsumoResponse | null;
  categorias: CategoriaInsumoResponse[];
  guardando: boolean;
  onClose: () => void;
  onSubmit: (payload: InsumoCreate | InsumoUpdate, id?: number) => Promise<boolean>;
}

export function InsumoModal({
  open,
  insumoEditando,
  categorias,
  guardando,
  onClose,
  onSubmit,
}: InsumoModalProps) {
  const [codigo, setCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState<number>(1);
  const [unidadMedida, setUnidadMedida] = useState('Pliego');
  const [stockActual, setStockActual] = useState('0');
  const [stockMinimo, setStockMinimo] = useState('10');
  const [costoReposicion, setCostoReposicion] = useState('0.00');
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  useEffect(() => {
    if (insumoEditando) {
      setCodigo(insumoEditando.codigo);
      setDescripcion(insumoEditando.descripcion);
      setCategoriaId(insumoEditando.categoria_id || (categorias[0]?.id_categoria ?? 1));
      setUnidadMedida(insumoEditando.unidad_medida || 'Pliego');
      setStockActual(insumoEditando.stock_actual?.toString() || '0');
      setStockMinimo(insumoEditando.stock_minimo?.toString() || '10');
      setCostoReposicion(insumoEditando.costo_reposicion?.toString() || '0.00');
    } else {
      setCodigo('');
      setDescripcion('');
      setCategoriaId(categorias[0]?.id_categoria ?? 1);
      setUnidadMedida('Pliego');
      setStockActual('0');
      setStockMinimo('10');
      setCostoReposicion('0.00');
    }
    setErrorLocal(null);
  }, [insumoEditando, open, categorias]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!codigo.trim() || !descripcion.trim()) {
      setErrorLocal('El código y la descripción son obligatorios.');
      return;
    }

    const payload = {
      categoria_id: Number(categoriaId),
      codigo: codigo.trim().toUpperCase(),
      descripcion: descripcion.trim(),
      unidad_medida: unidadMedida,
      stock_actual: Math.max(0, parseFloat(stockActual) || 0),
      stock_minimo: Math.max(0, parseFloat(stockMinimo) || 0),
      costo_reposicion: Math.max(0, parseFloat(costoReposicion) || 0),
    };

    setErrorLocal(null);
    const ok = await onSubmit(payload, insumoEditando?.id_insumo);
    if (ok) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => !guardando && onClose()}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 1,
            border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
          },
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3, position: 'relative', textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primaryDark, fontSize: '1.4rem', mb: 0.5 }}>
            {insumoEditando ? 'Editar Insumo de Imprenta' : 'Nuevo Insumo de Imprenta'}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: UAGRM_TOKENS.colors.slate, fontSize: '0.875rem' }}>
            {insumoEditando ? 'Actualizar especificaciones y umbrales' : 'Registro de nuevo material en catálogo'}
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
            disabled={guardando}
            sx={{ position: 'absolute', right: 16, top: 16, color: UAGRM_TOKENS.colors.mutedSlate }}
          >
            <X size={18} />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: UAGRM_TOKENS.border.subtle, my: 1 }}>
          {errorLocal && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setErrorLocal(null)}>
              {errorLocal}
            </Alert>
          )}

          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            {/* Código */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Código del Insumo"
                placeholder="Ej. PAP-BOND-75"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                required
                disabled={guardando}
                helperText="Identificador único de catálogo"
              />
            </Grid>

            {/* Categoría */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="modal-cat-label">Categoría *</InputLabel>
                <Select
                  labelId="modal-cat-label"
                  value={categoriaId}
                  label="Categoría *"
                  onChange={(e) => setCategoriaId(Number(e.target.value))}
                  disabled={guardando}
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

            {/* Unidad de Medida */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="modal-unidad-label">Unidad de Medida</InputLabel>
                <Select
                  labelId="modal-unidad-label"
                  value={unidadMedida}
                  label="Unidad de Medida"
                  onChange={(e) => setUnidadMedida(e.target.value)}
                  disabled={guardando}
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
                disabled={guardando}
                helperText="Nombre comercial, gramaje, dimensiones o características litográficas"
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
                disabled={guardando || Boolean(insumoEditando)}
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end">{unidadMedida}</InputAdornment>,
                  },
                }}
                helperText={
                  insumoEditando
                    ? 'Inalterable aquí. Use "Registrar Movimiento" para Kardex'
                    : 'Saldo inicial en almacén'
                }
              />
            </Grid>

            {/* Stock Mínimo */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Stock Mínimo de Seguridad"
                value={stockMinimo}
                onChange={(e) => setStockMinimo(e.target.value)}
                required
                disabled={guardando}
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end">{unidadMedida}</InputAdornment>,
                  },
                }}
                helperText="Umbral que dispara alertas de reposición"
              />
            </Grid>

            {/* Costo Reposición */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Costo de Reposición"
                value={costoReposicion}
                onChange={(e) => setCostoReposicion(e.target.value)}
                required
                disabled={guardando}
                slotProps={{
                  htmlInput: { step: '0.01', min: '0' },
                  input: {
                    startAdornment: <InputAdornment position="start">Bs.</InputAdornment>,
                  },
                }}
                helperText={`Costo de adquisición por ${unidadMedida}`}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 2, borderTop: `1px solid ${UAGRM_TOKENS.border.subtle}`, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            type="button"
            variant="outline"
            disabled={guardando}
            onClick={onClose}
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
            {insumoEditando ? 'Actualizar' : 'Registrar Insumo'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
