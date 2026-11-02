import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { BrainCircuit, TrendingUp, ShieldAlert, ShoppingBag, Sparkles } from 'lucide-react';

import { Button, Badge } from '@/components/ui';
import { UAGRM_TOKENS } from '@/theme/tokens';
import type { PrediccionDemandaResponse, InsumoResponse } from '@/types';

interface MetricasMLCardProps {
  prediccion: PrediccionDemandaResponse | null;
  insumo: InsumoResponse | undefined;
  periodoNombre: string;
  onGenerarCompra: () => void;
}

export const MetricasMLCard: React.FC<MetricasMLCardProps> = ({
  prediccion,
  insumo,
  periodoNombre,
  onGenerarCompra,
}) => {
  if (!prediccion) {
    return (
      <Box
        sx={{
          p: 4,
          borderRadius: `${UAGRM_TOKENS.radii.xl}px`,
          border: `1px dashed ${UAGRM_TOKENS.border.subtle}`,
          backgroundColor: UAGRM_TOKENS.colors.background.subtle,
          textAlign: 'center',
        }}
      >
        <BrainCircuit size={40} color={UAGRM_TOKENS.colors.slate} style={{ margin: '0 auto 12px' }} />
        <Typography sx={{ fontWeight: 700, color: UAGRM_TOKENS.colors.charcoal, mb: 0.5 }}>
          Inferencia Predictiva Pendiente
        </Typography>
        <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, maxWidth: 420, mx: 'auto' }}>
          Selecciona un insumo litográfico y un periodo académico, luego presiona «Calcular Predicción ML» para ejecutar el modelo.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2.5, sm: 3.5 },
        borderRadius: `${UAGRM_TOKENS.radii.xl}px`,
        border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
        backgroundColor: UAGRM_TOKENS.colors.background.paper,
        boxShadow: UAGRM_TOKENS.shadows.card,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Sparkles size={18} color={UAGRM_TOKENS.colors.ruby} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primaryDark }}>
              Resultados de Inferencia Algorítmica (Random Forest)
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.825rem' }}>
            Insumo: <strong>{insumo?.descripcion || 'Material seleccionado'}</strong> ({insumo?.codigo || 'S/C'}) • {periodoNombre}
          </Typography>
        </Box>

        <Badge variant={prediccion.es_referencial ? 'warning' : 'success'}>
          {prediccion.es_referencial ? 'Inferencia Referencial' : 'Modelo Calibrado'}
        </Badge>
      </Box>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: `${UAGRM_TOKENS.radii.lg}px`,
              border: `1px solid ${UAGRM_TOKENS.colors.royalBlue}30`,
              backgroundColor: `${UAGRM_TOKENS.colors.royalBlue}08`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: UAGRM_TOKENS.colors.royalBlue, mb: 0.5 }}>
              <TrendingUp size={16} />
              <Typography sx={{ fontWeight: 750, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                Demanda Proyectada
              </Typography>
            </Box>
            <Typography sx={{ fontWeight: 900, color: UAGRM_TOKENS.colors.primaryDark, fontSize: '1.6rem' }}>
              {Math.ceil(prediccion.cantidad_proyectada)} {insumo?.unidad_medida || 'u.'}
            </Typography>
            <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.slate }}>
              Consumo estimado en el semestre
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: `${UAGRM_TOKENS.radii.lg}px`,
              border: `1px solid ${UAGRM_TOKENS.colors.amber}30`,
              backgroundColor: `${UAGRM_TOKENS.colors.amber}08`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: UAGRM_TOKENS.colors.amber, mb: 0.5 }}>
              <ShieldAlert size={16} />
              <Typography sx={{ fontWeight: 750, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                Margen Variabilidad
              </Typography>
            </Box>
            <Typography sx={{ fontWeight: 900, color: UAGRM_TOKENS.colors.charcoal, fontSize: '1.6rem' }}>
              ±{Math.ceil(prediccion.margen_variabilidad)} {insumo?.unidad_medida || 'u.'}
            </Typography>
            <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.slate }}>
              Desviación estadística esperada
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: `${UAGRM_TOKENS.radii.lg}px`,
              border: `1px solid ${UAGRM_TOKENS.colors.ruby}30`,
              backgroundColor: `${UAGRM_TOKENS.colors.ruby}08`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: UAGRM_TOKENS.colors.ruby, mb: 0.5 }}>
              <ShoppingBag size={16} />
              <Typography sx={{ fontWeight: 750, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                Compra Sugerida
              </Typography>
            </Box>
            <Typography sx={{ fontWeight: 900, color: UAGRM_TOKENS.colors.ruby, fontSize: '1.6rem' }}>
              {Math.ceil(prediccion.stock_sugerido_compra)} {insumo?.unidad_medida || 'u.'}
            </Typography>
            <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.slate }}>
              Déficit neto tras considerar stock actual
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {prediccion.stock_sugerido_compra > 0 && (
        <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="default"
            onClick={onGenerarCompra}
            icon={<ShoppingBag size={16} />}
          >
            Emitir Orden de Compra Sugerida ({Math.ceil(prediccion.stock_sugerido_compra)} {insumo?.unidad_medida})
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default MetricasMLCard;
