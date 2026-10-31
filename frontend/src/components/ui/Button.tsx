import React from 'react';
import MuiButton, { ButtonProps as MuiButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

export interface ButtonProps extends Omit<MuiButtonProps, 'color'> {
  color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'inherit';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  isLoading = false,
  disabled,
  startIcon,
  variant = 'contained',
  color = 'primary',
  ...props
}) => {
  return (
    <MuiButton
      variant={variant}
      color={color}
      disabled={disabled || isLoading}
      startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : startIcon}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
