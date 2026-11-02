import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { ArrowLeft, ShoppingCart, Check } from 'lucide-react';

import { comprasApi } from '@/api/compras.api';
import { Button } from '@/components/ui';
import { UAGRM_TOKENS } from '@/theme/tokens';
import type { ProveedorResponse } from '@/types';

export function CompraFormPage() {
  const navigate = useNavigate();

  const [proveedores, setProveedores] = useState<ProveedorResponse[]>([]);
  const [proveedorId, setProveedorId] = useState<number | ''>('');
  const [totalEstimado, setTotalEstimado] = useState<string>('1500');
  const [estado, setEstado] = useState<string>('SUGERIDA');

  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarProveedores() {
      try {
        setCargando(true);
        const data = await comprasApi.listarProveedores();
        setProveedores(data || []);
        if (data?.length > 0) {
          setProveedorId(data[0].id_proveedor);
        }
      } catch {
        setError('Error al cargar proveedores autorizados.');
      } finally {
        setCargando(false);
      }
    }
    cargarProveedores();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!proveedorId) return;

    try {
      setGuardando(true);
      await comprasApi.crear({
        proveedor_id: Number(proveedorId),
        total_estimado: parseFloat(totalEstimado) || 0,
        estado,
      });
      navigate('/compras');
    } catch {
      setError('Error al generar la orden de compra.');
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 2 }}>
        <CircularProgress size={32} sx={{ color: UAGRM_TOKENS.colors.ruby }} />
        <Typography sx={{ fontSize: '0.9rem', color: UAGRM_TOKENS.colors.slate, fontWeight: 600 }}>
          Cargando catálogo de proveedores autorizados...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <Button
        variant="ghost"
        component={Link}
        to="/compras"
        icon={<ArrowLeft size={16} />}
        style={{ marginBottom: 16 }}
      >
        Volver a órdenes de compra
      </Button>

      <Box
        sx={{
          borderRadius: `${UAGRM_TOKENS.radii.xl}px`,
          border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
          backgroundColor: UAGRM_TOKENS.colors.background.paper,
          p: { xs: 2.5, sm: 4 },
          boxShadow: UAGRM_TOKENS.shadows.card,
        }}
      >
        <Box sx={{ borderBottom: `1px solid ${UAGRM_TOKENS.border.subtle}`, pb: 2.5, mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: UAGRM_TOKENS.colors.primaryDark,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <ShoppingCart size={22} color={UAGRM_TOKENS.colors.ruby} />
            Generar Orden de Compra
          </Typography>
          <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, mt: 0.5 }}>
            Emisión de pedido de reposición para el almacén de la imprenta universitaria.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              select
              fullWidth
              size="small"
              label="Proveedor Autorizado *"
              value={proveedorId}
              onChange={(e) => setProveedorId(Number(e.target.value))}
            >
              {proveedores.map((p) => (
                <MenuItem key={p.id_proveedor} value={p.id_proveedor}>
                  {p.razon_social} {p.nit ? `(NIT: ${p.nit})` : ''}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              size="small"
              type="number"
              label="Monto Total Estimado (Bs) *"
              value={totalEstimado}
              onChange={(e) => setTotalEstimado(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">Bs</InputAdornment>,
                },
              }}
            />

            <TextField
              select
              fullWidth
              size="small"
              label="Estado Inicial de la Orden"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <MenuItem value="SUGERIDA">Sugerida por Almacén / Preventiva</MenuItem>
              <MenuItem value="APROBADA">Aprobada por Administración</MenuItem>
              <MenuItem value="ENVIADA">Enviada al Proveedor</MenuItem>
            </TextField>

            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', pt: 2 }}>
              <Button
                variant="outline"
                component={Link}
                to="/compras"
                disabled={guardando}
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                type="submit"
                loading={guardando}
                icon={<Check size={16} />}
              >
                Confirmar Emisión
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

export default CompraFormPage;
