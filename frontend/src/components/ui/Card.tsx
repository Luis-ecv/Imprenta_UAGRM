import React from 'react';
import MuiCard, { CardProps as MuiCardProps } from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

export interface CardProps extends Omit<MuiCardProps, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  headerBorder?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  headerBorder = false,
  children,
  ...props
}) => {
  return (
    <MuiCard {...props}>
      {(title || action) && (
        <CardHeader
          title={
            typeof title === 'string' ? (
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                {title}
              </Typography>
            ) : (
              title
            )
          }
          subheader={subtitle}
          action={action}
          sx={
            headerBorder
              ? { borderBottom: '1px solid', borderColor: 'divider', pb: 2 }
              : undefined
          }
        />
      )}
      <CardContent sx={{ '&:last-child': { pb: 3 } }}>{children}</CardContent>
    </MuiCard>
  );
};

export default Card;
