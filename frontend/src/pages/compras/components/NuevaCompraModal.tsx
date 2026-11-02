import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import { Check } from 'lucide-react';

import { Modal, Button } from '@/components/ui';
import type { ProveedorResponse, OrdenCompraCreate } from '@/types';

interface NuevaCompraModalProps {
  open: boolean;
  proveedores: ProveedorResponse[];
  cargandoProveedores: boolean;
  guardando: boolean;
  onClose: () => void;
  onSubmit: (datos: OrdenCompraCreate) => Promise<boolean>;
}

export const NuevaCompraModal: React.FC<NuevaCompraModalProps> = ({
  open,
  proveedores,
  cargandoProveedores,
  guardando,
  onClose,
  onSubmit,
}) => {
  const [proveedorId, setProveedorId] = useState<number | ''>('');
  const [totalEstimado, setTotalEstimado] = useState<string>('1500');
  const [estado, setEstado] = useState<string>('SUGERIDA');
  const [errorProveedor, setErrorProveedor] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (proveedores.length > 0) {
        setProveedorId(proveedores[0].id_proveedor);
      } else {
        setProveedorId('');
      }
      setTotalEstimado('1500');
      setEstado('SUGERIDA');
      setErrorProveedor(null);
    }
  }, [open, proveedores]);

  const handleSubmit = async () => {
    if (!proveedorId) {
      setErrorProveedor('Debe seleccionar un proveedor autorizado.');
      return;
    }

    const payload: OrdenCompraCreate = {
      proveedor_id: Number(proveedorId),
      total_estimado: parseFloat(totalEstimado) || 0,
      estado,
    };

    const exito = await onSubmit(payload);
    if (exito) {
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Generar Orden de Compra Institucional"
      subtitle="Abastecimiento de materia prima, papel, tintas y planchas CTP"
      maxWidth="sm"
      actions={
        <>
          <Button variant="outline" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            loading={guardando}
            icon={<Check size={16} />}
          >
            Emitir Orden de Compra
          </Button>
        </>
      }
    >
      <Box sx={{ pt: 1 }}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Proveedor Autorizado *"
              value={proveedorId}
              onChange={(e) => {
                setProveedorId(Number(e.target.value));
                setErrorProveedor(null);
              }}
              error={Boolean(errorProveedor)}
              helperText={errorProveedor}
              disabled={cargandoProveedores}
            >
              {cargandoProveedores ? (
                <MenuItem disabled>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  Cargando catálogo de proveedores...
                </MenuItem>
              ) : proveedores.length === 0 ? (
                <MenuItem disabled>No hay proveedores registrados en el padrón</MenuItem>
              ) : (
                proveedores.map((p) => (
                  <MenuItem key={p.id_proveedor} value={p.id_proveedor}>
                    {p.razon_social} {p.nit ? `(NIT: ${p.nit})` : ''}
                  </MenuItem>
                ))
              )}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Total Estimado (Bs) *"
              value={totalEstimado}
              onChange={(e) => setTotalEstimado(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">Bs</InputAdornment>,
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Estado Inicial"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <MenuItem value="SUGERIDA">Sugerida por Almacén</MenuItem>
              <MenuItem value="APROBADA">Aprobada Directamente</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default NuevaCompraModal;
