import { useState, useEffect, useCallback, useMemo } from 'react';
import { reportesApi } from '@/api/reportes.api';
import type { BitacoraResponse } from '@/types';
import type { TabItem } from '@/components/ui';

export interface UseBitacoraReturn {
  registros: BitacoraResponse[];
  registrosFiltrados: BitacoraResponse[];
  cargando: boolean;
  error: string | null;
  busqueda: string;
  setBusqueda: (q: string) => void;
  filtroModulo: string;
  setFiltroModulo: (mod: string) => void;
  tabsFiltro: TabItem[];
  metricas: {
    total: number;
    hoy: number;
    seguridad: number;
    taller: number;
  };
  cargarBitacora: () => Promise<void>;
}

export function useBitacora(): UseBitacoraReturn {
  const [registros, setRegistros] = useState<BitacoraResponse[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroModulo, setFiltroModulo] = useState<string>('TODOS');

  const cargarBitacora = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const res = await reportesApi.bitacora({ por_pagina: 150 });
      setRegistros(res.datos || []);
    } catch {
      setError('Error al sincronizar los registros de auditoría y bitácora del servidor.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarBitacora();
  }, [cargarBitacora]);

  const tabsFiltro: TabItem[] = useMemo(() => {
    const countTodos = registros.length;
    const countOrdenes = registros.filter((r) => {
      const m = (r.modulo || '').toUpperCase();
      return m.includes('ORDEN') || m.includes('TALLER');
    }).length;
    const countInsumos = registros.filter((r) => {
      const m = (r.modulo || '').toUpperCase();
      return m.includes('INSUMO') || m.includes('STOCK') || m.includes('COMPRA');
    }).length;
    const countProformas = registros.filter((r) => {
      const m = (r.modulo || '').toUpperCase();
      return m.includes('PROFORMA') || m.includes('CLIENTE');
    }).length;
    const countSeguridad = registros.filter((r) => {
      const m = (r.modulo || '').toUpperCase();
      return m.includes('AUTH') || m.includes('USUARIO') || m.includes('LOGIN');
    }).length;

    return [
      { key: 'TODOS', label: 'Todos', count: countTodos },
      { key: 'ORDENES', label: 'Taller & OT', count: countOrdenes },
      { key: 'INSUMOS', label: 'Insumos & Compras', count: countInsumos },
      { key: 'PROFORMAS', label: 'Proformas & Clientes', count: countProformas },
      { key: 'SEGURIDAD', label: 'Seguridad & Auth', count: countSeguridad },
    ];
  }, [registros]);

  const registrosFiltrados = useMemo(() => {
    return registros.filter((r) => {
      const q = busqueda.toLowerCase().trim();
      const matchBusqueda =
        !q ||
        String(r.usuario_id).includes(q) ||
        r.modulo?.toLowerCase().includes(q) ||
        r.accion?.toLowerCase().includes(q) ||
        r.ip_origen?.toLowerCase().includes(q) ||
        r.detalle?.toLowerCase().includes(q);

      if (!matchBusqueda) return false;

      const m = (r.modulo || '').toUpperCase();
      if (filtroModulo === 'TODOS') return true;
      if (filtroModulo === 'ORDENES') return m.includes('ORDEN') || m.includes('TALLER');
      if (filtroModulo === 'INSUMOS') return m.includes('INSUMO') || m.includes('STOCK') || m.includes('COMPRA');
      if (filtroModulo === 'PROFORMAS') return m.includes('PROFORMA') || m.includes('CLIENTE');
      if (filtroModulo === 'SEGURIDAD') return m.includes('AUTH') || m.includes('USUARIO') || m.includes('LOGIN');

      return true;
    });
  }, [registros, busqueda, filtroModulo]);

  const metricas = useMemo(() => {
    const total = registros.length;
    const hoyStr = new Date().toISOString().split('T')[0];
    const hoy = registros.filter((r) => (r.created_at || '').startsWith(hoyStr)).length;
    const seguridad = registros.filter((r) => {
      const m = (r.modulo || '').toUpperCase();
      return m.includes('AUTH') || m.includes('USUARIO') || m.includes('LOGIN');
    }).length;
    const taller = registros.filter((r) => {
      const m = (r.modulo || '').toUpperCase();
      return m.includes('ORDEN') || m.includes('TALLER');
    }).length;

    return { total, hoy, seguridad, taller };
  }, [registros]);

  return {
    registros,
    registrosFiltrados,
    cargando,
    error,
    busqueda,
    setBusqueda,
    filtroModulo,
    setFiltroModulo,
    tabsFiltro,
    metricas,
    cargarBitacora,
  };
}
