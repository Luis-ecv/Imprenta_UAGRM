import { useState, useEffect, useCallback, useMemo } from 'react';
import { insumosApi } from '@/api/insumos.api';
import type {
  InsumoBase,
  InsumoResponse,
  InsumoCreate,
  InsumoUpdate,
  CategoriaInsumoResponse,
  CategoriaInsumoCreate,
  MovimientoInventarioCreate,
} from '@/types';

export const UNIDADES_MEDIDA = [
  'Pliego',
  'Resma',
  'Kg',
  'Litro',
  'Unidad',
  'Rollo',
  'Caja',
] as const;

export function useInsumos() {
  const [insumos, setInsumos] = useState<InsumoResponse[]>([]);
  const [categoriasDb, setCategoriasDb] = useState<CategoriaInsumoResponse[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState<string>('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('TODAS');

  // Estados de carga para operaciones
  const [guardandoInsumo, setGuardandoInsumo] = useState<boolean>(false);
  const [guardandoMovimiento, setGuardandoMovimiento] = useState<boolean>(false);
  const [guardandoCategoria, setGuardandoCategoria] = useState<boolean>(false);

  const mostrarExito = useCallback((mensaje: string) => {
    setMensajeExito(mensaje);
    setTimeout(() => {
      setMensajeExito((prev) => (prev === mensaje ? null : prev));
    }, 4000);
  }, []);

  const cargarInsumos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const [resInsumos, resCats] = await Promise.all([
        insumosApi.listar({ por_pagina: 200 }),
        insumosApi.listarCategorias().catch(() => [] as CategoriaInsumoResponse[]),
      ]);
      setInsumos(resInsumos.datos || []);
      setCategoriasDb(resCats || []);
    } catch {
      setError('Error al sincronizar el catálogo de insumos y categorías.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarInsumos();
  }, [cargarInsumos]);

  // Lista consolidada de categorías sin duplicados
  const categorias = useMemo(() => {
    const set = new Set<string>();
    categoriasDb.forEach((c) => {
      if (c.nombre) set.add(c.nombre);
    });
    insumos.forEach((i) => {
      if (i.categoria?.nombre) set.add(i.categoria.nombre);
    });
    return Array.from(set);
  }, [insumos, categoriasDb]);

  // Pestañas dinámicas con conteo por categoría
  const tabsCategoria = useMemo(() => {
    return [
      { key: 'TODAS', label: 'Todos', count: insumos.length },
      ...categorias.map((cat) => ({
        key: cat,
        label: cat,
        count: insumos.filter((i) => (i.categoria?.nombre || '').toLowerCase() === cat.toLowerCase()).length,
      })),
    ];
  }, [insumos, categorias]);

  // Métricas de control de almacén
  const metricas = useMemo(() => {
    let alerta = 0;
    let critico = 0;

    insumos.forEach((i) => {
      const stock = Number(i.stock_actual);
      const min = Number(i.stock_minimo);
      if (stock <= min) {
        critico++;
      } else if (stock <= min * 1.5) {
        alerta++;
      }
    });

    return { total: insumos.length, alerta, critico };
  }, [insumos]);

  // Lista filtrada reactiva
  const insumosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return insumos.filter((i) => {
      const coincideTexto =
        !q ||
        i.descripcion.toLowerCase().includes(q) ||
        i.codigo.toLowerCase().includes(q) ||
        (i.categoria?.nombre && i.categoria.nombre.toLowerCase().includes(q));

      const coincideCategoria =
        categoriaSeleccionada === 'TODAS' ||
        (i.categoria?.nombre && i.categoria.nombre.toLowerCase() === categoriaSeleccionada.toLowerCase());

      return coincideTexto && coincideCategoria;
    });
  }, [insumos, busqueda, categoriaSeleccionada]);

  // Guardar Insumo (Crear o Actualizar)
  const guardarInsumo = useCallback(
    async (payload: InsumoCreate | InsumoUpdate, idInsumo?: number): Promise<boolean> => {
      try {
        setGuardandoInsumo(true);
        setError(null);

        if (idInsumo) {
          // Excluir stock_actual al actualizar para respetar la trazabilidad de Kardex
          const { stock_actual, ...updatePayload } = payload as InsumoBase;
          void stock_actual;
          await insumosApi.actualizar(idInsumo, updatePayload);
          mostrarExito(`Insumo "${payload.codigo || idInsumo}" actualizado correctamente.`);
        } else {
          await insumosApi.crear(payload as InsumoCreate);
          mostrarExito(`Insumo "${payload.codigo}" registrado exitosamente en el catálogo.`);
        }

        await cargarInsumos();
        return true;
      } catch (err: unknown) {
        const mensaje =
          (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
          'Error al guardar el insumo. Verifique que el código no esté duplicado.';
        setError(mensaje);
        return false;
      } finally {
        setGuardandoInsumo(false);
      }
    },
    [cargarInsumos, mostrarExito]
  );

  // Registrar Movimiento de Almacén (Ingreso, Ajuste, Merma)
  const registrarMovimiento = useCallback(
    async (payload: MovimientoInventarioCreate): Promise<boolean> => {
      try {
        setGuardandoMovimiento(true);
        setError(null);
        await insumosApi.registrarMovimiento(payload);
        mostrarExito('Movimiento de almacén registrado correctamente en Kardex.');
        await cargarInsumos();
        return true;
      } catch (err: unknown) {
        const mensaje =
          (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
          'Error al registrar el movimiento de inventario.';
        setError(mensaje);
        return false;
      } finally {
        setGuardandoMovimiento(false);
      }
    },
    [cargarInsumos, mostrarExito]
  );

  // Registrar Nueva Categoría
  const crearCategoria = useCallback(
    async (payload: CategoriaInsumoCreate): Promise<boolean> => {
      try {
        setGuardandoCategoria(true);
        setError(null);
        await insumosApi.crearCategoria(payload);
        mostrarExito(`Categoría "${payload.nombre}" creada exitosamente.`);
        await cargarInsumos();
        return true;
      } catch (err: unknown) {
        const mensaje =
          (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
          'Error al registrar la nueva categoría.';
        setError(mensaje);
        return false;
      } finally {
        setGuardandoCategoria(false);
      }
    },
    [cargarInsumos, mostrarExito]
  );

  return {
    insumos,
    categoriasDb,
    categorias,
    tabsCategoria,
    metricas,
    insumosFiltrados,
    cargando,
    guardandoInsumo,
    guardandoMovimiento,
    guardandoCategoria,
    error,
    mensajeExito,
    setError,
    setMensajeExito,
    busqueda,
    setBusqueda,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    cargarInsumos,
    guardarInsumo,
    registrarMovimiento,
    crearCategoria,
  };
}
