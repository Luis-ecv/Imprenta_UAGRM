import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import { Save } from 'lucide-react';

import { Modal, Button } from '@/components/ui';
import type { TarifaResponse, TarifaCreate } from '@/api/tarifas.api';

interface TarifaModalProps {
  open: boolean;
  tarifaEditando: TarifaResponse | null;
  guardando: boolean;
  onClose: () => void;
  onSubmit: (datos: TarifaCreate | Partial<TarifaResponse>) => Promise<boolean>;
}

export const TarifaModal: React.FC<TarifaModalProps> = ({
  open,
  tarifaEditando,
  guardando,
  onClose,
  onSubmit,
}) => {
  const [concepto, setConcepto] = useState('');
  const [tipoTarifa, setTipoTarifa] = useState('Tirada Offset');
  const [precioUnitario, setPrecioUnitario] = useState<number>(0);
  const [unidad, setUnidad] = useState('Millar');
  const [vigenciaHasta, setVigenciaHasta] = useState('2026-12-31');
  const [errores, setErrores] = useState<{ concepto?: string; precio?: string }>({});

  useEffect(() => {
    if (open) {
      if (tarifaEditando) {
        setConcepto(tarifaEditando.concepto || '');
        setTipoTarifa(tarifaEditando.tipo_tarifa || 'Tirada Offset');
        setPrecioUnitario(Number(tarifaEditando.costo_unitario ?? tarifaEditando.precio_unitario ?? 0));
        setUnidad(tarifaEditando.unidad || 'Millar');
        setVigenciaHasta(tarifaEditando.vigencia_hasta?.split('T')[0] || '2026-12-31');
      } else {
        setConcepto('');
        setTipoTarifa('Tirada Offset');
        setPrecioUnitario(0);
        setUnidad('Millar');
        setVigenciaHasta('2026-12-31');
      }
      setErrores({});
    }
  }, [open, tarifaEditando]);

  const handleSubmit = async () => {
    const nuevosErrores: { concepto?: string; precio?: string } = {};
    if (!concepto.trim()) {
      nuevosErrores.concepto = 'El concepto de la tarifa es obligatorio.';
    }
    if (precioUnitario <= 0) {
      nuevosErrores.precio = 'El precio o costo unitario debe ser mayor a 0.';
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    let exito = false;
    if (tarifaEditando) {
      exito = await onSubmit({
        concepto: concepto.trim(),
        tipo_tarifa: tipoTarifa,
        costo_unitario: Number(precioUnitario),
        precio_unitario: Number(precioUnitario),
        unidad,
        vigencia_hasta: vigenciaHasta,
      });
    } else {
      exito = await onSubmit({
        concepto: concepto.trim(),
        precio_unitario: Number(precioUnitario),
        tipo_tarifa: tipoTarifa,
        vigencia_hasta: vigenciaHasta,
      } as TarifaCreate);
    }

    if (exito) {
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tarifaEditando ? 'Actualizar Arancel Litográfico' : 'Registrar Nueva Tarifa Oficial'}
      subtitle="Tarifario y costos de mano de obra, maquinaria e impresión de la imprenta UAGRM"
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
            icon={<Save size={16} />}
          >
            {tarifaEditando ? 'Actualizar Tarifa' : 'Guardar Tarifa'}
          </Button>
        </>
      }
    >
      <Box sx={{ pt: 1 }}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              size="small"
              label="Concepto / Servicio Litográfico *"
              value={concepto}
              onChange={(e) => {
                setConcepto(e.target.value);
                if (errores.concepto) setErrores((prev) => ({ ...prev, concepto: undefined }));
              }}
              error={Boolean(errores.concepto)}
              helperText={errores.concepto}
              placeholder="Ej. Tirada Offset Pliego Completo (4 Colores)"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Categoría de Operación"
              value={tipoTarifa}
              onChange={(e) => setTipoTarifa(e.target.value)}
            >
              <MenuItem value="Tirada Offset">Tirada Offset</MenuItem>
              <MenuItem value="Guillotina y Corte">Guillotina y Corte</MenuItem>
              <MenuItem value="Acabado y Encuadernación">Acabado y Encuadernación</MenuItem>
              <MenuItem value="Diseño y CTP">Diseño y CTP</MenuItem>
              <MenuItem value="Barnizado y Plastificado">Barnizado y Plastificado</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Unidad de Medida"
              value={unidad}
              onChange={(e) => setUnidad(e.target.value)}
            >
              <MenuItem value="Millar">Millar</MenuItem>
              <MenuItem value="Hora">Hora</MenuItem>
              <MenuItem value="Pieza">Pieza</MenuItem>
              <MenuItem value="Pliego">Pliego</MenuItem>
              <MenuItem value="Pase">Pase</MenuItem>
              <MenuItem value="Ciento">Ciento</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Costo / Precio Unitario (Bs) *"
              value={precioUnitario}
              onChange={(e) => {
                setPrecioUnitario(parseFloat(e.target.value) || 0);
                if (errores.precio) setErrores((prev) => ({ ...prev, precio: undefined }));
              }}
              error={Boolean(errores.precio)}
              helperText={errores.precio}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">Bs</InputAdornment>,
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Vigencia Hasta"
              value={vigenciaHasta}
              onChange={(e) => setVigenciaHasta(e.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default TarifaModal;

