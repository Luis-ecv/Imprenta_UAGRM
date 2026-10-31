import React from 'react';
import CircularProgress, { CircularProgressProps } from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export interface SpinnerProps extends CircularProgressProps {
  centered?: boolean;
  message?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  centered = false,
  message,
  size = 40,
  color = 'primary',
  ...props
}) => {
  const spinnerElement = <CircularProgress size={size} color={color} {...props} />;

  if (centered) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200,
          gap: 2,
          p: 4,
        }}
      >
        {spinnerElement}
        {message && (
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
        )}
      </Box>
    );
  }

  return spinnerElement;
};

export default Spinner;
