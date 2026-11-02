import { useState, useEffect, useCallback, useMemo } from 'react';
import { tarifasApi, type TarifaResponse, type TarifaCreate } from '@/api/tarifas.api';
import type { TabItem } from '@/components/ui';

export interface UseTarifasReturn {
  tarifas: TarifaResponse[];
  tarifasFiltradas: TarifaResponse[];
  cargando: boolean;
  guardando: boolean;
  error: string | null;
  setError: (err: string | null) => void;
  busqueda: string;
  setBusqueda: (q: string) => void;
  filtroCategoria: string;
  setFiltroCategoria: (cat: string) => void;
  tabsFiltro: TabItem[];
  metricas: {
    total: number;
    costoPromedio: number;
    offset: number;
    acabados: number;
  };
  cargarTarifas: () => Promise<void>;
  crearTarifa: (datos: TarifaCreate) => Promise<boolean>;
  actualizarTarifa: (id: number, datos: Partial<TarifaResponse>) => Promise<boolean>;
}

export function useTarifas(): UseTarifasReturn {
  const [tarifas, setTarifas] = useState<TarifaResponse[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');

  const cargarTarifas = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await tarifasApi.listar();
      setTarifas(data || []);
    } catch {
      setError('Error al sincronizar tarifas y aranceles litográficos del servidor.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarTarifas();
  }, [cargarTarifas]);

  const crearTarifa = useCallback(
    async (datos: TarifaCreate): Promise<boolean> => {
      try {
        setGuardando(true);
        setError(null);
        await tarifasApi.crear(datos);
        await cargarTarifas();
        return true;
      } catch {
        setError('Error al registrar la nueva tarifa en el servidor institucional.');
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [cargarTarifas]
  );

  const actualizarTarifa = useCallback(
    async (id: number, datos: Partial<TarifaResponse>): Promise<boolean> => {
      try {
        setGuardando(true);
        setError(null);
        await tarifasApi.actualizar(id, datos);
        await cargarTarifas();
        return true;
      } catch {
        setError('No se pudo guardar la tarifa en el servidor.');
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [cargarTarifas]
  );

  const tabsFiltro: TabItem[] = useMemo(() => {
    const countTodas = tarifas.length;
    const countOffset = tarifas.filter(
      (t) => t.concepto.toLowerCase().includes('offset') || (t.tipo_tarifa && t.tipo_tarifa.toUpperCase().includes('OFFSET'))
    ).length;
    const countCorte = tarifas.filter(
      (t) => t.concepto.toLowerCase().includes('guillotina') || t.concepto.toLowerCase().includes('corte')
    ).length;
    const countAcabados = tarifas.filter(
      (t) =>
        t.concepto.toLowerCase().includes('doblado') ||
        t.concepto.toLowerCase().includes('encuadernaci') ||
        t.concepto.toLowerCase().includes('alzado')
    ).length;

    return [
      { key: 'TODAS', label: 'Todas', count: countTodas },
      { key: 'OFFSET', label: 'Tirada Offset', count: countOffset },
      { key: 'CORTE', label: 'Guillotina y Corte', count: countCorte },
      { key: 'ACABADO', label: 'Acabados y Fresado', count: countAcabados },
    ];
  }, [tarifas]);

  const tarifasFiltradas = useMemo(() => {
    return tarifas.filter((t) => {
      const q = busqueda.toLowerCase().trim();
      const coincideBusqueda =
        !q ||
        t.concepto.toLowerCase().includes(q) ||
        (t.unidad && t.unidad.toLowerCase().includes(q)) ||
        (t.tipo_tarifa && t.tipo_tarifa.toLowerCase().includes(q));

      if (!coincideBusqueda) return false;

      if (filtroCategoria === 'TODAS') return true;
      if (filtroCategoria === 'OFFSET') {
        return (
          t.concepto.toLowerCase().includes('offset') ||
          (t.tipo_tarifa && t.tipo_tarifa.toUpperCase().includes('OFFSET'))
        );
      }
      if (filtroCategoria === 'CORTE') {
        return (
          t.concepto.toLowerCase().includes('guillotina') ||
          t.concepto.toLowerCase().includes('corte')
        );
      }
      if (filtroCategoria === 'ACABADO') {
        return (
          t.concepto.toLowerCase().includes('doblado') ||
          t.concepto.toLowerCase().includes('encuadernaci') ||
          t.concepto.toLowerCase().includes('alzado')
        );
      }
      return true;
    });
  }, [tarifas, busqueda, filtroCategoria]);

  const metricas = useMemo(() => {
    const total = tarifas.length;
    const sumaCostos = tarifas.reduce(
      (acc, t) => acc + (Number(t.costo_unitario ?? t.precio_unitario) || 0),
      0
    );
    const costoPromedio = total > 0 ? sumaCostos / total : 0;
    const offset = tarifas.filter(
      (t) => t.concepto.toLowerCase().includes('offset') || (t.tipo_tarifa && t.tipo_tarifa.toUpperCase().includes('OFFSET'))
    ).length;
    const acabados = tarifas.filter(
      (t) =>
        t.concepto.toLowerCase().includes('doblado') ||
        t.concepto.toLowerCase().includes('encuadernaci') ||
        t.concepto.toLowerCase().includes('alzado') ||
        t.concepto.toLowerCase().includes('corte')
    ).length;

    return { total, costoPromedio, offset, acabados };
  }, [tarifas]);

  return {
    tarifas,
    tarifasFiltradas,
    cargando,
    guardando,
    error,
    setError,
    busqueda,
    setBusqueda,
    filtroCategoria,
    setFiltroCategoria,
    tabsFiltro,
    metricas,
    cargarTarifas,
    crearTarifa,
    actualizarTarifa,
  };
}

