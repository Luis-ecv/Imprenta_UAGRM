import React from 'react';
import MuiAlert, { AlertProps as MuiAlertProps } from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

export interface AlertProps extends MuiAlertProps {
  title?: string;
}

export const Alert: React.FC<AlertProps> = ({
  title,
  severity = 'info',
  children,
  sx,
  ...props
}) => {
  return (
    <MuiAlert
      severity={severity}
      sx={{
        borderRadius: 2,
        ...sx,
      }}
      {...props}
    >
      {title && <AlertTitle sx={{ fontWeight: 700 }}>{title}</AlertTitle>}
      {children}
    </MuiAlert>
  );
};

export default Alert;
