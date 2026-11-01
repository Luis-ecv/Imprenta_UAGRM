import { useState, useEffect, useCallback, useMemo } from 'react';
import { usuariosApi } from '@/api/usuarios.api';
import type { UsuarioResponse, RolResponse, UsuarioCreate, UsuarioUpdate } from '@/types';

/**
 * Custom Hook: useUsuarios
 * Patrón Container / View: Encapsula la lógica de sincronización, filtrado,
 * creación, edición y baja de usuarios institucionales de la Imprenta UAGRM.
 */
export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([]);
  const [roles, setRoles] = useState<RolResponse[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [eliminando, setEliminando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState<string>('');
  const [notificacion, setNotificacion] = useState<{ tipo: 'success' | 'error'; mensaje: string } | null>(null);

  // Sincronización con el backend
  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError(null);

    // 1. Cargar roles reales desde PostgreSQL
    try {
      const listaRoles = await usuariosApi.listarRoles();
      setRoles(listaRoles || []);
    } catch (errRoles) {
      console.error('Error al cargar roles del servidor:', errRoles);
    }

    // 2. Cargar lista de usuarios
    try {
      const resUsuarios = await usuariosApi.listar({ por_pagina: 100 });
      setUsuarios(resUsuarios.datos || []);
    } catch (errUsuarios: unknown) {
      const axiosErr = errUsuarios as { response?: { status?: number; data?: { detail?: string } } };
      const status = axiosErr.response?.status;
      const detail = axiosErr.response?.data?.detail;
      if (status === 403) {
        setError('Acceso restringido (403): Tu cuenta requiere rol Administrador o Superadministrador para ver los usuarios.');
      } else if (status === 500) {
        setError(`Error 500 en el servidor al consultar usuarios: ${detail || 'Relación no precargada'}.`);
      } else {
        setError(detail || 'Error al sincronizar cuentas de usuario institucional desde el servidor.');
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Crear o actualizar usuario
  const guardarUsuario = async (
    id_usuario: number | undefined,
    data: { nombre_completo: string; email: string; rol_id: number; password?: string; activo: boolean }
  ): Promise<boolean> => {
    try {
      setGuardando(true);
      if (id_usuario) {
        const payload: UsuarioUpdate = {
          nombre_completo: data.nombre_completo.trim(),
          email: data.email.trim(),
          rol_id: data.rol_id,
          activo: data.activo,
        };
        if (data.password && data.password.trim()) {
          payload.password = data.password.trim();
        }
        await usuariosApi.actualizar(id_usuario, payload);
        setNotificacion({
          tipo: 'success',
          mensaje: 'Usuario institucional actualizado con éxito.',
        });
      } else {
        const payload: UsuarioCreate = {
          nombre_completo: data.nombre_completo.trim(),
          email: data.email.trim(),
          rol_id: data.rol_id,
          activo: data.activo,
          password: data.password ? data.password.trim() : '',
        };
        await usuariosApi.crear(payload);
        setNotificacion({
          tipo: 'success',
          mensaje: 'Usuario institucional registrado exitosamente.',
        });
      }
      await cargarDatos();
      return true;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { detail?: string | { msg: string }[] } } };
      let detalle = 'Ocurrió un error al guardar la cuenta de usuario en el servidor.';
      if (axiosErr.response?.status === 403) {
        detalle = 'Acceso denegado (403): Solo el rol Superadministrador tiene autorización para crear o modificar usuarios.';
      } else if (typeof axiosErr.response?.data?.detail === 'string') {
        detalle = axiosErr.response.data.detail;
      } else if (Array.isArray(axiosErr.response?.data?.detail)) {
        detalle = axiosErr.response.data.detail.map((d) => (typeof d === 'string' ? d : d.msg)).join(' | ');
      }
      setNotificacion({
        tipo: 'error',
        mensaje: detalle,
      });
      return false;
    } finally {
      setGuardando(false);
    }
  };

  // Desactivar usuario (baja lógica)
  const desactivarUsuario = async (id_usuario: number): Promise<boolean> => {
    try {
      setEliminando(true);
      await usuariosApi.eliminar(id_usuario);
      setNotificacion({
        tipo: 'success',
        mensaje: 'Usuario desactivado exitosamente.',
      });
      await cargarDatos();
      return true;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { detail?: string } } };
      let detalle = 'Ocurrió un error al desactivar la cuenta de usuario.';
      if (axiosErr.response?.status === 403) {
        detalle = 'Acceso denegado (403): Solo el rol Superadministrador puede dar de baja usuarios.';
      } else if (typeof axiosErr.response?.data?.detail === 'string') {
        detalle = axiosErr.response.data.detail;
      }
      setNotificacion({
        tipo: 'error',
        mensaje: detalle,
      });
      return false;
    } finally {
      setEliminando(false);
    }
  };

  // Filtrado reactivo en memoria
  const usuariosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return usuarios;
    return usuarios.filter((u) => {
      const nombreRol = u.rol?.nombre?.toLowerCase() || '';
      return (
        u.nombre_completo.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        nombreRol.includes(q)
      );
    });
  }, [usuarios, busqueda]);

  // Métricas litográficas
  const totalActivos = useMemo(() => usuarios.filter((u) => u.activo).length, [usuarios]);
  const totalOperadores = useMemo(() => usuarios.filter((u) => u.rol?.nombre?.includes('Operador')).length, [usuarios]);

  return {
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
  };
}

export default useUsuarios;

