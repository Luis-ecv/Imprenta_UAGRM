import { useState, useEffect, useCallback, useMemo } from 'react';
import { proformasApi } from '@/api/proformas.api';
import type { ProformaResponse, EstadoProforma } from '@/types';
import type { TabItem } from '@/components/ui';
import { imprimirDocumentoHtml } from '@/utils/impresion';

export function useProformas() {
  const [proformas, setProformas] = useState<ProformaResponse[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODAS');

  const cargarProformas = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const res = await proformasApi.listar({ por_pagina: 150 });
      setProformas(res.datos || []);
    } catch {
      setError('No se pudieron cargar las proformas del servidor.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarProformas();
  }, [cargarProformas]);

  const cambiarEstado = useCallback(
    async (id: number, nuevoEstado: EstadoProforma): Promise<boolean> => {
      try {
        setError(null);
        await proformasApi.cambiarEstado(id, nuevoEstado);
        setMensajeExito(`Estado de la proforma cambiado a ${nuevoEstado} exitosamente.`);
        await cargarProformas();
        return true;
      } catch {
        setError(`No se pudo cambiar el estado de la proforma a ${nuevoEstado}.`);
        return false;
      }
    },
    [cargarProformas]
  );

  const imprimirProforma = useCallback(async (id: number) => {
    try {
      setError(null);
      const html = await proformasApi.obtenerImpresionHtml(id);
      imprimirDocumentoHtml(html);
    } catch {
      setError('Error al generar el formato imprimible oficial.');
    }
  }, []);

  const obtenerHtmlProforma = useCallback(async (id: number): Promise<string> => {
    return await proformasApi.obtenerImpresionHtml(id);
  }, []);

  // Filtrado reactivo en memoria
  const proformasFiltradas = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return proformas.filter((p) => {
      const coincideTexto =
        !q ||
        p.codigo_proforma.toLowerCase().includes(q) ||
        (p.cliente?.razon_social && p.cliente.razon_social.toLowerCase().includes(q)) ||
        (p.detalles?.[0]?.descripcion_trabajo &&
          p.detalles[0].descripcion_trabajo.toLowerCase().includes(q));

      const coincideEstado = filtroEstado === 'TODAS' || p.estado === filtroEstado;

      return coincideTexto && coincideEstado;
    });
  }, [proformas, busqueda, filtroEstado]);

  // Contadores dinámicos por estado para las pestañas
  const tabsEstado: TabItem[] = useMemo(() => {
    return [
      { key: 'TODAS', label: 'Todas', count: proformas.length },
      { key: 'EMITIDA', label: 'Emitida', count: proformas.filter((p) => p.estado === 'EMITIDA').length },
      { key: 'APROBADA', label: 'Aprobada', count: proformas.filter((p) => p.estado === 'APROBADA').length },
      { key: 'RECHAZADA', label: 'Rechazada', count: proformas.filter((p) => p.estado === 'RECHAZADA').length },
      { key: 'VENCIDA', label: 'Vencida', count: proformas.filter((p) => p.estado === 'VENCIDA').length },
    ];
  }, [proformas]);

  return {
    proformas,
    proformasFiltradas,
    cargando,
    error,
    setError,
    mensajeExito,
    setMensajeExito,
    busqueda,
    setBusqueda,
    filtroEstado,
    setFiltroEstado,
    cargarProformas,
    cambiarEstado,
    imprimirProforma,
    obtenerHtmlProforma,
    tabsEstado,
  };
}

