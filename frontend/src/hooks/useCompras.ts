import { useState, useEffect, useCallback, useMemo } from 'react';
import { comprasApi } from '@/api/compras.api';
import type { OrdenCompraResponse, OrdenCompraCreate, ProveedorResponse } from '@/types';
import type { TabItem } from '@/components/ui';

export interface UseComprasReturn {
  compras: OrdenCompraResponse[];
  comprasFiltradas: OrdenCompraResponse[];
  cargando: boolean;
  error: string | null;
  busqueda: string;
  setBusqueda: (busqueda: string) => void;
  filtroEstado: string;
  setFiltroEstado: (estado: string) => void;
  tabsEstado: TabItem[];
  metricas: {
    total: number;
    inversionTotal: number;
    pendientes: number;
    recibidas: number;
  };
  proveedores: ProveedorResponse[];
  cargandoProveedores: boolean;
  cargarCompras: () => Promise<void>;
  cargarProveedores: () => Promise<void>;
  crearCompra: (datos: OrdenCompraCreate) => Promise<boolean>;
  cambiarEstado: (id: number, nuevoEstado: string) => Promise<boolean>;
  guardando: boolean;
}

export function useCompras(): UseComprasReturn {
  const [compras, setCompras] = useState<OrdenCompraResponse[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODAS');

  const [proveedores, setProveedores] = useState<ProveedorResponse[]>([]);
  const [cargandoProveedores, setCargandoProveedores] = useState<boolean>(false);

  const cargarCompras = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const res = await comprasApi.listar({ por_pagina: 100 });
      setCompras(res.datos || []);
    } catch {
      setError('Error al conectar con el servidor para obtener las órdenes de compra.');
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarProveedores = useCallback(async () => {
    try {
      setCargandoProveedores(true);
      const data = await comprasApi.listarProveedores();
      setProveedores(data || []);
    } catch {
      console.error('Error al cargar proveedores autorizados');
    } finally {
      setCargandoProveedores(false);
    }
  }, []);

  useEffect(() => {
    cargarCompras();
  }, [cargarCompras]);

  const crearCompra = useCallback(
    async (datos: OrdenCompraCreate): Promise<boolean> => {
      try {
        setGuardando(true);
        setError(null);
        await comprasApi.crear(datos);
        await cargarCompras();
        return true;
      } catch {
        setError('Error al generar la orden de compra en el sistema.');
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [cargarCompras]
  );

  const cambiarEstado = useCallback(
    async (id: number, nuevoEstado: string): Promise<boolean> => {
      try {
        setGuardando(true);
        setError(null);
        await comprasApi.cambiarEstado(id, nuevoEstado);
        await cargarCompras();
        return true;
      } catch {
        setError('Error al actualizar el estado de la orden de compra.');
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [cargarCompras]
  );

  const comprasFiltradas = useMemo(() => {
    return compras.filter((c) => {
      const coincideEstado =
        filtroEstado === 'TODAS' ||
        c.estado?.toUpperCase() === filtroEstado.toUpperCase();

      if (!coincideEstado) return false;

      if (!busqueda.trim()) return true;
      const term = busqueda.toLowerCase().trim();

      const matchId = `OC-${c.id_orden_compra}`.toLowerCase().includes(term) || String(c.id_orden_compra).includes(term);
      const matchProveedor = c.proveedor?.razon_social?.toLowerCase().includes(term);
      const matchNit = c.proveedor?.nit?.toLowerCase().includes(term);

      return matchId || matchProveedor || matchNit;
    });
  }, [compras, filtroEstado, busqueda]);

  const metricas = useMemo(() => {
    const total = compras.length;
    const inversionTotal = compras.reduce((acc, c) => acc + (Number(c.total_estimado) || 0), 0);
    const pendientes = compras.filter((c) =>
      ['SUGERIDA', 'APROBADA', 'ENVIADA'].includes(c.estado?.toUpperCase())
    ).length;
    const recibidas = compras.filter((c) => c.estado?.toUpperCase() === 'RECIBIDA').length;

    return { total, inversionTotal, pendientes, recibidas };
  }, [compras]);

  const tabsEstado: TabItem[] = useMemo(() => {
    const conteo = (st: string) =>
      compras.filter((c) => c.estado?.toUpperCase() === st.toUpperCase()).length;

    return [
      { key: 'TODAS', label: 'Todas', count: compras.length },
      { key: 'SUGERIDA', label: 'Sugeridas', count: conteo('SUGERIDA') },
      { key: 'APROBADA', label: 'Aprobadas', count: conteo('APROBADA') },
      { key: 'ENVIADA', label: 'Enviadas', count: conteo('ENVIADA') },
      { key: 'RECIBIDA', label: 'Recibidas', count: conteo('RECIBIDA') },
      { key: 'CANCELADA', label: 'Canceladas', count: conteo('CANCELADA') },
    ];
  }, [compras]);

  return {
    compras,
    comprasFiltradas,
    cargando,
    error,
    busqueda,
    setBusqueda,
    filtroEstado,
    setFiltroEstado,
    tabsEstado,
    metricas,
    proveedores,
    cargandoProveedores,
    cargarCompras,
    cargarProveedores,
    crearCompra,
    cambiarEstado,
    guardando,
  };
}
