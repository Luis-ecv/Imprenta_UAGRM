import { useState, type FormEvent } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import { X } from 'lucide-react';

import { Button } from '@/components/ui';
import { UAGRM_TOKENS } from '@/theme/tokens';
import { UNIDADES_MEDIDA } from '@/hooks/useInsumos';
import type { CategoriaInsumoCreate } from '@/types';

interface CategoriaModalProps {
  open: boolean;
  guardando: boolean;
  onClose: () => void;
  onSubmit: (payload: CategoriaInsumoCreate) => Promise<boolean>;
}

export function CategoriaModal({
  open,
  guardando,
  onClose,
  onSubmit,
}: CategoriaModalProps) {
  const [nombre, setNombre] = useState('');
  const [unidadBase, setUnidadBase] = useState('Unidad');
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorLocal('El nombre de la categoría es obligatorio.');
      return;
    }

    setErrorLocal(null);
    const ok = await onSubmit({
      nombre: nombre.trim(),
      unidad_base: unidadBase,
    });

    if (ok) {
      setNombre('');
      setUnidadBase('Unidad');
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => !guardando && onClose()}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 1,
            border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
          },
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ px: 3, pt: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primaryDark, fontSize: '1.2rem' }}>
              Nueva Categoría de Insumo
            </Typography>
            <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.slate, fontWeight: 600 }}>
              Clasificación para el catálogo de almacén litográfico
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            disabled={guardando}
            sx={{ color: UAGRM_TOKENS.colors.mutedSlate }}
          >
            <X size={18} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2 }}>
          {errorLocal && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setErrorLocal(null)}>
              {errorLocal}
            </Alert>
          )}

          <Stack spacing={2.5}>
            <Box>
              <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.charcoal, fontWeight: 700, display: 'block', mb: 0.8, textTransform: 'uppercase', fontSize: '0.74rem' }}>
                Nombre de la Categoría *
              </Typography>
              <TextField
                fullWidth
                size="small"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Planchas CTP, Barnices UV, Químicos de Prensa..."
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.charcoal, fontWeight: 700, display: 'block', mb: 0.8, textTransform: 'uppercase', fontSize: '0.74rem' }}>
                Unidad de Medida Base *
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={unidadBase}
                onChange={(e) => setUnidadBase(e.target.value)}
              >
                {UNIDADES_MEDIDA.map((u) => (
                  <MenuItem key={u} value={u}>
                    {u}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
          <Button
            type="button"
            variant="ghost"
            disabled={guardando}
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="default"
            isLoading={guardando}
          >
            Guardar Categoría
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
