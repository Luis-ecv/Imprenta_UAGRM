import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import InputAdornment from '@mui/material/InputAdornment';
import { alpha } from '@mui/material/styles';
import {
  Users,
  Plus,
  Mail,
  ShieldCheck,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  X,
  Lock,
  UserCheck,
  Check,
} from 'lucide-react';

import { useUsuarios } from '@/hooks/useUsuarios';
import { Button, ConfirmDialog, SearchInput, KpiCard } from '@/components/ui';
import { UAGRM_TOKENS } from '@/theme/tokens';
import type { UsuarioResponse } from '@/types';
import { formatearFechaHora } from '@/utils/formatters';

export function UsuariosPage() {
  const {
    usuarios,
    roles,
    cargando,
    guardando,
    eliminando,
    error,
    busqueda,
    setBusqueda,
    usuariosFiltrados,
    totalActivos,
    totalOperadores,
    notificacion,
    setNotificacion,
    cargarDatos,
    guardarUsuario,
    desactivarUsuario,
  } = useUsuarios();

  // Estados locales de los diálogos
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioResponse | null>(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<UsuarioResponse | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState<{
    nombre_completo: string;
    email: string;
    rol_id: number;
    password: string;
    activo: boolean;
  }>({
    nombre_completo: '',
    email: '',
    rol_id: 3,
    password: '',
    activo: true,
  });

  const abrirModalCrear = () => {
    setUsuarioEditando(null);
    setFormData({
      nombre_completo: '',
      email: '',
      rol_id: roles.length > 0 ? roles[0].id_rol : 3,
      password: '',
      activo: true,
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (u: UsuarioResponse) => {
    setUsuarioEditando(u);
    setFormData({
      nombre_completo: u.nombre_completo || '',
      email: u.email || '',
      rol_id: u.rol_id,
      password: '',
      activo: u.activo ?? true,
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    if (!guardando) {
      setModalAbierto(false);
      setUsuarioEditando(null);
    }
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre_completo.trim() || !formData.email.trim()) {
      setNotificacion({
        tipo: 'error',
        mensaje: 'El nombre completo y correo electrónico son obligatorios.',
      });
      return;
    }

    if (!usuarioEditando && !formData.password.trim()) {
      setNotificacion({
        tipo: 'error',
        mensaje: 'Debe ingresar una contraseña para el nuevo usuario.',
      });
      return;
    }

    const exito = await guardarUsuario(usuarioEditando?.id_usuario, formData);
    if (exito) {
      cerrarModal();
    }
  };

  const handleConfirmarDesactivacion = async () => {
    if (!usuarioAEliminar) return;
    const exito = await desactivarUsuario(usuarioAEliminar.id_usuario);
    if (exito) {
      setUsuarioAEliminar(null);
    }
  };

  const obtenerColorRol = (nombreRol?: string) => {
    switch (nombreRol) {
      case 'Superadministrador':
        return { color: UAGRM_TOKENS.colors.secondary.main, bg: alpha(UAGRM_TOKENS.colors.secondary.main, 0.1) };
      case 'Administrador':
        return { color: UAGRM_TOKENS.colors.primary.main, bg: alpha(UAGRM_TOKENS.colors.primary.main, 0.1) };
      case 'Operador Mostrador':
        return { color: UAGRM_TOKENS.colors.accent.dark, bg: alpha(UAGRM_TOKENS.colors.accent.main, 0.15) };
      case 'Operador Taller':
        return { color: '#0d9488', bg: alpha('#0d9488', 0.1) };
      default:
        return { color: UAGRM_TOKENS.colors.text.leadHeader, bg: '#f1f5f9' };
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 }, backgroundColor: UAGRM_TOKENS.colors.background.default, minHeight: '100%' }}>
      {/* 1. Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3.5 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: UAGRM_TOKENS.typography.weights.extraBold,
              color: UAGRM_TOKENS.colors.primary.dark,
              letterSpacing: '-0.02em',
              mb: 0.5,
            }}
          >
            Usuarios del Sistema
          </Typography>
          <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.text.secondary, fontSize: '0.925rem' }}>
            Administración de credenciales, roles operativos y estados de cuenta de la Imprenta Universitaria.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            onClick={cargarDatos}
            disabled={cargando}
            startIcon={<RefreshCw size={16} className={cargando ? 'animate-spin' : ''} />}
            sx={{ color: UAGRM_TOKENS.colors.text.leadHeader }}
          >
            Actualizar
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<Plus size={18} />}
            onClick={abrirModalCrear}
          >
            Nuevo Usuario
          </Button>
        </Stack>
      </Box>

      {/* 2. Tarjetas KPI Reutilizables */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            title="Cuentas Registradas"
            value={usuarios.length}
            icon={<Users size={24} />}
            color="primary"
            isLoading={cargando}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            title="Usuarios Habilitados"
            value={totalActivos}
            icon={<UserCheck size={24} />}
            color="success"
            isLoading={cargando}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            title="Operadores de Imprenta"
            value={totalOperadores}
            icon={<ShieldCheck size={24} />}
            color="accent"
            isLoading={cargando}
          />
        </Grid>
      </Grid>

      {/* 3. Buscador Reutilizable */}
      <Card
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${UAGRM_TOKENS.colors.border.default}`,
          backgroundColor: '#ffffff',
        }}
      >
        <SearchInput
          placeholder="Buscar usuario por nombre, correo institucional o rol..."
          value={busqueda}
          onChange={setBusqueda}
          countLabel={`${usuariosFiltrados.length} Usuarios`}
          maxWidth="100%"
        />
      </Card>

      {/* 4. Notificaciones de error de carga */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* 5. Cuadrícula de Usuarios */}
      {cargando ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <CircularProgress sx={{ color: UAGRM_TOKENS.colors.secondary.main, mb: 2 }} />
          <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.text.secondary, fontWeight: 600 }}>
            Sincronizando cuentas institucionales...
          </Typography>
        </Box>
      ) : usuariosFiltrados.length === 0 ? (
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
            backgroundColor: '#ffffff',
            borderRadius: 3,
            border: `1px dashed ${UAGRM_TOKENS.colors.border.default}`,
          }}
        >
          <Users size={42} color={UAGRM_TOKENS.colors.text.muted} style={{ marginBottom: 12 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: UAGRM_TOKENS.colors.text.primary }}>
            No se encontraron usuarios
          </Typography>
          <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.text.secondary, maxWidth: 400, mx: 'auto', mt: 0.5, mb: 2.5 }}>
            {busqueda
              ? 'No hay registros que coincidan con la búsqueda.'
              : 'Registre nuevos operadores o jefes de taller para gestionar la imprenta.'}
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Plus size={16} />}
            onClick={abrirModalCrear}
          >
            Registrar Primer Usuario
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {usuariosFiltrados.map((u) => {
            const nombreRol = u.rol?.nombre;
            const estiloRol = obtenerColorRol(nombreRol);

            return (
              <Grid key={u.id_usuario} size={{ xs: 12, md: 6, lg: 4 }}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${UAGRM_TOKENS.colors.border.default}`,
                    backgroundColor: '#ffffff',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: UAGRM_TOKENS.shadows.card,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: UAGRM_TOKENS.shadows.cardHover,
                      borderColor: alpha(UAGRM_TOKENS.colors.primary.main, 0.3),
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            backgroundColor: estiloRol.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: estiloRol.color,
                            fontWeight: 800,
                            fontSize: '1.05rem',
                          }}
                        >
                          {u.nombre_completo.charAt(0).toUpperCase()}
                        </Box>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.text.primary, lineHeight: 1.2 }}>
                            {u.nombre_completo}
                          </Typography>
                          <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.text.muted }}>
                            ID #{u.id_usuario}
                          </Typography>
                        </Box>
                      </Box>

                      <Chip
                        icon={u.activo ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        label={u.activo ? 'Activo' : 'Inactivo'}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          borderRadius: UAGRM_TOKENS.radii.pill,
                          backgroundColor: u.activo ? UAGRM_TOKENS.colors.status.success.light : UAGRM_TOKENS.colors.status.error.light,
                          color: u.activo ? UAGRM_TOKENS.colors.status.success.dark : UAGRM_TOKENS.colors.status.error.dark,
                        }}
                      />
                    </Box>

                    <Stack spacing={1.2} sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: UAGRM_TOKENS.colors.text.leadHeader, fontSize: '0.85rem' }}>
                        <Mail size={15} color={UAGRM_TOKENS.colors.text.muted} />
                        <Typography variant="body2" sx={{ fontSize: '0.85rem', color: UAGRM_TOKENS.colors.text.primary, fontWeight: 600 }}>
                          {u.email}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ShieldCheck size={15} color={UAGRM_TOKENS.colors.text.muted} />
                        <Chip
                          label={nombreRol || `Rol #${u.rol_id}`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            borderRadius: UAGRM_TOKENS.radii.pill,
                            backgroundColor: estiloRol.bg,
                            color: estiloRol.color,
                          }}
                        />
                      </Box>

                      {u.ultimo_acceso && (
                        <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.text.muted, display: 'block', pt: 0.5 }}>
                          Último ingreso: {formatearFechaHora(u.ultimo_acceso)}
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>

                  <Box
                    sx={{
                      p: 1.5,
                      px: 2.5,
                      backgroundColor: UAGRM_TOKENS.colors.background.subtle,
                      borderTop: `1px solid ${UAGRM_TOKENS.colors.border.default}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 1,
                    }}
                  >
                    <Button
                      size="small"
                      variant="text"
                      startIcon={<Edit2 size={14} />}
                      onClick={() => abrirModalEditar(u)}
                      sx={{ color: UAGRM_TOKENS.colors.primary.main, fontSize: '0.8rem' }}
                    >
                      Editar
                    </Button>
                    {u.activo && (
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<Trash2 size={14} />}
                        onClick={() => setUsuarioAEliminar(u)}
                        sx={{ color: UAGRM_TOKENS.colors.status.error.main, fontSize: '0.8rem' }}
                      >
                        Desactivar
                      </Button>
                    )}
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* 6. Modal de Registro y Edición */}
      <Dialog
        open={modalAbierto}
        onClose={cerrarModal}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3.5,
              p: 1,
              boxShadow: UAGRM_TOKENS.shadows.modal,
            },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3, position: 'relative', textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: UAGRM_TOKENS.colors.primary.main, fontSize: '1.5rem', mb: 0.5 }}>
            {usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: UAGRM_TOKENS.colors.text.secondary, fontSize: '0.875rem' }}>
            Control de Accesos y Seguridad
          </Typography>
          <IconButton onClick={cerrarModal} disabled={guardando} size="small" sx={{ position: 'absolute', right: 16, top: 16, color: UAGRM_TOKENS.colors.text.muted }}>
            <X size={18} />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleGuardar}>
          <DialogContent sx={{ px: 2.5, py: 1.5 }}>
            <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.text.secondary, mb: 2.5, fontSize: '0.85rem' }}>
              Configure los datos de acceso y el nivel de autorización correspondiente en la plataforma.
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  required
                  size="small"
                  label="Nombre Completo"
                  placeholder="Ej: Lic. Walter Justiniano"
                  value={formData.nombre_completo}
                  onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  required
                  size="small"
                  type="email"
                  label="Correo Electrónico Institucional"
                  placeholder="w.justiniano@uagrm.edu.bo"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Rol Asignado"
                  value={formData.rol_id}
                  onChange={(e) => setFormData({ ...formData, rol_id: Number(e.target.value) })}
                >
                  {roles.map((r) => (
                    <MenuItem key={r.id_rol} value={r.id_rol}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {r.nombre}
                        </Typography>
                        {r.descripcion && (
                          <Typography variant="caption" sx={{ color: UAGRM_TOKENS.colors.text.secondary, display: 'block' }}>
                            {r.descripcion}
                          </Typography>
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="password"
                  required={!usuarioEditando}
                  label={usuarioEditando ? 'Nueva Contraseña (opcional)' : 'Contraseña de Acceso'}
                  placeholder={usuarioEditando ? 'Dejar en blanco para mantener la actual' : 'Mínimo 8 caracteres'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={16} color={UAGRM_TOKENS.colors.text.muted} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 600, color: UAGRM_TOKENS.colors.text.primary }}>
                      Cuenta Activa y Habilitada para Iniciar Sesión
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, pt: 2, borderTop: `1px solid ${UAGRM_TOKENS.colors.border.default}`, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={cerrarModal}
              disabled={guardando}
              sx={{ px: 3.5, color: UAGRM_TOKENS.colors.text.leadHeader }}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={guardando}
              isLoading={guardando}
              endIcon={!guardando ? <Check size={18} /> : undefined}
              sx={{ px: 3.5, minWidth: 160 }}
            >
              Confirmar
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* 7. Diálogo Reutilizable de Confirmación de Desactivación */}
      <ConfirmDialog
        open={Boolean(usuarioAEliminar)}
        onClose={() => setUsuarioAEliminar(null)}
        onConfirm={handleConfirmarDesactivacion}
        title="¿Desactivar Usuario?"
        description={`Se deshabilitará el acceso de ${usuarioAEliminar?.nombre_completo} (${usuarioAEliminar?.email}). Esta acción puede ser revertida editando el estado de la cuenta.`}
        confirmText="Sí, Desactivar"
        cancelText="Cancelar"
        isDestructive
        isLoading={eliminando}
      />

      {/* 8. Snackbar de retroalimentación */}
      <Snackbar
        open={Boolean(notificacion)}
        autoHideDuration={4000}
        onClose={() => setNotificacion(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {notificacion ? (
          <Alert
            severity={notificacion.tipo}
            onClose={() => setNotificacion(null)}
            sx={{ width: '100%', borderRadius: 2 }}
          >
            {notificacion.mensaje}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}

export default UsuariosPage;
