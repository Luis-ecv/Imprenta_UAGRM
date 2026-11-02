import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { Terminal, Shield, Laptop, Calendar, User } from 'lucide-react';

import { Modal, Button, Badge } from '@/components/ui';
import { UAGRM_TOKENS } from '@/theme/tokens';
import type { BitacoraResponse } from '@/types';
import { formatearFechaHora } from '@/utils/formatters';

interface BitacoraDetalleModalProps {
  open: boolean;
  registro: BitacoraResponse | null;
  onClose: () => void;
}

export const BitacoraDetalleModal: React.FC<BitacoraDetalleModalProps> = ({
  open,
  registro,
  onClose,
}) => {
  if (!registro) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Inspección de Registro de Auditoría"
      subtitle={`Trazabilidad forense del evento #BIT-${String(registro.id_bitacora).padStart(5, '0')}`}
      maxWidth="sm"
      actions={
        <Button variant="default" onClick={onClose}>
          Cerrar Auditoría
        </Button>
      }
    >
      <Box sx={{ pt: 1 }}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ p: 2, borderRadius: 2, border: `1px solid ${UAGRM_TOKENS.border.subtle}`, backgroundColor: UAGRM_TOKENS.colors.background.subtle }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: UAGRM_TOKENS.colors.slate }}>
                <Calendar size={15} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  Fecha y Hora
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.charcoal, fontSize: '0.88rem' }}>
                {formatearFechaHora(registro.created_at)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ p: 2, borderRadius: 2, border: `1px solid ${UAGRM_TOKENS.border.subtle}`, backgroundColor: UAGRM_TOKENS.colors.background.subtle }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: UAGRM_TOKENS.colors.slate }}>
                <User size={15} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  Usuario Responsable
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primaryDark, fontSize: '0.88rem' }}>
                {`ID Operador #${registro.usuario_id}`}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ p: 2, borderRadius: 2, border: `1px solid ${UAGRM_TOKENS.border.subtle}`, backgroundColor: UAGRM_TOKENS.colors.background.subtle }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: UAGRM_TOKENS.colors.slate }}>
                <Shield size={15} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  Módulo Operativo
                </Typography>
              </Box>
              <Badge variant="primary">
                {registro.modulo?.toUpperCase() || 'SISTEMA'}
              </Badge>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ p: 2, borderRadius: 2, border: `1px solid ${UAGRM_TOKENS.border.subtle}`, backgroundColor: UAGRM_TOKENS.colors.background.subtle }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: UAGRM_TOKENS.colors.slate }}>
                <Laptop size={15} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  Dirección IP Origen
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 750, color: UAGRM_TOKENS.colors.charcoal, fontSize: '0.88rem', fontFamily: 'monospace' }}>
                {registro.ip_origen || '127.0.0.1'}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ p: 2, borderRadius: 2, border: `1px solid ${UAGRM_TOKENS.border.subtle}`, backgroundColor: UAGRM_TOKENS.colors.background.subtle }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: UAGRM_TOKENS.colors.slate }}>
                <Terminal size={15} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  Acción y Detalle Registrado
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.charcoal, mb: 0.5, fontSize: '0.9rem' }}>
                {registro.accion}
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.825rem',
                  color: UAGRM_TOKENS.colors.slate,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  backgroundColor: UAGRM_TOKENS.colors.background.paper,
                  p: 1.5,
                  borderRadius: 1.5,
                  border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
                  mt: 1,
                }}
              >
                {registro.detalle || 'Sin metadatos o parámetros adicionales registrados en la transacción.'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default BitacoraDetalleModal;
