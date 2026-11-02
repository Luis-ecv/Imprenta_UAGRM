import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Chip from '@mui/material/Chip';
import { UAGRM_TOKENS } from '@/theme/tokens';

export interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  trendLabel?: string;
  trendPositive?: boolean;
  isLoading?: boolean;
}

const COLOR_MAP = {
  primary: {
    bg: 'rgba(30, 43, 77, 0.08)',
    text: UAGRM_TOKENS.colors.primary.main,
    border: 'rgba(30, 43, 77, 0.15)',
  },
  secondary: {
    bg: 'rgba(128, 0, 0, 0.08)',
    text: UAGRM_TOKENS.colors.secondary.main,
    border: 'rgba(128, 0, 0, 0.15)',
  },
  accent: {
    bg: 'rgba(85, 166, 188, 0.15)',
    text: UAGRM_TOKENS.colors.accent.dark,
    border: 'rgba(85, 166, 188, 0.25)',
  },
  success: {
    bg: UAGRM_TOKENS.colors.status.success.light,
    text: UAGRM_TOKENS.colors.status.success.dark,
    border: UAGRM_TOKENS.colors.status.success.border,
  },
  warning: {
    bg: UAGRM_TOKENS.colors.status.warning.light,
    text: UAGRM_TOKENS.colors.status.warning.dark,
    border: UAGRM_TOKENS.colors.status.warning.border,
  },
  error: {
    bg: UAGRM_TOKENS.colors.status.error.light,
    text: UAGRM_TOKENS.colors.status.error.dark,
    border: UAGRM_TOKENS.colors.status.error.border,
  },
};

/**
 * Tarjeta de Indicador Clave (KPI) para métricas y resúmenes de almacén litográfico.
 */
export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  color = 'primary',
  trendLabel,
  trendPositive = true,
  isLoading = false,
}) => {
  const themeColors = COLOR_MAP[color] || COLOR_MAP.primary;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${UAGRM_TOKENS.colors.border.default}`,
        backgroundColor: UAGRM_TOKENS.colors.background.card,
        boxShadow: UAGRM_TOKENS.shadows.card,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          boxShadow: UAGRM_TOKENS.shadows.cardHover,
          borderColor: themeColors.border,
        },
        height: '100%',
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box
            sx={{
              p: 1.25,
              borderRadius: 2.5,
              backgroundColor: themeColors.bg,
              color: themeColors.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>

          {trendLabel && !isLoading && (
            <Chip
              size="small"
              label={trendLabel}
              sx={{
                fontWeight: UAGRM_TOKENS.typography.weights.bold,
                fontSize: '0.72rem',
                borderRadius: UAGRM_TOKENS.radii.pill,
                backgroundColor: trendPositive
                  ? UAGRM_TOKENS.colors.status.success.light
                  : UAGRM_TOKENS.colors.status.error.light,
                color: trendPositive
                  ? UAGRM_TOKENS.colors.status.success.dark
                  : UAGRM_TOKENS.colors.status.error.dark,
              }}
            />
          )}
        </Box>

        <Typography
          variant="caption"
          sx={{
            color: UAGRM_TOKENS.colors.text.secondary,
            fontWeight: UAGRM_TOKENS.typography.weights.bold,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'block',
            mb: 0.25,
          }}
        >
          {title}
        </Typography>

        {isLoading ? (
          <Skeleton variant="text" width={80} height={36} />
        ) : (
          <Typography
            variant="h5"
            sx={{
              fontWeight: UAGRM_TOKENS.typography.weights.extraBold,
              color: themeColors.text,
              lineHeight: 1.2,
            }}
          >
            {value}
          </Typography>
        )}

        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: UAGRM_TOKENS.colors.text.muted,
              fontSize: '0.75rem',
              display: 'block',
              mt: 0.5,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default KpiCard;

