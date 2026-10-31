import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import { authApi } from '@/api/auth.api';
import { setAccessToken } from '@/api/client';
import { useAuth } from '@/hooks/useAuth';
import { UAGRM_COLORS } from '@/theme/uagrmTheme';

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
      // 1. Iniciar sesión y obtener token JWT
      const tokenData = await authApi.login({ email, password });

      // 2. Establecer token temporal en memoria para consultar perfil
      setAccessToken(tokenData.access_token);

      // 3. Obtener perfil del usuario autenticado
      const perfilUsuario = await authApi.getMe();

      // 4. Actualizar estado global en AuthContext
      login(tokenData.access_token, perfilUsuario);

      // 5. Redireccionar según el rol oficial
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

  // Relleno rápido de credenciales de prueba
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
        backgroundColor: UAGRM_COLORS.background.default,
      }}
    >
      {/* =====================================================================
          PANEL IZQUIERDO: Fondo uagrm1.png con degradado institucional
          Logo central destacado + eslogan
          ===================================================================== */}
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
            linear-gradient(135deg, rgba(110, 0, 0, 0.88) 0%, rgba(20, 30, 55, 0.93) 100%),
            url('/uagrm1.png')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Contenido centrado: Logo de la imprenta + Eslogan */}
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
          {/* Tarjeta contenedora del logo institucional con sombra y efecto flotante */}
          {/* <Box
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: 4,
              p: { xs: 3, lg: 4 },
              mb: 4,
              boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.45)',
              },
            }}
          > */}
          {/* <Box
              component="img"
              src="/logo_imprenta.png"
              alt="Logo Editorial e Imprenta Universitaria UAGRM"
              sx={{
                width: { md: 260, lg: 320 },
                height: 'auto',
                display: 'block',
              }}
            />
          </Box> */}

          {/* Eslogan centrado */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              lineHeight: 1.25,
              color: '#ffffff',
              mb: 1.5,
              letterSpacing: '-0.01em',
            }}
          >
            Gestión Integral y Predicción de Insumos mediante Machine Learning
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.82)',
              fontSize: '1.05rem',
              lineHeight: 1.6,
              mb: 3,
            }}
          >
            Automatización litográfica institucional: presupuesta órdenes con precisión paramétrica,
            controla la producción en taller y optimiza compras de papel y tintas con modelos predictivos.
          </Typography>

          <Box
            sx={{
              width: 48,
              height: 3,
              borderRadius: 2,
              backgroundColor: UAGRM_COLORS.cyan.main,
              mb: 3,
            }}
          />

          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.65)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            {/* Universidad Autónoma Gabriel René Moreno &bull; 2026 */}
          </Typography>
        </Box>
      </Box>

      {/* =====================================================================
          PANEL DERECHO: Card de Login estilo Material UI
          Logo superior + Log in to your account + Inputs con iconos + Botón
          ===================================================================== */}
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
            borderRadius: 4,
            border: `1px solid ${UAGRM_COLORS.border}`,
            boxShadow: '0 20px 45px -10px rgba(30, 43, 77, 0.12)',
            backgroundColor: '#ffffff',
          }}
        >
          {/* Logo centrado en la parte superior del formulario */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
            <Box
              component="img"
              src="/logo_imprenta.png"
              alt="Logo Imprenta"
              sx={{
                height: 52,
                width: 'auto',
                display: 'block',
              }}
            />
          </Box>

          {/* Título centrado */}
          <Box sx={{ textAlign: 'center', mb: 3.5 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: 'secondary.main',
                mb: 0.5,
                fontSize: { xs: '1.4rem', sm: '1.55rem' },
              }}
            >
              Iniciar Sesión
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Ingresa tus credenciales para acceder al sistema
            </Typography>
          </Box>

          {/* Alerta de Error */}
          {errorMensaje && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {errorMensaje}
            </Alert>
          )}

          {/* Formulario */}
          <Box component="form" onSubmit={handleLogin} noValidate>
            <Stack spacing={2.5}>
              {/* Campo Correo Electrónico */}
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 0.8,
                  }}
                >
                  Correo electrónico
                </Typography>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@uagrm.edu.bo"
                  required
                  autoFocus
                  autoComplete="email"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon sx={{ color: UAGRM_COLORS.cyan.main, fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              {/* Campo Contraseña */}
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 0.8,
                  }}
                >
                  Contraseña
                </Typography>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon sx={{ color: UAGRM_COLORS.cyan.main, fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="alternar visibilidad de contraseña"
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

              {/* Recordar credenciales */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      size="small"
                      sx={{
                        color: 'text.secondary',
                        '&.Mui-checked': {
                          color: UAGRM_COLORS.blue.light,
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Recordar credenciales
                    </Typography>
                  }
                />
              </Box>

              {/* Botón de Iniciar Sesión */}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={isLoading}
                sx={{
                  py: 1.4,
                  fontSize: '0.98rem',
                  fontWeight: 700,
                  borderRadius: 50,
                  backgroundColor: UAGRM_COLORS.blue.main,
                  '&:hover': {
                    backgroundColor: UAGRM_COLORS.blue.dark,
                  },
                }}
              >
                {isLoading ? (
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <CircularProgress size={20} color="inherit" />
                    <span>Verificando credenciales...</span>
                  </Stack>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </Stack>
          </Box>

          {/* Accesos rápidos de prueba */}
          <Box sx={{ mt: 3.5, pt: 2.5, borderTop: `1px solid ${UAGRM_COLORS.border}` }}>
            <Divider sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Cuentas de prueba rápida
              </Typography>
            </Divider>

            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', mb: 1.2, textAlign: 'center' }}
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
                    fontWeight: 600,
                    backgroundColor: email === item.email ? UAGRM_COLORS.cyan.light : '#f1f5f9',
                    color: email === item.email ? UAGRM_COLORS.blue.dark : 'text.primary',
                    border: email === item.email ? `1px solid ${UAGRM_COLORS.cyan.main}` : '1px solid transparent',
                    '&:hover': {
                      backgroundColor: UAGRM_COLORS.cyan.light,
                      color: UAGRM_COLORS.blue.dark,
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