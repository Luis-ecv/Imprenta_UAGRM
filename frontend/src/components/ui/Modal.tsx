import React from 'react';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { X } from 'lucide-react';
import { UAGRM_TOKENS } from '@/theme/tokens';

export interface ModalProps extends Omit<DialogProps, 'title' | 'open'> {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  onSubmit?: (e: React.FormEvent) => void;
  isLoading?: boolean;
}

/**
 * Modal Institucional UAGRM para diálogos y formularios.
 * Estandariza el contenedor, encabezado con título/subtítulo, botón de cerrar X y barra de acciones.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  open,
  onClose,
  title,
  subtitle,
  actions,
  children,
  maxWidth = 'sm',
  fullWidth = true,
  onSubmit,
  isLoading = false,
  slotProps,
  ...props
}) => {
  const isModalOpen = isOpen !== undefined ? isOpen : Boolean(open);

  const content = (
    <>
      {title && (
        <DialogTitle
          sx={{
            pb: 1,
            pt: 2.5,
            px: 3,
            position: 'relative',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {typeof title === 'string' ? (
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: UAGRM_TOKENS.colors.primaryDark,
                fontSize: '1.4rem',
                mb: subtitle ? 0.4 : 0,
              }}
            >
              {title}
            </Typography>
          ) : (
            title
          )}

          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: UAGRM_TOKENS.colors.slate,
                fontSize: '0.875rem',
              }}
            >
              {subtitle}
            </Typography>
          )}

          <IconButton
            aria-label="Cerrar"
            onClick={onClose}
            disabled={isLoading}
            size="small"
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: UAGRM_TOKENS.colors.mutedSlate,
              '&:hover': { color: UAGRM_TOKENS.colors.slate },
            }}
          >
            <X size={18} />
          </IconButton>
        </DialogTitle>
      )}

      <DialogContent
        dividers={Boolean(title || actions)}
        sx={{
          borderColor: UAGRM_TOKENS.border.subtle,
          p: 3,
        }}
      >
        {children}
      </DialogContent>

      {actions && (
        <DialogActions
          sx={{
            p: 2.5,
            pt: 2,
            borderTop: `1px solid ${UAGRM_TOKENS.border.subtle}`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {actions}
        </DialogActions>
      )}
    </>
  );

  return (
    <Dialog
      open={isModalOpen}
      onClose={() => !isLoading && onClose()}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 1,
            border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
            boxShadow: UAGRM_TOKENS.shadows.modal,
          },
        },
        ...slotProps,
      }}
      {...props}
    >
      {onSubmit ? (
        <form onSubmit={onSubmit} style={{ display: 'contents' }}>
          {content}
        </form>
      ) : (
        content
      )}
    </Dialog>
  );
};

export default Modal;
