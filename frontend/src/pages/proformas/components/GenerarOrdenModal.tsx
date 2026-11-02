import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { Check } from 'lucide-react';

import { Modal, Button } from '@/components/ui';
import { UAGRM_TOKENS } from '@/theme/tokens';
import { ordenesApi } from '@/api/ordenes.api';
import type { ProformaResponse, PrioridadOrden } from '@/types';

interface GenerarOrdenModalProps {
  proforma: ProformaResponse | null;
  onClose: () => void;
  onOrdenCreada: () => void;
}

export const GenerarOrdenModal: React.FC<GenerarOrdenModalProps> = ({
  proforma,
  onClose,
  onOrdenCreada,
}) => {
  const [fechaCompromiso, setFechaCompromiso] = useState<string>('');
  const [prioridad, setPrioridad] = useState<PrioridadOrden>('NORMAL');
  const [formatoCorte, setFormatoCorte] = useState<string>('Carta 21.5 x 28 cm');
  const [tipoEncuadernacion, setTipoEncuadernacion] = useState<string>('Anillado plástico');
  const [especificaciones, setEspecificaciones] = useState<string>('');
  const [creando, setCreando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (proforma) {
      setFechaCompromiso(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
      setPrioridad('NORMAL');
      setFormatoCorte('Carta 21.5 x 28 cm');
      setTipoEncuadernacion('Anillado plástico');
      setEspecificaciones('');
      setError(null);
    }
  }, [proforma]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proforma) return;

    try {
      setCreando(true);
      setError(null);
      await ordenesApi.crear({
        proforma_id: proforma.id_proforma,
        fecha_compromiso:
          fechaCompromiso || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        prioridad,
        detalle_orden: {
          formato_corte: formatoCorte,
          tipo_encuadernacion: tipoEncuadernacion,
          especificaciones_taller: especificaciones || undefined,
        },
      });
      onOrdenCreada();
      onClose();
    } catch {
      setError('No se pudo generar la orden de trabajo para esta proforma.');
    } finally {
      setCreando(false);
    }
  };

  return (
    <Modal
      open={Boolean(proforma)}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Generar Orden de Trabajo"
      subtitle="Taller y Producción Litográfica"
      maxWidth="sm"
      isLoading={creando}
      actions={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={creando}
            style={{ minWidth: 125 }}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="default"
            disabled={creando}
            isLoading={creando}
            icon={<Check size={18} />}
            style={{ minWidth: 185 }}
          >
            Confirmar Orden
          </Button>
        </>
      }
    >
      <Typography
        variant="body2"
        sx={{ color: UAGRM_TOKENS.colors.slate, mb: 2, fontSize: '0.85rem' }}
      >
        Pase a taller de impresión offset según proforma comercial aprobada.
      </Typography>

      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {proforma && (
        <Box
          sx={{
            p: 2,
            mb: 2.5,
            borderRadius: 3,
            border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
            backgroundColor: UAGRM_TOKENS.colors.background.subtle,
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primaryDark }}
          >
            Proforma: {proforma.codigo_proforma}
          </Typography>
          <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.slate, display: 'block', mt: 0.5 }}>
            {proforma.detalles?.[0]?.descripcion_trabajo || 'Sin descripción'}
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
    </Modal>
  );
};
