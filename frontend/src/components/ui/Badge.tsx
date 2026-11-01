import React from 'react';
import Box, { BoxProps } from '@mui/material/Box';
import { UAGRM_TOKENS } from '@/theme/tokens';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'default';

export interface BadgeProps extends Omit<BoxProps, 'color'> {
  variant?: BadgeVariant;
  color?: BadgeVariant; // Alias de variant
  size?: 'small' | 'medium';
  dot?: boolean;
  children?: React.ReactNode;
}

/**
 * Badge Institucional UAGRM para estados, categorías y chips informativos.
 * Utiliza los tokens de color semánticos (fondos pasteles suaves, bordes sutiles y textos de alto contraste).
 */
export const Badge: React.FC<BadgeProps> = ({
  variant,
  color = 'default',
  size = 'small',
  dot = false,
  children,
  sx,
  ...props
}) => {
  const activeVariant = variant || color;

  let bg: string = UAGRM_TOKENS.colors.status.neutral.light;
  let textColor: string = UAGRM_TOKENS.colors.status.neutral.text;
  let borderColor: string = UAGRM_TOKENS.colors.status.neutral.border;

  if (activeVariant === 'success') {
    bg = UAGRM_TOKENS.colors.status.success.light;
    textColor = UAGRM_TOKENS.colors.status.success.text;
    borderColor = UAGRM_TOKENS.colors.status.success.border;
  } else if (activeVariant === 'error') {
    bg = UAGRM_TOKENS.colors.status.error.light;
    textColor = UAGRM_TOKENS.colors.status.error.text;
    borderColor = UAGRM_TOKENS.colors.status.error.border;
  } else if (activeVariant === 'warning') {
    bg = UAGRM_TOKENS.colors.status.warning.light;
    textColor = UAGRM_TOKENS.colors.status.warning.text;
    borderColor = UAGRM_TOKENS.colors.status.warning.border;
  } else if (activeVariant === 'info') {
    bg = UAGRM_TOKENS.colors.status.info.light;
    textColor = UAGRM_TOKENS.colors.status.info.text;
    borderColor = UAGRM_TOKENS.colors.status.info.border;
  } else if (activeVariant === 'primary') {
    bg = 'rgba(30, 43, 77, 0.08)';
    textColor = UAGRM_TOKENS.colors.primary.main;
    borderColor = 'rgba(30, 43, 77, 0.18)';
  } else if (activeVariant === 'secondary') {
    bg = 'rgba(128, 0, 0, 0.08)';
    textColor = UAGRM_TOKENS.colors.secondary.main;
    borderColor = 'rgba(128, 0, 0, 0.18)';
  }

  const isSmall = size === 'small';

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.6,
        px: isSmall ? 1.4 : 1.8,
        py: isSmall ? 0.3 : 0.5,
        borderRadius: 50,
        backgroundColor: bg,
        color: textColor,
        border: `1px solid ${borderColor}`,
        fontWeight: 750,
        fontSize: isSmall ? '0.75rem' : '0.825rem',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        transition: 'all 0.15s ease',
        ...sx,
      }}
      {...props}
    >
      {dot && (
        <Box
          component="span"
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: textColor,
          }}
        />
      )}
      {children}
    </Box>
  );
};

export default Badge;
