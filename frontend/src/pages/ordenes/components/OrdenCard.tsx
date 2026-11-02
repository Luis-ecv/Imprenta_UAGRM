import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui';
import { UAGRM_TOKENS } from '@/theme/tokens';
import type { OrdenTrabajoResponse, EstadoOrden } from '@/types';
import { formatearFecha } from '@/utils/formatters';
import { TRANSICIONES_ESTADO } from '@/utils/constants';
import { calcularCompromiso } from '@/hooks/useOrdenes';

interface EtapaLitografica {
  id: EstadoOrden;
  label: string;
  color: string;
}

const ETAPAS_LITOGRAFICAS: EtapaLitografica[] = [
  { id: 'REGISTRADO', label: 'Registradas', color: UAGRM_TOKENS.colors.slate },
  { id: 'EN COLA', label: 'En cola', color: UAGRM_TOKENS.colors.amber },
  { id: 'EN IMPRESION', label: 'En impresión', color: UAGRM_TOKENS.colors.royalBlue },
  { id: 'EN ACABADO', label: 'En acabado', color: '#7c3aed' },
  { id: 'FINALIZADO', label: 'Finalizadas', color: UAGRM_TOKENS.colors.emerald },
  { id: 'ENTREGADO', label: 'Entregadas', color: '#0f766e' },
];

interface OrdenCardProps {
  orden: OrdenTrabajoResponse;
  onAvanzar: (orden: OrdenTrabajoResponse) => void;
}

