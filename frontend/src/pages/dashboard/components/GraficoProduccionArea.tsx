import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { UAGRM_TOKENS } from '@/theme/tokens';

const DATOS_TENDENCIA_SEMANAL = [
  { dia: 'Lun', produccion: 14, demandaML: 16 },
  { dia: 'Mar', produccion: 22, demandaML: 20 },
  { dia: 'Mie', produccion: 28, demandaML: 25 },
  { dia: 'Jue', produccion: 19, demandaML: 22 },
  { dia: 'Vie', produccion: 35, demandaML: 32 },
  { dia: 'Sab', produccion: 16, demandaML: 18 },
];

export const GraficoProduccionArea: React.FC = () => {
  return (
    <Box
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: `${UAGRM_TOKENS.radii.xl}px`,
        border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
        backgroundColor: UAGRM_TOKENS.colors.background.paper,
        boxShadow: UAGRM_TOKENS.shadows.card,
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primaryDark, fontSize: '0.95rem' }}
        >
          Rendimiento Semanal de Taller Litográfico
        </Typography>
        <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.825rem' }}>
          Volumen de órdenes completadas vs. proyección de demanda estimada por el modelo predictivo.
        </Typography>
      </Box>

      <Box sx={{ height: 260, width: '100%', mt: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={DATOS_TENDENCIA_SEMANAL} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorProduccion" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={UAGRM_TOKENS.colors.primaryDark} stopOpacity={0.25} />
                <stop offset="95%" stopColor={UAGRM_TOKENS.colors.primaryDark} stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorDemanda" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={UAGRM_TOKENS.colors.ruby} stopOpacity={0.2} />
                <stop offset="95%" stopColor={UAGRM_TOKENS.colors.ruby} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={UAGRM_TOKENS.border.subtle} />
            <XAxis
              dataKey="dia"
              stroke={UAGRM_TOKENS.colors.slate}
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke={UAGRM_TOKENS.colors.slate}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: UAGRM_TOKENS.colors.background.paper,
                borderColor: UAGRM_TOKENS.border.subtle,
                borderRadius: 8,
                fontSize: 12,
                boxShadow: UAGRM_TOKENS.shadows.card,
              }}
            />
            <Area
              type="monotone"
              dataKey="produccion"
              name="Producción Real"
              stroke={UAGRM_TOKENS.colors.primaryDark}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorProduccion)"
            />
            <Area
              type="monotone"
              dataKey="demandaML"
              name="Estimación Predictiva"
              stroke={UAGRM_TOKENS.colors.ruby}
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#colorDemanda)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default GraficoProduccionArea;
