import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { ArrowLeft, ShieldCheck, Check } from 'lucide-react';

import { usuariosApi } from '@/api/usuarios.api';
import { Button } from '@/components/ui';
import { UAGRM_TOKENS } from '@/theme/tokens';
import type { RolResponse } from '@/types';

export function UsuarioFormPage() {
  const navigate = useNavigate();

  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rolId, setRolId] = useState<number | ''>('');
  const [roles, setRoles] = useState<RolResponse[]>([]);

  const [guardando, setGuardando] = useState(false);
  const [cargandoRoles, setCargandoRoles] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarRoles() {
      try {
        setCargandoRoles(true);
        const data = await usuariosApi.listarRoles();
        setRoles(data || []);
        if (data?.length > 0) {
          setRolId(data[0].id_rol);
        }
      } catch {
        setError('Error al cargar la lista de roles del sistema.');
      } finally {
        setCargandoRoles(false);
      }
    }
    cargarRoles();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!rolId) return;

    try {
      setGuardando(true);
      setError(null);
      await usuariosApi.crear({
        nombre_completo: nombreCompleto,
        email,
        password,
        rol_id: Number(rolId),
        activo: true,
      });
      navigate('/administracion/usuarios');
    } catch {
      setError('Error al registrar el nuevo usuario institucional.');
    } finally {
      setGuardando(false);
    }
  }

  if (cargandoRoles) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 2 }}>
        <CircularProgress size={32} sx={{ color: UAGRM_TOKENS.colors.ruby }} />
        <Typography sx={{ fontSize: '0.9rem', color: UAGRM_TOKENS.colors.slate, fontWeight: 600 }}>
          Cargando roles del sistema institucional...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <Button
        variant="ghost"
        component={Link}
        to="/administracion/usuarios"
        icon={<ArrowLeft size={16} />}
        style={{ marginBottom: 16 }}
      >
        Volver a gestión de usuarios
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
            <ShieldCheck size={22} color={UAGRM_TOKENS.colors.ruby} />
            Registrar Usuario Institucional
          </Typography>
          <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, mt: 0.5 }}>
            Alta de cuenta de usuario con credenciales seguras y perfil de permisos RBAC.
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
              fullWidth
              size="small"
              required
              label="Nombre Completo *"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              placeholder="Ej. Ing. Juan Pérez Morales"
            />

            <TextField
              fullWidth
              size="small"
              required
              type="email"
              label="Correo Electrónico Institucional *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej. jperez@uagrm.edu.bo"
            />

            <TextField
              fullWidth
              size="small"
              required
              type="password"
              label="Contraseña de Acceso *"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres alfanuméricos"
            />

            <TextField
              select
              fullWidth
              size="small"
              required
              label="Rol de Acceso RBAC *"
              value={rolId}
              onChange={(e) => setRolId(Number(e.target.value))}
            >
              {roles.map((r) => (
                <MenuItem key={r.id_rol} value={r.id_rol}>
                  {r.nombre} {r.descripcion ? `— ${r.descripcion}` : ''}
                </MenuItem>
              ))}
            </TextField>

            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', pt: 2 }}>
              <Button
                variant="outline"
                component={Link}
                to="/administracion/usuarios"
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
                Registrar Usuario
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

export default UsuarioFormPage;
