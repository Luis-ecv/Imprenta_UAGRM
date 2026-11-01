import { useState, useEffect, type FormEvent } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { X } from 'lucide-react';

import { Button } from '@/components/ui';
import { UAGRM_TOKENS } from '@/theme/tokens';
import type { InsumoResponse, MovimientoInventarioCreate } from '@/types';

interface MovimientoModalProps {
  insumo: InsumoResponse | null;
  guardando: boolean;
  onClose: () => void;
  onSubmit: (payload: MovimientoInventarioCreate) => Promise<boolean>;
}

export function MovimientoModal({
  insumo,
  guardando,
  onClose,
  onSubmit,
}: MovimientoModalProps) {
  const [tipoMovimiento, setTipoMovimiento] = useState<'INGRESO_COMPRA' | 'AJUSTE' | 'MERMA'>('INGRESO_COMPRA');
  const [cantidad, setCantidad] = useState<string>('10');
  const [referencia, setReferencia] = useState<string>('');

  useEffect(() => {
    if (insumo) {
      setTipoMovimiento('INGRESO_COMPRA');
      setCantidad('10');
      setReferencia('');
    }
  }, [insumo]);

  if (!insumo) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cantNum = Math.abs(parseFloat(cantidad) || 0);
    if (cantNum <= 0) return;

    const ok = await onSubmit({
      insumo_id: insumo.id_insumo,
      tipo_movimiento: tipoMovimiento,
      cantidad: cantNum,
      referencia: referencia.trim() || undefined,
    });

    if (ok) {
      onClose();
    }
  };

  return (
    <Dialog
      open={Boolean(insumo)}
      onClose={() => !guardando && onClose()}
      maxWidth="sm"
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
            Registrar Movimiento de Almacén
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: UAGRM_TOKENS.colors.slate, fontSize: '0.875rem' }}>
            Inventario Físico & Trazabilidad Kardex
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
          <Box sx={{ mb: 3, p: 2, borderRadius: 2, backgroundColor: '#f8fafc', border: `1px solid ${UAGRM_TOKENS.border.subtle}` }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: UAGRM_TOKENS.colors.primaryDark }}>
              {insumo.codigo} — {insumo.descripcion}
            </Typography>
            <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.slate, display: 'block', mt: 0.5 }}>
              Stock actual registrado en Kardex:{' '}
              <strong style={{ color: UAGRM_TOKENS.colors.primaryDark }}>
                {insumo.stock_actual} {insumo.unidad_medida}
              </strong>
            </Typography>
          </Box>

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
              label="Cantidad a Registrar"
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      {insumo.unidad_medida || 'Uds'}
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              fullWidth
              size="small"
              label="Referencia o Motivo"
              placeholder="Ej. Factura 451, Ajuste de fin de mes, Descarte en guillotina..."
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              helperText="Quedará registrado permanentemente en el historial de movimientos"
            />
          </Stack>
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
            Confirmar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
