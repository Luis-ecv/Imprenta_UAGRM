import { useState, type FormEvent } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';

import { Modal, Button } from '@/components/ui';
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
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Nueva Categoría de Insumo"
      subtitle="Clasificación para el catálogo de almacén litográfico"
      maxWidth="xs"
      onSubmit={handleSubmit}
      isLoading={guardando}
      actions={
        <>
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
        </>
      }
    >
      {errorLocal && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setErrorLocal(null)}>
          {errorLocal}
        </Alert>
      )}

      <Stack spacing={2.5}>
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: UAGRM_TOKENS.colors.text.secondary,
              fontWeight: 700,
              display: 'block',
              mb: 0.8,
              textTransform: 'uppercase',
              fontSize: '0.74rem',
            }}
          >
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
          <Typography
            variant="caption"
            sx={{
              color: UAGRM_TOKENS.colors.text.secondary,
              fontWeight: 700,
              display: 'block',
              mb: 0.8,
              textTransform: 'uppercase',
              fontSize: '0.74rem',
            }}
          >
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
    </Modal>
  );
}
