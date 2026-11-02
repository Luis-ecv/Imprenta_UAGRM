import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { AlertTriangle, Trash2 } from 'lucide-react';
import Button from './Button';
import { UAGRM_TOKENS } from '@/theme/tokens';

export interface ConfirmDialogProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message?: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'secondary' | 'error' | 'warning';
  isDestructive?: boolean;
  isLoading?: boolean;
}

/**
 * Diálogo modal para confirmación de acciones sensibles (eliminación, bajas, etc.).
 * Centrado, con formato visual UAGRM y prevención de cierre accidental.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  open,
  onClose,
  onConfirm,
  title,
  message,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmColor,
  isDestructive = false,
  isLoading = false,
}) => {
  const isModalOpen = open !== undefined ? open : (isOpen ?? false);
  const contenido = description || message;
  const esPeligroso = isDestructive || confirmColor === 'error';

  const iconBg = esPeligroso
    ? UAGRM_TOKENS.colors.status.error.light
    : UAGRM_TOKENS.colors.status.warning.light;
  const iconColor = esPeligroso
    ? UAGRM_TOKENS.colors.status.error.main
    : UAGRM_TOKENS.colors.status.warning.main;

  return (
    <Dialog
      open={isModalOpen}
      onClose={isLoading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3.5,
            p: 1,
            boxShadow: UAGRM_TOKENS.shadows.modal,
          },
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pt: 2.5, pb: 1 }}>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            backgroundColor: iconBg,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 1.5,
          }}
        >
          {esPeligroso ? <Trash2 size={26} /> : <AlertTriangle size={26} />}
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: UAGRM_TOKENS.typography.weights.extraBold,
            color: UAGRM_TOKENS.colors.text.primary,
          }}
        >
          {title}
        </Typography>
      </DialogTitle>

      {contenido && (
        <DialogContent sx={{ textAlign: 'center', px: 3, py: 1 }}>
          {typeof contenido === 'string' ? (
            <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.text.secondary, lineHeight: 1.5 }}>
              {contenido}
            </Typography>
          ) : (
            contenido
          )}
        </DialogContent>
      )}

      <DialogActions sx={{ p: 2.5, justifyContent: 'center', gap: 1.5 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          disabled={isLoading}
          sx={{ px: 3, minWidth: 110, color: UAGRM_TOKENS.colors.text.leadHeader }}
        >
          {cancelText}
        </Button>
        <Button
          variant="contained"
          color={esPeligroso ? 'error' : (confirmColor || 'primary')}
          onClick={onConfirm}
          isLoading={isLoading}
          sx={{
            px: 3,
            minWidth: 130,
            ...(esPeligroso
              ? { backgroundColor: UAGRM_TOKENS.colors.status.error.main, '&:hover': { backgroundColor: UAGRM_TOKENS.colors.status.error.dark } }
              : {}),
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
