import React, { useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { Check } from 'lucide-react';

import { Modal, Button } from '@/components/ui';
import { UAGRM_TOKENS } from '@/theme/tokens';
import type { OrdenTrabajoResponse, InsumoResponse } from '@/types';

interface CierreTecnicoModalProps {
  orden: OrdenTrabajoResponse | null;
  insumos: InsumoResponse[];
  onClose: () => void;
  onConfirmar: (
    ordenId: number,
    insumoId: number | null,
    papelUtilizado: number,
    papelMerma: number,
    observaciones?: string
  ) => Promise<boolean>;
}

export const CierreTecnicoModal: React.FC<CierreTecnicoModalProps> = ({
  orden,
  insumos,
  onClose,
  onConfirmar,
}) => {
  const [insumoId, setInsumoId] = useState<number | ''>('');
  const [papelUtilizado, setPapelUtilizado] = useState<string>('500');
  const [papelMerma, setPapelMerma] = useState<string>('15');
  const [tintaUtilizada, setTintaUtilizada] = useState<string>('0.8');
  const [planchasUtilizadas, setPlanchasUtilizadas] = useState<string>('4');
  const [planchasMerma, setPlanchasMerma] = useState<string>('0');
  const [observacionesCierre, setObservacionesCierre] = useState<string>('');
  const [guardando, setGuardando] = useState<boolean>(false);

  useEffect(() => {
    if (orden) {
      if (insumos.length > 0) {
        setInsumoId(insumos[0].id_insumo);
      }
      setPapelUtilizado('500');
      setPapelMerma('15');
      setTintaUtilizada('0.8');
      setPlanchasUtilizadas('4');
      setPlanchasMerma('0');
      setObservacionesCierre('');
    }
  }, [orden, insumos]);

  const totales = useMemo(() => {
    const pU = Math.max(0, parseFloat(papelUtilizado) || 0);
    const pM = Math.max(0, parseFloat(papelMerma) || 0);
    return {
      papelTotal: pU + pM,
    };
  }, [papelUtilizado, papelMerma]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orden) return;

    setGuardando(true);
    const exito = await onConfirmar(
      orden.id_orden,
      insumoId ? Number(insumoId) : null,
      parseFloat(papelUtilizado) || 0,
      parseFloat(papelMerma) || 0,
      observacionesCierre
    );
    setGuardando(false);
    if (exito) {
      onClose();
    }
  };

  return (
    <Modal
      open={Boolean(orden)}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Cierre Técnico y Reporte de Mermas"
      subtitle="Taller de Producción Litográfica"
      maxWidth="md"
      isLoading={guardando}
      actions={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={guardando}
            style={{ minWidth: 125 }}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="default"
            disabled={guardando}
            isLoading={guardando}
            icon={<Check size={18} />}
            style={{ minWidth: 185 }}
          >
            Confirmar Cierre
          </Button>
        </>
      }
    >
      <Typography
        variant="body2"
        sx={{ color: UAGRM_TOKENS.colors.slate, mb: 2, fontSize: '0.85rem' }}
      >
        Registra el consumo real y las mermas generadas para {orden?.codigo_ot}. Los datos descontarán
        automáticamente el inventario de almacén y alimentarán el dataset de inferencia ML.
      </Typography>

      {orden && (
        <Box
          sx={{
            p: 2,
            mb: 2.5,
            borderRadius: 2.5,
            border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
            backgroundColor: UAGRM_TOKENS.colors.background.subtle,
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primaryDark }}
          >
            {orden.codigo_ot} — {orden.proforma?.detalles?.[0]?.descripcion_trabajo || 'Trabajo Litográfico'}
          </Typography>
        </Box>
      )}

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
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
              backgroundColor: UAGRM_TOKENS.colors.background.subtle,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: UAGRM_TOKENS.colors.slate, fontWeight: 700, textTransform: 'uppercase' }}
            >
              Total a Deducir
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 800,
                color: UAGRM_TOKENS.colors.primaryDark,
                fontFamily: 'monospace',
              }}
            >
              {totales.papelTotal} pliegos
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
    </Modal>
  );
};
