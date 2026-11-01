import { useState, useEffect, useCallback, useMemo } from 'react';
import { clientesApi } from '@/api/clientes.api';
import type { ClienteResponse, ClienteCreate, ClienteUpdate, TipoCliente } from '@/types';
import type { TabItem } from '@/components/ui';

export interface FormClienteData {
  razon_social: string;
  tipo_cliente: TipoCliente;
  ci_nit: string;
  telefono: string;
  email: string;
  direccion: string;
  codigo_facultad: string;
  dependencia: string;
}

export const TIPOS_CLIENTE_OPCIONES: { valor: TipoCliente; label: string }[] = [
  { valor: 'facultad', label: 'Facultad / Unidad Académica' },
  { valor: 'docente', label: 'Docente Universitario' },
  { valor: 'autoridad', label: 'Autoridad / Directivo' },
  { valor: 'estudiante', label: 'Estudiante / Centro de Estudiantes' },
  { valor: 'particular', label: 'Cliente Particular / Externo' },
];

/**
 * Normalizador tolerante para agrupar cadenas de texto libre en tipos formales de cliente.
 */
export const normalizeTipo = (tipo?: string | null): TipoCliente => {
  if (!tipo) return 'particular';
  const t = tipo.toLowerCase().trim();
  if (t.includes('facultad')) return 'facultad';
  if (t.includes('docente')) return 'docente';
  if (t.includes('autoridad')) return 'autoridad';
  if (t.includes('estudiante')) return 'estudiante';
  if (t.includes('particular')) return 'particular';
  return 'particular';
};

export function useClientes() {
  const [clientes, setClientes] = useState<ClienteResponse[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Filtros de navegación
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');

  // Modal de edición / creación
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [clienteEditando, setClienteEditando] = useState<ClienteResponse | null>(null);

  const cargarClientes = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const res = await clientesApi.listar({ por_pagina: 100 });
      setClientes(res.datos || []);
    } catch {
      setError('Error al sincronizar clientes universitarios desde el servidor.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  const abrirModalCrear = useCallback(() => {
    setClienteEditando(null);
    setModalAbierto(true);
  }, []);

  const abrirModalEditar = useCallback((cliente: ClienteResponse) => {
    setClienteEditando(cliente);
    setModalAbierto(true);
  }, []);

  const cerrarModal = useCallback(() => {
    if (!guardando) {
      setModalAbierto(false);
      setClienteEditando(null);
    }
  }, [guardando]);

  const guardarCliente = useCallback(
    async (formData: FormClienteData): Promise<boolean> => {
      if (!formData.razon_social.trim()) {
        setError('La Razón Social / Nombre del Solicitante es obligatoria.');
        return false;
      }

      try {
        setGuardando(true);
        setError(null);

        const payload: ClienteCreate = {
          razon_social: formData.razon_social.trim(),
          tipo_cliente: formData.tipo_cliente,
          ci_nit: formData.ci_nit.trim() || null,
          nit_ci: formData.ci_nit.trim() || null,
          telefono: formData.telefono.trim() || null,
          email: formData.email.trim() || null,
          direccion: formData.direccion.trim() || null,
          codigo_facultad: formData.codigo_facultad.trim() || null,
          dependencia: formData.dependencia.trim() || null,
        };

        if (clienteEditando) {
          await clientesApi.actualizar(clienteEditando.id_cliente, payload as ClienteUpdate);
          setMensajeExito('Cliente universitario actualizado con éxito.');
        } else {
          await clientesApi.crear(payload);
          setMensajeExito('Cliente universitario registrado exitosamente.');
        }

        setModalAbierto(false);
        setClienteEditando(null);
        await cargarClientes();
        return true;
      } catch {
        setError('Ocurrió un error al guardar la información del cliente.');
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [clienteEditando, cargarClientes]
  );

  // Filtrado reactivo en memoria
  const clientesFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return clientes.filter((c) => {
      const coincideTexto =
        !q ||
        c.razon_social.toLowerCase().includes(q) ||
        (c.nit_ci && c.nit_ci.toLowerCase().includes(q)) ||
        (c.ci_nit && c.ci_nit.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.dependencia && c.dependencia.toLowerCase().includes(q)) ||
        (c.codigo_facultad && c.codigo_facultad.toLowerCase().includes(q));

      const coincideTipo = filtroTipo === 'todos' || normalizeTipo(c.tipo_cliente) === filtroTipo;

      return coincideTexto && coincideTipo;
    });
  }, [clientes, busqueda, filtroTipo]);

  // Métricas para tarjetas superiores
  const metricas = useMemo(() => {
    const total = clientes.length;
    const facultades = clientes.filter((c) => {
      const t = normalizeTipo(c.tipo_cliente);
      return t === 'facultad' || t === 'autoridad';
    }).length;
    const academicos = clientes.filter((c) => {
      const t = normalizeTipo(c.tipo_cliente);
      return t === 'docente' || t === 'estudiante';
    }).length;

    return { total, facultades, academicos };
  }, [clientes]);

  // Pestañas horizontales con conteo exacto para FilterTabs
  const tabsFiltro: TabItem[] = useMemo(() => {
    return [
      { key: 'todos', label: 'Todos', count: clientes.length },
      { key: 'facultad', label: 'Facultad', count: clientes.filter((c) => normalizeTipo(c.tipo_cliente) === 'facultad').length },
      { key: 'docente', label: 'Docente', count: clientes.filter((c) => normalizeTipo(c.tipo_cliente) === 'docente').length },
      { key: 'autoridad', label: 'Autoridad', count: clientes.filter((c) => normalizeTipo(c.tipo_cliente) === 'autoridad').length },
      { key: 'estudiante', label: 'Estudiante', count: clientes.filter((c) => normalizeTipo(c.tipo_cliente) === 'estudiante').length },
      { key: 'particular', label: 'Particular', count: clientes.filter((c) => normalizeTipo(c.tipo_cliente) === 'particular').length },
    ];
  }, [clientes]);

  return {
    clientes,
    clientesFiltrados,
    cargando,
    guardando,
    error,
    setError,
    mensajeExito,
    setMensajeExito,
    busqueda,
    setBusqueda,
    filtroTipo,
    setFiltroTipo,
    modalAbierto,
    clienteEditando,
    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,
    guardarCliente,
    cargarClientes,
    metricas,
    tabsFiltro,
  };
}

