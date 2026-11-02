import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { LogIn } from 'lucide-react';

import { authApi } from '@/api/auth.api';
import { setAccessToken } from '@/api/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui';
import { UAGRM_TOKENS } from '@/theme/tokens';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMensaje(null);

    try {
      const tokenData = await authApi.login({ email, password });
      setAccessToken(tokenData.access_token);
      const perfilUsuario = await authApi.getMe();
      login(tokenData.access_token, perfilUsuario);

      switch (perfilUsuario.rol) {
        case 'Operador Taller':
          navigate('/ordenes', { replace: true });
          break;
        case 'Operador Mostrador':
          navigate('/proformas', { replace: true });
          break;
        case 'Cliente':
          navigate('/proformas', { replace: true });
          break;
        default:
          navigate('/dashboard', { replace: true });
          break;
      }
    } catch (err: unknown) {
      setAccessToken(null);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } };
        setErrorMensaje(
          axiosErr.response?.data?.detail || 'Credenciales incorrectas o usuario inactivo.'
        );
      } else {
        setErrorMensaje(
          'Error de conexión con el servidor. Verifica que el backend esté activo.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleQuickFill(testEmail: string) {
    setEmail(testEmail);
    setPassword('Uagrm2026*');
    setErrorMensaje(null);
  }

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: UAGRM_TOKENS.background.default,
      }}
    >
      {/* Panel Izquierdo Institucional */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: { md: '0 0 50%', lg: '0 0 52%' },
          position: 'relative',
          overflow: 'hidden',
          p: { md: 6, lg: 8 },
          textAlign: 'center',
          color: '#ffffff',
          backgroundImage: `
            linear-gradient(135deg, rgba(128, 0, 0, 0.90) 0%, rgba(30, 43, 77, 0.94) 100%),
            url('/uagrm1.png')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: 520,
            zIndex: 2,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              lineHeight: 1.25,
              color: '#ffffff',
              mb: 1.5,
              letterSpacing: '-0.02em',
            }}
          >
            Gestión Integral y Predicción Litográfica con Machine Learning
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: '1rem',
              lineHeight: 1.6,
              mb: 3,
            }}
          >
            Editorial e Imprenta Universitaria UAGRM. Automatización de cotizaciones por pliegos, control de producción en taller y planificación de compras preventivas.
          </Typography>

          <Box
            sx={{
              width: 50,
              height: 3,
              borderRadius: 2,
              backgroundColor: UAGRM_TOKENS.colors.cyan,
              mb: 3,
            }}
          />

          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Universidad Autónoma Gabriel René Moreno
          </Typography>
        </Box>
      </Box>

      {/* Panel Derecho: Formulario de Autenticación */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2.5, sm: 4, md: 6 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 440,
            p: { xs: 3.5, sm: 5 },
            borderRadius: `${UAGRM_TOKENS.radii.xl}px`,
            border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
            boxShadow: UAGRM_TOKENS.shadows.card,
            backgroundColor: UAGRM_TOKENS.colors.background.paper,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
            <Box
              component="img"
              src="/logo_imprenta.png"
              alt="Logo Imprenta UAGRM"
              sx={{ height: 52, width: 'auto', display: 'block' }}
            />
          </Box>

          <Box sx={{ textAlign: 'center', mb: 3.5 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: UAGRM_TOKENS.colors.primaryDark,
                mb: 0.5,
                fontSize: { xs: '1.4rem', sm: '1.55rem' },
              }}
            >
              Iniciar Sesión
            </Typography>
            <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate }}>
              Ingresa tus credenciales para acceder al sistema
            </Typography>
          </Box>

          {errorMensaje && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {errorMensaje}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin} noValidate>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 650, color: UAGRM_TOKENS.colors.charcoal, mb: 0.8 }}>
                  Correo electrónico institucional
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@uagrm.edu.bo"
                  required
                  autoFocus
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 650, color: UAGRM_TOKENS.colors.charcoal, mb: 0.8 }}>
                  Contraseña de acceso
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: 18 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      size="small"
                      sx={{
                        color: UAGRM_TOKENS.colors.slate,
                        '&.Mui-checked': {
                          color: UAGRM_TOKENS.colors.primaryDark,
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, fontSize: '0.85rem' }}>
                      Recordar credenciales
                    </Typography>
                  }
                />
              </Box>

              <Button
                type="submit"
                variant="default"
                fullWidth
                loading={isLoading}
                icon={<LogIn size={18} />}
                style={{ padding: '10px 0' }}
              >
                Iniciar Sesión
              </Button>
            </Stack>
          </Box>

          {/* Accesos rápidos de prueba */}
          <Box sx={{ mt: 3.5, pt: 2.5, borderTop: `1px solid ${UAGRM_TOKENS.border.subtle}` }}>
            <Divider sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.slate, fontWeight: 700 }}>
                Cuentas de prueba rápida
              </Typography>
            </Divider>

            <Typography
              variant="caption"
              sx={{ color: UAGRM_TOKENS.colors.slate, display: 'block', mb: 1.2, textAlign: 'center' }}
            >
              Selecciona un rol para autocompletar:
            </Typography>

            <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
              {[
                { label: 'Superadmin', email: 'superadmin@uagrm.edu.bo' },
                { label: 'Admin (Jefe)', email: 'administrador@uagrm.edu.bo' },
                { label: 'Mostrador', email: 'mostrador@uagrm.edu.bo' },
                { label: 'Taller', email: 'taller@uagrm.edu.bo' },
              ].map((item) => (
                <Chip
                  key={item.label}
                  label={item.label}
                  size="small"
                  onClick={() => handleQuickFill(item.email)}
                  sx={{
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 650,
                    backgroundColor: email === item.email ? UAGRM_TOKENS.colors.background.subtle : UAGRM_TOKENS.colors.background.paper,
                    color: email === item.email ? UAGRM_TOKENS.colors.primaryDark : UAGRM_TOKENS.colors.charcoal,
                    border: `1px solid ${email === item.email ? UAGRM_TOKENS.colors.primaryDark : UAGRM_TOKENS.border.subtle}`,
                    '&:hover': {
                      backgroundColor: UAGRM_TOKENS.colors.background.subtle,
                      borderColor: UAGRM_TOKENS.colors.primaryDark,
                    },
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default LoginPage;
