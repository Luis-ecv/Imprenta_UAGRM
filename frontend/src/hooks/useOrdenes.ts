import { useState, useEffect, useCallback, useMemo } from 'react';
import { ordenesApi } from '@/api/ordenes.api';
import { insumosApi } from '@/api/insumos.api';
import type { OrdenTrabajoResponse, InsumoResponse } from '@/types';
import type { TabItem } from '@/components/ui';
import { TRANSICIONES_ESTADO } from '@/utils/constants';

export interface CompromisoInfo {
  texto: string;
  nivel: 'vencida' | 'hoy' | 'urgente' | 'semana' | 'normal';
  dias: number;
}

// Cálculo reactivo de días restantes para la fecha de compromiso
export function calcularCompromiso(fechaStr?: string | null): CompromisoInfo {
  if (!fechaStr) return { texto: 'Sin fecha', nivel: 'normal', dias: 999 };
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const partes = fechaStr.split('-');
  const compromiso = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
  compromiso.setHours(0, 0, 0, 0);

  const diffTime = compromiso.getTime() - hoy.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { texto: `Vencida (${Math.abs(diffDays)}d)`, nivel: 'vencida', dias: diffDays };
  }
  if (diffDays === 0) {
    return { texto: 'Vence hoy', nivel: 'hoy', dias: 0 };
  }
  if (diffDays === 1) {
    return { texto: 'En 1 día', nivel: 'urgente', dias: 1 };
  }
  if (diffDays <= 7) {
    return { texto: `En ${diffDays} días`, nivel: 'semana', dias: diffDays };
  }
  return { texto: `En ${diffDays} días`, nivel: 'normal', dias: diffDays };
}

export function useOrdenes() {
  const [ordenes, setOrdenes] = useState<OrdenTrabajoResponse[]>([]);
  const [insumos, setInsumos] = useState<InsumoResponse[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroTab, setFiltroTab] = useState<string>('TODAS');

  const cargarOrdenes = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const [resOrdenes, resInsumos] = await Promise.all([
        ordenesApi.listar({ por_pagina: 150 }),
        insumosApi.listar({ por_pagina: 100 }),
      ]);
      setOrdenes(resOrdenes.datos || []);
      setInsumos(resInsumos.datos || []);
    } catch {
      setError('No se pudieron sincronizar las órdenes de trabajo del servidor.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarOrdenes();
  }, [cargarOrdenes]);

  const avanzarEstado = useCallback(
    async (orden: OrdenTrabajoResponse): Promise<{ requiereCierre: boolean; exito: boolean }> => {
      const siguienteEstado = TRANSICIONES_ESTADO[orden.estado_actual];
      if (!siguienteEstado) return { requiereCierre: false, exito: false };

      // Si avanza a FINALIZADO, requerir cierre técnico y registro de consumo real
      if (siguienteEstado === 'FINALIZADO') {
        return { requiereCierre: true, exito: false };
      }

      try {
        setError(null);
        await ordenesApi.cambiarEstado(orden.id_orden, {
          estado_nuevo: siguienteEstado,
          observaciones: `Avance operativo a ${siguienteEstado}`,
        });
        setMensajeExito(`Orden ${orden.codigo_ot} avanzada a ${siguienteEstado}.`);
        await cargarOrdenes();
        return { requiereCierre: false, exito: true };
      } catch {
        setError(`Error al cambiar el estado de la orden ${orden.codigo_ot} a ${siguienteEstado}.`);
        return { requiereCierre: false, exito: false };
      }
    },
    [cargarOrdenes]
  );

  const confirmarCierreTecnico = useCallback(
    async (
      ordenId: number,
      insumoId: number | null,
      papelUtilizado: number,
      papelMerma: number,
      observaciones?: string
    ): Promise<boolean> => {
      try {
        setError(null);

        // 1. Registrar consumo real si se seleccionó insumo
        if (insumoId) {
          await ordenesApi.registrarConsumoReal(ordenId, {
            orden_id: ordenId,
            insumo_id: insumoId,
            cantidad_utilizada: papelUtilizado,
            cantidad_merma: papelMerma,
          });
        }

        // 2. Avanzar estado a FINALIZADO
        await ordenesApi.cambiarEstado(ordenId, {
          estado_nuevo: 'FINALIZADO',
          observaciones:
            observaciones || 'Cierre técnico de taller con registro de consumo real y merma.',
        });

        setMensajeExito('Cierre técnico y consumo real registrados exitosamente.');
        await cargarOrdenes();
        return true;
      } catch {
        setError('Error al registrar el consumo real y finalizar la orden.');
        return false;
      }
    },
    [cargarOrdenes]
  );

  // Filtrado reactivo en memoria
  const ordenesFiltradas = useMemo(() => {
    return ordenes.filter((o) => {
      // Filtro pestaña
      if (filtroTab === 'PROCESO' && o.estado_actual === 'ENTREGADO') return false;
      if (filtroTab === 'VENCEN_7D') {
        const c = calcularCompromiso(o.fecha_compromiso);
        if (o.estado_actual === 'ENTREGADO' || c.dias < 0 || c.dias > 7) return false;
      }
      if (filtroTab === 'ALTA' && o.prioridad !== 'URGENTE') return false;
      if (filtroTab === 'ENTREGADAS' && o.estado_actual !== 'ENTREGADO') return false;

      // Filtro texto
      const termino = busqueda.toLowerCase().trim();
      if (!termino) return true;

      const desc = o.proforma?.detalles?.[0]?.descripcion_trabajo?.toLowerCase() || '';
      const cliente = o.proforma?.cliente?.razon_social?.toLowerCase() || '';
      const codigo = o.codigo_ot.toLowerCase();

      return desc.includes(termino) || cliente.includes(termino) || codigo.includes(termino);
    });
  }, [ordenes, busqueda, filtroTab]);

  // Pestañas dinámicas con conteo exacto
  const tabsFiltro: TabItem[] = useMemo(() => {
    const conteo = {
      TODAS: ordenes.length,
      PROCESO: ordenes.filter((o) => o.estado_actual !== 'ENTREGADO').length,
      VENCEN_7D: ordenes.filter((o) => {
        const c = calcularCompromiso(o.fecha_compromiso);
        return o.estado_actual !== 'ENTREGADO' && c.dias >= 0 && c.dias <= 7;
      }).length,
      ALTA: ordenes.filter((o) => o.prioridad === 'URGENTE').length,
      ENTREGADAS: ordenes.filter((o) => o.estado_actual === 'ENTREGADO').length,
    };

    return [
      { key: 'TODAS', label: 'Todas', count: conteo.TODAS },
      { key: 'PROCESO', label: 'En Proceso', count: conteo.PROCESO },
      { key: 'VENCEN_7D', label: 'Vencen en 7 días', count: conteo.VENCEN_7D },
      { key: 'ALTA', label: 'Prioridad Urgente / Alta', count: conteo.ALTA },
      { key: 'ENTREGADAS', label: 'Entregadas', count: conteo.ENTREGADAS },
    ];
  }, [ordenes]);

  return {
    ordenes,
    insumos,
    ordenesFiltradas,
    cargando,
    error,
    setError,
    mensajeExito,
    setMensajeExito,
    busqueda,
    setBusqueda,
    filtroTab,
    setFiltroTab,
    cargarOrdenes,
    avanzarEstado,
    confirmarCierreTecnico,
    tabsFiltro,
  };
}
