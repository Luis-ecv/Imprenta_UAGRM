import { useState, useEffect, type FormEvent } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';

import { Modal, Button } from '@/components/ui';
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
    <Modal
      isOpen={Boolean(insumo)}
      onClose={onClose}
      title="Registrar Movimiento de Almacén"
      subtitle="Inventario Físico & Trazabilidad Kardex"
      maxWidth="sm"
      onSubmit={handleSubmit}
      isLoading={guardando}
      actions={
        <>
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
        </>
      }
    >
      <Box
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 2,
          backgroundColor: UAGRM_TOKENS.colors.background.subtle,
          border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
        }}
      >
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
    </Modal>
  );
}
