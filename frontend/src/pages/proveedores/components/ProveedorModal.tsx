import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { Save } from 'lucide-react';

import { Modal, Button } from '@/components/ui';
import type { ProveedorResponse, ProveedorCreate, ProveedorUpdate } from '@/types';

interface ProveedorModalProps {
  open: boolean;
  proveedorEditando: ProveedorResponse | null;
  guardando: boolean;
  onClose: () => void;
  onSubmit: (datos: ProveedorCreate | ProveedorUpdate) => Promise<boolean>;
}

export const ProveedorModal: React.FC<ProveedorModalProps> = ({
  open,
  proveedorEditando,
  guardando,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<ProveedorCreate>({
    razon_social: '',
    nit: '',
    contacto: '',
    telefono: '',
    email: '',
    direccion: '',
  });

  const [errores, setErrores] = useState<{ razon_social?: string; nit?: string }>({});

  useEffect(() => {
    if (proveedorEditando) {
      setFormData({
        razon_social: proveedorEditando.razon_social || '',
        nit: proveedorEditando.nit || '',
        contacto: proveedorEditando.contacto || '',
        telefono: proveedorEditando.telefono || '',
        email: proveedorEditando.email || '',
        direccion: proveedorEditando.direccion || '',
      });
    } else {
      setFormData({
        razon_social: '',
        nit: '',
        contacto: '',
        telefono: '',
        email: '',
        direccion: '',
      });
    }
    setErrores({});
  }, [proveedorEditando, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errores[name as keyof typeof errores]) {
      setErrores((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleGuardar = async () => {
    const nuevosErrores: { razon_social?: string; nit?: string } = {};
    if (!formData.razon_social.trim()) {
      nuevosErrores.razon_social = 'La razón social es obligatoria.';
    }
    if (!formData.nit.trim()) {
      nuevosErrores.nit = 'El NIT es obligatorio.';
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    const exito = await onSubmit(formData);
    if (exito) {
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={proveedorEditando ? 'Editar Proveedor Autorizado' : 'Nuevo Proveedor de Suministros'}
      subtitle="Padrón institucional de distribuidores de insumos litográficos y repuestos"
      maxWidth="md"
      actions={
        <>
          <Button variant="outline" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button
            variant="default"
            onClick={handleGuardar}
            loading={guardando}
            icon={<Save size={16} />}
          >
            {proveedorEditando ? 'Actualizar Proveedor' : 'Guardar Proveedor'}
          </Button>
        </>
      }
    >
      <Box sx={{ pt: 1 }}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField
              fullWidth
              size="small"
              label="Razón Social / Empresa *"
              name="razon_social"
              value={formData.razon_social}
              onChange={handleChange}
              error={Boolean(errores.razon_social)}
              helperText={errores.razon_social}
              placeholder="Ej. Distribuidora Papelera Boliviana S.R.L."
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="NIT / Registro Tributario *"
              name="nit"
              value={formData.nit}
              onChange={handleChange}
              error={Boolean(errores.nit)}
              helperText={errores.nit}
              placeholder="Ej. 1028472023"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Persona de Contacto / Asesor Comercial"
              name="contacto"
              value={formData.contacto || ''}
              onChange={handleChange}
              placeholder="Ej. Lic. Carlos Mendoza"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Teléfono / Celular de Contacto"
              name="telefono"
              value={formData.telefono || ''}
              onChange={handleChange}
              placeholder="Ej. 70012345 / 3-3345678"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Correo Electrónico Institucional"
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange}
              placeholder="Ej. ventas@papeleraboliviana.com"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Dirección / Depósito Comercial"
              name="direccion"
              value={formData.direccion || ''}
              onChange={handleChange}
              placeholder="Ej. Parque Industrial Mz. 12, Santa Cruz"
            />
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default ProveedorModal;
