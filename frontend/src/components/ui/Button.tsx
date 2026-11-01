import React from 'react';
import MuiButton, { ButtonProps as MuiButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

export interface ButtonProps extends Omit<MuiButtonProps, 'color'> {
  color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'inherit';
  isLoading?: boolean;
  pill?: boolean;
}

/**
 * Botón Institucional UAGRM para toda la aplicación.
 * Aplica formato píldora estándar (borderRadius: 50), sin textos en mayúsculas forzadas y spinner de carga.
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  isLoading = false,
  disabled,
  startIcon,
  variant = 'contained',
  color = 'primary',
  pill = true,
  sx,
  ...props
}) => {
  return (
    <MuiButton
      variant={variant}
      color={color}
      disabled={disabled || isLoading}
      startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : startIcon}
      sx={{
        borderRadius: pill ? 50 : 2.5,
        textTransform: 'none',
        fontWeight: 700,
        px: 2.5,
        py: 0.9,
        transition: 'all 0.15s ease-in-out',
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
