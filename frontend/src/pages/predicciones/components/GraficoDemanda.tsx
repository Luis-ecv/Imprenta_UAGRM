import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { UAGRM_TOKENS } from '@/theme/tokens';

const DATOS_GRAFICA_DEMANDA = [
  { mes: 'Mes 1 (Apertura)', demanda: 45, estacionalidad: 'Baja' },
  { mes: 'Mes 2', demanda: 58, estacionalidad: 'Media' },
  { mes: 'Mes 3', demanda: 35, estacionalidad: 'Normal' },
  { mes: 'Mes 4 (Parciales)', demanda: 92, estacionalidad: 'Alta' },
  { mes: 'Mes 5 (Finales / Titulación)', demanda: 110, estacionalidad: 'Pico' },
  { mes: 'Mes 6 (Cierre)', demanda: 60, estacionalidad: 'Media' },
];

export const GraficoDemanda: React.FC = () => {
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
          Curva Estacional de Demanda Litográfica (Semestre Académico)
        </Typography>
        <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.825rem' }}>
          Patrón estacional de consumo inferido según el calendario de la UAGRM (picos en exámenes y actos de colación).
        </Typography>
      </Box>

      <Box sx={{ height: 260, width: '100%', mt: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DATOS_GRAFICA_DEMANDA} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={UAGRM_TOKENS.border.subtle} />
            <XAxis
              dataKey="mes"
              stroke={UAGRM_TOKENS.colors.slate}
              fontSize={11}
              tickLine={false}
              interval={0}
              angle={-15}
              textAnchor="end"
            />
            <YAxis
              stroke={UAGRM_TOKENS.colors.slate}
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              cursor={{ fill: `${UAGRM_TOKENS.colors.primaryDark}08` }}
              contentStyle={{
                backgroundColor: UAGRM_TOKENS.colors.background.paper,
                borderColor: UAGRM_TOKENS.border.subtle,
                borderRadius: 8,
                fontSize: 12,
                boxShadow: UAGRM_TOKENS.shadows.card,
              }}
              formatter={(val: number) => [`${val} Unidades`, 'Demanda Estimada']}
            />
            <Bar dataKey="demanda" radius={[6, 6, 0, 0]}>
              {DATOS_GRAFICA_DEMANDA.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.estacionalidad === 'Pico'
                      ? UAGRM_TOKENS.colors.ruby
                      : entry.estacionalidad === 'Alta'
                      ? UAGRM_TOKENS.colors.amber
                      : UAGRM_TOKENS.colors.royalBlue
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default GraficoDemanda;

