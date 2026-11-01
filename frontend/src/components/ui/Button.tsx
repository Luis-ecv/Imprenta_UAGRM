import React from 'react';
import MuiButton, { ButtonProps as MuiButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

export type ButtonVariant = 'contained' | 'outlined' | 'text' | 'default' | 'outline' | 'secondary' | 'ghost';

export interface ButtonProps extends Omit<MuiButtonProps, 'color' | 'variant'> {
  variant?: ButtonVariant;
  color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'inherit';
  isLoading?: boolean;
  pill?: boolean;
  icon?: React.ReactNode;
  component?: React.ElementType;
  to?: string;
}

/**
 * Botón Institucional UAGRM para toda la aplicación.
 * Aplica formato píldora estándar (borderRadius: 50), sin textos en mayúsculas forzadas y spinner de carga.
 * Soporta variantes estándar de MUI y aliases declarativos (default, outline, secondary, ghost).
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  isLoading = false,
  disabled,
  startIcon,
  icon,
  variant = 'contained',
  color = 'primary',
  pill = true,
  size,
  sx,
  ...props
}) => {
  // Mapeo seguro de variantes
  let muiVariant: 'contained' | 'outlined' | 'text' = 'contained';
  let customSx = {};

  if (variant === 'outlined' || variant === 'outline') {
    muiVariant = 'outlined';
    customSx = {
      borderColor: '#e2e8f0',
      color: '#1e2b4d',
      backgroundColor: '#ffffff',
      '&:hover': {
        borderColor: '#cbd5e1',
        backgroundColor: '#f8fafc',
      },
    };
  } else if (variant === 'text' || variant === 'ghost') {
    muiVariant = 'text';
    customSx = {
      color: '#64748b',
      '&:hover': {
        backgroundColor: '#f1f5f9',
        color: '#1e2b4d',
      },
    };
  } else if (variant === 'secondary') {
    muiVariant = 'contained';
    color = 'secondary';
  }

  const effectiveStartIcon = isLoading ? (
    <CircularProgress size={16} color="inherit" />
  ) : (
    icon || startIcon
  );

  const effectiveSize = size === ('sm' as unknown) ? 'small' : size;

  return (
    <MuiButton
      variant={muiVariant}
      color={color}
      size={effectiveSize}
      disabled={disabled || isLoading}
      startIcon={effectiveStartIcon}
      sx={{
        borderRadius: pill ? 50 : 2.5,
        textTransform: 'none',
        fontWeight: 700,
        px: 2.5,
        py: 0.9,
        transition: 'all 0.15s ease-in-out',
        ...customSx,
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
