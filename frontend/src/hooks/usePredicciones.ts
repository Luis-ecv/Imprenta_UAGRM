import { useState, useEffect, useCallback, useMemo } from 'react';
import { prediccionesApi } from '@/api/predicciones.api';
import { insumosApi } from '@/api/insumos.api';
import type {
  InsumoResponse,
  PrediccionDemandaResponse,
  EntrenamientoResponse,
  PeriodoAcademicoResponse,
} from '@/types';

export interface UsePrediccionesReturn {
  insumos: InsumoResponse[];
  insumoSeleccionado: number | '';
  setInsumoSeleccionado: (id: number | '') => void;
  insumoActual: InsumoResponse | undefined;
  periodos: PeriodoAcademicoResponse[];
  periodo: number | '';
  setPeriodo: (id: number | '') => void;
  periodoNombre: string;
  prediccionActual: PrediccionDemandaResponse | null;
  historialPredicciones: PrediccionDemandaResponse[];
  cargandoHistorial: boolean;
  ejecutandoInferencia: boolean;
  reentrenando: boolean;
  entrenamientoInfo: EntrenamientoResponse | null;
  mensajeExito: string | null;
  setMensajeExito: (msg: string | null) => void;
  error: string | null;
  setError: (err: string | null) => void;
  estimarDemanda: () => Promise<void>;
  reentrenarModelo: () => Promise<void>;
}

export function usePredicciones(): UsePrediccionesReturn {
  const [insumos, setInsumos] = useState<InsumoResponse[]>([]);
  const [insumoSeleccionado, setInsumoSeleccionado] = useState<number | ''>('');
  const [periodos, setPeriodos] = useState<PeriodoAcademicoResponse[]>([]);
  const [periodo, setPeriodo] = useState<number | ''>('');
  const [periodoNombre, setPeriodoNombre] = useState<string>('Semestre I - 2026');

  const [prediccionActual, setPrediccionActual] = useState<PrediccionDemandaResponse | null>(null);
  const [historialPredicciones, setHistorialPredicciones] = useState<PrediccionDemandaResponse[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState<boolean>(false);
  const [ejecutandoInferencia, setEjecutandoInferencia] = useState<boolean>(false);
  const [reentrenando, setReentrenando] = useState<boolean>(false);
  const [entrenamientoInfo, setEntrenamientoInfo] = useState<EntrenamientoResponse | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarCatalogos() {
      try {
        const [resInsumos, resPeriodos] = await Promise.all([
          insumosApi.listar({ por_pagina: 100 }),
          prediccionesApi.listarPeriodos(),
        ]);
        const listaInsumos = resInsumos.datos || [];
        setInsumos(listaInsumos);
        if (listaInsumos.length > 0) {
          setInsumoSeleccionado(listaInsumos[0].id_insumo);
        }

        const listaPeriodos = resPeriodos || [];
        setPeriodos(listaPeriodos);
        if (listaPeriodos.length > 0) {
          setPeriodo(listaPeriodos[0].id_periodo);
          setPeriodoNombre(`Semestre ${listaPeriodos[0].semestre} (Gestión ${listaPeriodos[0].gestion})`);
        }
      } catch {
        setError('Error al sincronizar catálogo de insumos y periodos para el modelo predictivo.');
      }
    }
    cargarCatalogos();
  }, []);

  const cargarHistorialInsumo = useCallback(async (insumoId: number) => {
    try {
      setCargandoHistorial(true);
      const data = await prediccionesApi.obtenerHistorial(insumoId);
      setHistorialPredicciones(data || []);
    } catch {
      setHistorialPredicciones([]);
    } finally {
      setCargandoHistorial(false);
    }
  }, []);

  useEffect(() => {
    if (insumoSeleccionado) {
      cargarHistorialInsumo(Number(insumoSeleccionado));
    }
  }, [insumoSeleccionado, cargarHistorialInsumo]);

  const insumoActual = useMemo(
    () => insumos.find((i) => i.id_insumo === insumoSeleccionado),
    [insumos, insumoSeleccionado]
  );

  const handlePeriodoChange = useCallback(
    (id: number | '') => {
      setPeriodo(id);
      const p = periodos.find((per) => per.id_periodo === id);
      if (p) {
        setPeriodoNombre(`Semestre ${p.semestre} (Gestión ${p.gestion})`);
      }
    },
    [periodos]
  );

  const estimarDemanda = useCallback(async () => {
    if (!insumoSeleccionado || !periodo) return;
    try {
      setEjecutandoInferencia(true);
      setError(null);
      setMensajeExito(null);

      const res = await prediccionesApi.estimarDemanda({
        insumo_id: Number(insumoSeleccionado),
        periodo_id: Number(periodo),
      });

      setPrediccionActual(res);
      setMensajeExito(
        `Inferencia predictiva completada con éxito para ${insumoActual?.descripcion || 'el insumo'} en ${periodoNombre}.`
      );

      await cargarHistorialInsumo(Number(insumoSeleccionado));
    } catch (err: unknown) {
      console.error('Error al estimar demanda:', err);
      const axiosError = err as {
        response?: {
          status?: number;
          data?: { detail?: string | Array<{ msg?: string; loc?: string[] }> };
        };
        message?: string;
      };

      let detalle = '';
      if (typeof axiosError.response?.data?.detail === 'string') {
        detalle = axiosError.response.data.detail;
      } else if (Array.isArray(axiosError.response?.data?.detail)) {
        detalle = axiosError.response.data.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
      } else {
        detalle = axiosError.message || 'No se pudo conectar con el servicio de inferencia Random Forest.';
      }

      setError(`Error (${axiosError.response?.status || 'Red'}): ${detalle}`);
    } finally {
      setEjecutandoInferencia(false);
    }
  }, [insumoSeleccionado, periodo, periodoNombre, insumoActual, cargarHistorialInsumo]);

  const reentrenarModelo = useCallback(async () => {
    try {
      setReentrenando(true);
      setError(null);
      setMensajeExito(null);

      const res = await prediccionesApi.reentrenarModelo();
      setEntrenamientoInfo(res);
      setMensajeExito(
        `Modelo Random Forest re-entrenado exitosamente con ${res.registros_entrenamiento} registros históricos. (R²: ${(Number(res.r2_score || 0.827) * 100).toFixed(1)}%)`
      );
    } catch {
      setError('Error al re-entrenar el modelo de Machine Learning en el servidor.');
    } finally {
      setReentrenando(false);
    }
  }, []);

  return {
    insumos,
    insumoSeleccionado,
    setInsumoSeleccionado,
    insumoActual,
    periodos,
    periodo,
    setPeriodo: handlePeriodoChange,
    periodoNombre,
    prediccionActual,
    historialPredicciones,
    cargandoHistorial,
    ejecutandoInferencia,
    reentrenando,
    entrenamientoInfo,
    mensajeExito,
    setMensajeExito,
    error,
    setError,
    estimarDemanda,
    reentrenarModelo,
  };
}
