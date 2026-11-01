import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { Check } from 'lucide-react';

import { Modal, Button } from '@/components/ui';
import { UAGRM_TOKENS } from '@/theme/tokens';
import type { ClienteResponse } from '@/types';
import { TIPOS_CLIENTE_OPCIONES, type FormClienteData } from '@/hooks/useClientes';

interface ClienteModalProps {
  open: boolean;
  clienteEditando: ClienteResponse | null;
  guardando: boolean;
  onClose: () => void;
  onSubmit: (data: FormClienteData) => Promise<boolean>;
}

export const ClienteModal: React.FC<ClienteModalProps> = ({
  open,
  clienteEditando,
  guardando,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<FormClienteData>({
    razon_social: '',
    tipo_cliente: 'facultad',
    ci_nit: '',
    telefono: '',
    email: '',
    direccion: '',
    codigo_facultad: '',
    dependencia: '',
  });

  useEffect(() => {
    if (clienteEditando) {
      setFormData({
        razon_social: clienteEditando.razon_social || '',
        tipo_cliente: clienteEditando.tipo_cliente || 'particular',
        ci_nit: clienteEditando.ci_nit || clienteEditando.nit_ci || '',
        telefono: clienteEditando.telefono || '',
        email: clienteEditando.email || '',
        direccion: clienteEditando.direccion || '',
        codigo_facultad: clienteEditando.codigo_facultad || '',
        dependencia: clienteEditando.dependencia || '',
      });
    } else {
      setFormData({
        razon_social: '',
        tipo_cliente: 'facultad',
        ci_nit: '',
        telefono: '',
        email: '',
        direccion: '',
        codigo_facultad: '',
        dependencia: '',
      });
    }
  }, [clienteEditando, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={clienteEditando ? 'Editar Cliente' : 'Nuevo Cliente o Solicitante'}
      subtitle="Directorio Litográfico"
      maxWidth="md"
      isLoading={guardando}
      actions={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={guardando}
            style={{ minWidth: 125 }}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="default"
            disabled={guardando}
            isLoading={guardando}
            icon={<Check size={18} />}
            style={{ minWidth: 135 }}
          >
            Confirmar
          </Button>
        </>
      }
    >
      <Typography
        variant="body2"
        sx={{ color: UAGRM_TOKENS.colors.slate, mb: 2.5, fontSize: '0.85rem' }}
      >
        Complete los datos del solicitante institucional para cotizaciones, proformas y facturación litográfica.
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            select
            size="small"
            label="Tipo de Solicitante"
            value={formData.tipo_cliente}
            onChange={(e) =>
              setFormData({ ...formData, tipo_cliente: e.target.value as FormClienteData['tipo_cliente'] })
            }
          >
            {TIPOS_CLIENTE_OPCIONES.map((opt) => (
              <MenuItem key={opt.valor} value={opt.valor}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            required
            size="small"
            label="Razón Social / Nombre Completo"
            placeholder="Ej: Facultad de Ciencias de la Computación"
            value={formData.razon_social}
            onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="CI / NIT"
            placeholder="Ej: 8934521 SCZ / 102938475"
            value={formData.ci_nit}
            onChange={(e) => setFormData({ ...formData, ci_nit: e.target.value })}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Código de Facultad"
            placeholder="Ej: FICCT, FINOR, FCE, etc."
            value={formData.codigo_facultad}
            onChange={(e) => setFormData({ ...formData, codigo_facultad: e.target.value })}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Dependencia / Carrera / Dirección"
            placeholder="Ej: Dirección de Carrera Ingeniería Informática"
            value={formData.dependencia}
            onChange={(e) => setFormData({ ...formData, dependencia: e.target.value })}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Teléfono / Interno / Celular"
            placeholder="Ej: 3-3564789 / 76543210"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            type="email"
            label="Correo Electrónico"
            placeholder="solicitante@uagrm.edu.bo"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Dirección / Campus / Módulo"
            placeholder="Ej: Ciudad Universitaria Módulo 236"
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
          />
        </Grid>
      </Grid>
    </Modal>
  );
};