export const OrdenCard: React.FC<OrdenCardProps> = ({ orden, onAvanzar }) => {
  const detalle = orden.detalles_orden?.[0];
  const proformaDetalle = orden.proforma?.detalles?.[0];
  const compromisoInfo = calcularCompromiso(orden.fecha_compromiso);

  // Posición de la etapa actual (0 a 5)
  const currentStageIndex = ETAPAS_LITOGRAFICAS.findIndex((e) => e.id === orden.estado_actual);
  const activeStage = ETAPAS_LITOGRAFICAS[currentStageIndex] || ETAPAS_LITOGRAFICAS[0];
  const accentColor = activeStage.color;
  const esUrgente = orden.prioridad === 'URGENTE';

  // Configuración de acción según siguiente estado
  const siguiente = TRANSICIONES_ESTADO[orden.estado_actual];

  const getActionConfig = () => {
    if (!siguiente) {
      return { esFinal: true, label: '✓ Entregada' };
    }
    switch (siguiente) {
      case 'EN COLA':
        return { esFinal: false, label: 'Enviar a cola ➔' };
      case 'EN IMPRESION':
        return { esFinal: false, label: 'Enviar a impresión ➔' };
      case 'EN ACABADO':
        return { esFinal: false, label: 'Pasar a acabado ➔' };
      case 'FINALIZADO':
        return { esFinal: false, label: 'Marcar finalizada ➔' };
      case 'ENTREGADO':
        return { esFinal: false, label: 'Entregar a cliente ➔' };
      default:
        return { esFinal: false, label: `Avanzar a ${siguiente} ➔` };
    }
  };

  const action = getActionConfig();

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5, md: 3 },
        borderRadius: 3.5,
        backgroundColor: UAGRM_TOKENS.colors.background.paper,
        border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          borderColor: UAGRM_TOKENS.border.focus,
        },
      }}
    >
      <Grid container spacing={3} sx={{ alignItems: 'center' }}>
        {/* SECCIÓN 1: Identificación y Detalle Litográfico (Izquierda) */}
        <Grid size={{ xs: 12, md: 3.8 }}>
          <Box sx={{ pr: { md: 1 } }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.8 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  color: UAGRM_TOKENS.colors.slate,
                  fontSize: '0.85rem',
                }}
              >
                {orden.codigo_ot}
              </Typography>

              <Box
                component="span"
                sx={{
                  borderRadius: 50,
                  px: 1.2,
                  py: 0.2,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  backgroundColor: esUrgente
                    ? UAGRM_TOKENS.colors.status.error.light
                    : UAGRM_TOKENS.colors.background.subtle,
                  color: esUrgente
                    ? UAGRM_TOKENS.colors.status.error.dark
                    : UAGRM_TOKENS.colors.slate,
                  border: `1px solid ${
                    esUrgente ? UAGRM_TOKENS.border.danger : UAGRM_TOKENS.border.subtle
                  }`,
                }}
              >
                {orden.prioridad}
              </Box>
            </Stack>

            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 800,
                color: UAGRM_TOKENS.colors.charcoal,
                fontSize: '0.98rem',
                lineHeight: 1.25,
                mb: 0.6,
              }}
            >
              {proformaDetalle?.descripcion_trabajo || `Trabajo OT #${orden.id_orden}`}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: UAGRM_TOKENS.colors.slate,
                fontSize: '0.8rem',
                lineHeight: 1.4,
                display: 'block',
              }}
            >
              {orden.proforma?.cliente?.razon_social || 'Cliente UAGRM'}
              {detalle?.formato_corte ? ` · ${detalle.formato_corte}` : ''}
              {detalle?.tipo_encuadernacion ? ` · ${detalle.tipo_encuadernacion}` : ''}
            </Typography>
          </Box>
        </Grid>

        {/* SECCIÓN 2: Stepper Horizontal Litográfico (Centro) */}
        <Grid size={{ xs: 12, md: 5.4 }}>
          <Box sx={{ px: { xs: 0, md: 1 } }}>
            <Box sx={{ position: 'relative', width: '100%', py: 1 }}>
              {/* Línea base completa gris */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 15,
                  left: '8%',
                  right: '8%',
                  height: '3px',
                  backgroundColor: UAGRM_TOKENS.border.subtle,
                  zIndex: 1,
                }}
              />

              {/* Línea coloreada activa hasta el paso actual */}
              {currentStageIndex > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 15,
                    left: '8%',
                    width: `${(currentStageIndex / (ETAPAS_LITOGRAFICAS.length - 1)) * 84}%`,
                    height: '3px',
                    backgroundColor: accentColor,
                    transition: 'width 0.4s ease',
                    zIndex: 2,
                  }}
                />
              )}

              {/* Nodos y etiquetas de cada estación */}
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 3,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                {ETAPAS_LITOGRAFICAS.map((etapa, idx) => {
                  const isCompleted = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <Box
                      key={etapa.id}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '16.6%',
                      }}
                    >
                      <Box
                        sx={{
                          width: isCurrent ? 18 : 14,
                          height: isCurrent ? 18 : 14,
                          borderRadius: '50%',
                          backgroundColor: isCompleted
                            ? accentColor
                            : isCurrent
                            ? '#ffffff'
                            : '#ffffff',
                          border: isCompleted
                            ? `3px solid ${accentColor}`
                            : isCurrent
                            ? `4px solid ${accentColor}`
                            : `3px solid ${UAGRM_TOKENS.border.focus}`,
                          transition: 'all 0.3s ease',
                          boxShadow: isCurrent ? `0 0 0 3px rgba(0,0,0,0.05)` : 'none',
                          mb: 0.8,
                        }}
                      />

                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '0.68rem',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          fontWeight: isCurrent ? 800 : isCompleted ? 600 : 500,
                          color: isCurrent
                            ? UAGRM_TOKENS.colors.charcoal
                            : isCompleted
                            ? UAGRM_TOKENS.colors.slate
                            : UAGRM_TOKENS.colors.mutedSlate,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {etapa.label}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* SECCIÓN 3: Compromiso y Botón de Acción Directo (Derecha) */}
        <Grid size={{ xs: 12, md: 2.8 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'flex-start', md: 'flex-end' },
              gap: 1.2,
            }}
          >
            {/* Fecha de Compromiso + Badge */}
            <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.78rem' }}>
                Compromiso{' '}
                <strong style={{ color: UAGRM_TOKENS.colors.charcoal }}>
                  {formatearFecha(orden.fecha_compromiso)}
                </strong>
              </Typography>

              {compromisoInfo.texto && orden.estado_actual !== 'ENTREGADO' && (
                <Box
                  component="span"
                  sx={{
                    borderRadius: 50,
                    px: 1,
                    py: 0.2,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    backgroundColor:
                      compromisoInfo.nivel === 'vencida' || compromisoInfo.nivel === 'hoy'
                        ? UAGRM_TOKENS.colors.status.error.light
                        : compromisoInfo.nivel === 'urgente' || compromisoInfo.nivel === 'semana'
                        ? UAGRM_TOKENS.colors.status.warning.light
                        : UAGRM_TOKENS.colors.background.subtle,
                    color:
                      compromisoInfo.nivel === 'vencida' || compromisoInfo.nivel === 'hoy'
                        ? UAGRM_TOKENS.colors.status.error.dark
                        : compromisoInfo.nivel === 'urgente' || compromisoInfo.nivel === 'semana'
                        ? UAGRM_TOKENS.colors.status.warning.dark
                        : UAGRM_TOKENS.colors.slate,
                    border: `1px solid ${
                      compromisoInfo.nivel === 'vencida' || compromisoInfo.nivel === 'hoy'
                        ? UAGRM_TOKENS.border.danger
                        : compromisoInfo.nivel === 'urgente' || compromisoInfo.nivel === 'semana'
                        ? UAGRM_TOKENS.colors.status.warning.border
                        : UAGRM_TOKENS.border.subtle
                    }`,
                  }}
                >
                  {compromisoInfo.texto}
                </Box>
              )}
            </Stack>

            {/* Botón de Acción de Avance */}
            {action.esFinal ? (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.6,
                  color: UAGRM_TOKENS.colors.emerald,
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  py: 0.7,
                }}
              >
                <CheckCircle2 size={18} /> {action.label}
              </Box>
            ) : (
              <Button
                variant="outline"
                size="small"
                onClick={() => onAvanzar(orden)}
                style={{
                  borderRadius: 50,
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  color: accentColor,
                  borderColor: accentColor,
                  backgroundColor: UAGRM_TOKENS.colors.background.paper,
                }}
              >
                {action.label}
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

