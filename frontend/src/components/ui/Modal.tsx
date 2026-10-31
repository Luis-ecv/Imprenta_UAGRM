import React from 'react';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';

export interface ModalProps extends Omit<DialogProps, 'title' | 'open'> {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  actions,
  children,
  maxWidth = 'sm',
  fullWidth = true,
  ...props
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      {...props}
    >
      {title && (
        <DialogTitle
          sx={{
            m: 0,
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {typeof title === 'string' ? (
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main' }}>
              {title}
            </Typography>
          ) : (
            title
          )}
          <IconButton
            aria-label="close"
            onClick={onClose}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
      )}

      <DialogContent sx={{ p: 3, pt: title ? '20px !important' : 3 }}>
        {children}
      </DialogContent>

      {actions && (
        <DialogActions
          sx={{
            p: 2.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            gap: 1,
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default Modal;
