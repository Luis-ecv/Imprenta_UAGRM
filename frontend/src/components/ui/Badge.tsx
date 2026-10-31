import React from 'react';
import Chip, { ChipProps } from '@mui/material/Chip';

export interface BadgeProps extends Omit<ChipProps, 'color'> {
  color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'default';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  color = 'default',
  size = 'small',
  variant = 'filled',
  sx,
  ...props
}) => {
  return (
    <Chip
      size={size}
      color={color as ChipProps['color']}
      variant={variant}
      sx={{
        fontWeight: 600,
        fontSize: '0.75rem',
        ...sx,
      }}
      {...props}
    />
  );
};

export default Badge;
