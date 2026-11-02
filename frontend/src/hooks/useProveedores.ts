import { useState, useEffect, useCallback, useMemo } from 'react';
import { proveedoresApi } from '@/api/proveedores.api';
import type { ProveedorResponse, ProveedorCreate, ProveedorUpdate } from '@/types';

export interface UseProveedoresReturn {
  proveedores: ProveedorResponse[];
  proveedoresFiltrados: ProveedorResponse[];
  cargando: boolean;
  error: string | null;
  busqueda: string;
  setBusqueda: (busqueda: string) => void;
  cargarProveedores: () => Promise<void>;
  crearProveedor: (datos: ProveedorCreate) => Promise<boolean>;
  actualizarProveedor: (id: number, datos: ProveedorUpdate) => Promise<boolean>;
  guardando: boolean;
  metricas: {
    total: number;
    conNit: number;
    conContacto: number;
  };
}

export function useProveedores(): UseProveedoresReturn {
  const [proveedores, setProveedores] = useState<ProveedorResponse[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState<string>('');

  const cargarProveedores = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const res = await proveedoresApi.listar({ por_pagina: 100 });
      setProveedores(res.datos || []);
    } catch {
      setError('Error al sincronizar proveedores autorizados con el servidor.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarProveedores();
  }, [cargarProveedores]);

  const crearProveedor = useCallback(
    async (datos: ProveedorCreate): Promise<boolean> => {
      try {
        setGuardando(true);
        setError(null);
        await proveedoresApi.crear(datos);
        await cargarProveedores();
        return true;
      } catch {
        setError('Error al registrar el nuevo proveedor.');
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [cargarProveedores]
  );

  const actualizarProveedor = useCallback(
    async (id: number, datos: ProveedorUpdate): Promise<boolean> => {
      try {
        setGuardando(true);
        setError(null);
        await proveedoresApi.actualizar(id, datos);
        await cargarProveedores();
        return true;
      } catch {
        setError('Error al actualizar la información del proveedor.');
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [cargarProveedores]
  );

  const proveedoresFiltrados = useMemo(() => {
    if (!busqueda.trim()) return proveedores;
    const term = busqueda.toLowerCase().trim();
    return proveedores.filter((p) => {
      const matchRazon = p.razon_social?.toLowerCase().includes(term);
      const matchNit = p.nit?.toLowerCase().includes(term);
      const matchContacto = p.contacto?.toLowerCase().includes(term);
      const matchEmail = p.email?.toLowerCase().includes(term);
      const matchTelefono = p.telefono?.toLowerCase().includes(term);
      return matchRazon || matchNit || matchContacto || matchEmail || matchTelefono;
    });
  }, [proveedores, busqueda]);

  const metricas = useMemo(() => {
    const total = proveedores.length;
    const conNit = proveedores.filter((p) => Boolean(p.nit && p.nit.trim())).length;
    const conContacto = proveedores.filter((p) => Boolean(p.contacto && p.contacto.trim())).length;
    return { total, conNit, conContacto };
  }, [proveedores]);

  return {
    proveedores,
    proveedoresFiltrados,
    cargando,
    error,
    busqueda,
    setBusqueda,
    cargarProveedores,
    crearProveedor,
    actualizarProveedor,
    guardando,
    metricas,
  };
}
