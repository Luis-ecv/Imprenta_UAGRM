import React, { useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { Calculator, Layers, Check } from 'lucide-react';

import { Modal, Button } from '@/components/ui';
import { UAGRM_TOKENS } from '@/theme/tokens';
import { clientesApi } from '@/api/clientes.api';
import { tarifasApi, type TipoTrabajoResponse } from '@/api/tarifas.api';
import { proformasApi } from '@/api/proformas.api';
import type { ClienteResponse, Modalidad, ProformaResponse, ProformaCreate } from '@/types';
import { formatearMoneda } from '@/utils/formatters';
import { calcularCostosLitograficos } from '@/utils/calculoLitografico';

interface NuevaProformaModalProps {
  open: boolean;
  onClose: () => void;
  onProformaCreada: (proforma: ProformaResponse) => void;
}

export const NuevaProformaModal: React.FC<NuevaProformaModalProps> = ({
  open,
  onClose,
  onProformaCreada,
}) => {
  const [clientes, setClientes] = useState<ClienteResponse[]>([]);
  const [tiposTrabajo, setTiposTrabajo] = useState<TipoTrabajoResponse[]>([]);
  const [cargandoMaestros, setCargandoMaestros] = useState<boolean>(false);

  const [clienteId, setClienteId] = useState<number | ''>('');
  const [tipoTrabajoId, setTipoTrabajoId] = useState<number | ''>('');
  const [descripcionTrabajo, setDescripcionTrabajo] = useState<string>('');
  const [modalidad, setModalidad] = useState<Modalidad>('insumos_imprenta');
  const [tiraje, setTiraje] = useState<number>(1000);
  const [numeroPaginas, setNumeroPaginas] = useState<number>(64);
  const [diasVigencia, setDiasVigencia] = useState<number>(15);

  const [guardando, setGuardando] = useState<boolean>(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    async function cargarMaestros() {
      try {
        setCargandoMaestros(true);
        setErrorModal(null);
        const [resClientes, resTipos] = await Promise.all([
          clientesApi.listar({ por_pagina: 100 }),
          tarifasApi.listarTiposTrabajo(),
        ]);
        setClientes(resClientes.datos || []);
        setTiposTrabajo(resTipos || []);

        if (resClientes.datos?.length > 0) {
          setClienteId(resClientes.datos[0].id_cliente);
        }
        if (resTipos?.length > 0) {
          setTipoTrabajoId(resTipos[0].id_tipo_trabajo);
        }
      } catch {
        setErrorModal('Error al cargar clientes o tipos de trabajo.');
      } finally {
        setCargandoMaestros(false);
      }
    }

    cargarMaestros();
  }, [open]);

  // Cálculo técnico paramétrico
  const calculos = useMemo(
    () => calcularCostosLitograficos(modalidad, tiraje, numeroPaginas),
    [modalidad, tiraje, numeroPaginas]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId || !tipoTrabajoId || !descripcionTrabajo.trim()) {
      setErrorModal('Por favor completa todos los campos requeridos.');
      return;
    }

    try {
      setGuardando(true);
      setErrorModal(null);

      const payload: ProformaCreate = {
        cliente_id: Number(clienteId),
        modalidad,
        dias_vigencia: diasVigencia,
        detalles: [
          {
            descripcion_trabajo: descripcionTrabajo.trim(),
            tipo_trabajo_id: Number(tipoTrabajoId),
            tiraje: Number(tiraje),
            paginas_totales: Number(numeroPaginas),
            numero_paginas: Number(numeroPaginas),
            costo_papel: calculos.costoPapel,
            costo_tinta: calculos.costoTinta,
            costo_planchas: calculos.costoPlanchas,
            costo_mano_obra: calculos.costoManoObra,
            subtotal: calculos.total,
          },
        ],
      };

      const res = await proformasApi.crear(payload);
      onProformaCreada(res);
      onClose();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: unknown } } };
        const detail = axiosErr.response?.data?.detail;
        if (typeof detail === 'string') {
          setErrorModal(detail);
        } else if (Array.isArray(detail)) {
          const msgs = detail.map((d) =>
            typeof d === 'object' && d !== null && 'msg' in d ? (d as { msg: string }).msg : String(d)
          );
          setErrorModal(msgs.join(', ') || 'Error de validación en la proforma.');
        } else {
          setErrorModal('Error al emitir la proforma litográfica.');
        }
      } else {
        setErrorModal('Error al conectar con el servidor.');
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Nueva Proforma Litográfica"
      subtitle="Cálculo Oficial y Presupuesto Comercial"
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
            disabled={guardando || cargandoMaestros}
            isLoading={guardando}
            icon={<Check size={18} />}
            style={{ minWidth: 165 }}
          >
            Confirmar
          </Button>
        </>
      }
    >
      <Typography
        variant="body2"
        sx={{ color: UAGRM_TOKENS.colors.slate, mb: 2, fontSize: '0.85rem' }}
      >
        Cálculo técnico paramétrico oficial UAGRM según tiraje de ejemplares, pliegos y costos de taller.
      </Typography>

      {errorModal && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setErrorModal(null)}>
          {errorModal}
        </Alert>
      )}

      {/* Tarjeta de Cálculo Automático Litográfico */}
      <Box
        sx={{
          p: 2,
          mb: 2.5,
          borderRadius: 3,
          border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
          backgroundColor: UAGRM_TOKENS.colors.background.subtle,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 1.5,
            borderBottom: `1px solid ${UAGRM_TOKENS.border.subtle}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Calculator size={18} color={UAGRM_TOKENS.colors.ruby} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primaryDark }}>
              Cálculo Automático Litográfico
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Chip
              label={`${calculos.hojas} pliegos`}
              size="small"
              sx={{
                fontWeight: 700,
                backgroundColor: UAGRM_TOKENS.colors.background.paper,
                color: UAGRM_TOKENS.colors.charcoal,
                border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
              }}
            />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: UAGRM_TOKENS.colors.ruby,
                fontFamily: 'monospace',
              }}
            >
              {formatearMoneda(calculos.total)}
            </Typography>
          </Stack>
        </Box>

        <Grid container spacing={1.5} sx={{ pt: 1.5 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography
              variant="caption"
              sx={{ color: UAGRM_TOKENS.colors.slate, display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 700 }}
            >
              <Layers size={12} color={UAGRM_TOKENS.colors.ruby} /> Papel:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.charcoal, fontFamily: 'monospace' }}>
              {formatearMoneda(calculos.costoPapel)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.slate, fontWeight: 700, display: 'block' }}>
              Tinta CMYK:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.charcoal, fontFamily: 'monospace' }}>
              {formatearMoneda(calculos.costoTinta)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.slate, fontWeight: 700, display: 'block' }}>
              Planchas CTP (4):
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.charcoal, fontFamily: 'monospace' }}>
              {formatearMoneda(calculos.costoPlanchas)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.slate, fontWeight: 700, display: 'block' }}>
              Mano de Obra:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.charcoal, fontFamily: 'monospace' }}>
              {formatearMoneda(calculos.costoManoObra)}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {cargandoMaestros ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          <CircularProgress sx={{ color: UAGRM_TOKENS.colors.royalBlue, mb: 1.5 }} size={28} />
          <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.slate, fontWeight: 600 }}>
            Cargando catálogo de solicitantes y tipos de trabajo...
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              select
              required
              size="small"
              label="Cliente o Facultad Solicitante *"
              value={clienteId}
              onChange={(e) => setClienteId(Number(e.target.value))}
            >
              {clientes.map((c) => (
                <MenuItem key={c.id_cliente} value={c.id_cliente}>
                  {c.razon_social} ({c.tipo_cliente})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              select
              required
              size="small"
              label="Tipo de Trabajo Litográfico *"
              value={tipoTrabajoId}
              onChange={(e) => setTipoTrabajoId(Number(e.target.value))}
            >
              {tiposTrabajo.map((t) => (
                <MenuItem key={t.id_tipo_trabajo} value={t.id_tipo_trabajo}>
                  {t.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Descripción Detallada del Trabajo *"
              placeholder="Ej. Libro Académico 'Cálculo II' con tapa a color y anillado"
              value={descripcionTrabajo}
              onChange={(e) => setDescripcionTrabajo(e.target.value)}
            />
          </Grid>

          {/* Modalidad de Suministro */}
          <Grid size={{ xs: 12 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                color: UAGRM_TOKENS.colors.charcoal,
                display: 'block',
                textTransform: 'uppercase',
                mb: 1,
              }}
            >
              Modalidad de Suministro de Insumos *
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  onClick={() => setModalidad('insumos_imprenta')}
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    border: `2px solid ${
                      modalidad === 'insumos_imprenta'
                        ? UAGRM_TOKENS.colors.ruby
                        : UAGRM_TOKENS.border.subtle
                    }`,
                    backgroundColor:
                      modalidad === 'insumos_imprenta'
                        ? UAGRM_TOKENS.colors.status.error.light
                        : UAGRM_TOKENS.colors.background.paper,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': { borderColor: UAGRM_TOKENS.colors.ruby },
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 800,
                      color:
                        modalidad === 'insumos_imprenta'
                          ? UAGRM_TOKENS.colors.ruby
                          : UAGRM_TOKENS.colors.charcoal,
                    }}
                  >
                    Insumos de Imprenta
                  </Typography>
                  <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.slate, display: 'block', mt: 0.3 }}>
                    La Imprenta Universitaria provee el papel institucional.
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  onClick={() => setModalidad('insumos_cliente')}
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    border: `2px solid ${
                      modalidad === 'insumos_cliente'
                        ? UAGRM_TOKENS.colors.ruby
                        : UAGRM_TOKENS.border.subtle
                    }`,
                    backgroundColor:
                      modalidad === 'insumos_cliente'
                        ? UAGRM_TOKENS.colors.status.error.light
                        : UAGRM_TOKENS.colors.background.paper,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': { borderColor: UAGRM_TOKENS.colors.ruby },
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 800,
                      color:
                        modalidad === 'insumos_cliente'
                          ? UAGRM_TOKENS.colors.ruby
                          : UAGRM_TOKENS.colors.charcoal,
                    }}
                  >
                    Insumos del Cliente
                  </Typography>
                  <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.slate, display: 'block', mt: 0.3 }}>
                    Papel provisto por el cliente (costo papel 0.00 Bs).
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Parámetros: Tiraje, Páginas, Vigencia */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              required
              size="small"
              type="number"
              label="Tiraje (Ejemplares) *"
              value={tiraje}
              onChange={(e) => setTiraje(Math.max(1, parseInt(e.target.value) || 0))}
              slotProps={{ htmlInput: { min: 1 } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              required
              size="small"
              type="number"
              label="Número de Páginas *"
              value={numeroPaginas}
              onChange={(e) => setNumeroPaginas(Math.max(1, parseInt(e.target.value) || 0))}
              slotProps={{ htmlInput: { min: 1 } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              required
              size="small"
              type="number"
              label="Vigencia (Días) *"
              value={diasVigencia}
              onChange={(e) => setDiasVigencia(Math.max(1, parseInt(e.target.value) || 0))}
              slotProps={{ htmlInput: { min: 1, max: 90 } }}
            />
          </Grid>
        </Grid>
      )}
    </Modal>
  );
};

