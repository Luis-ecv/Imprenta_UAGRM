import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  AlertCircle,
  Info,
  Loader2,
  AlertOctagon,
} from 'lucide-react';
import { ordenesApi } from '@/api/ordenes.api';
import { insumosApi } from '@/api/insumos.api';
import { Button } from '@/components/ui';
import { UAGRM_TOKENS } from '@/theme/tokens';
import type { OrdenTrabajoResponse, InsumoResponse } from '@/types';

export function ConsumoRealPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [orden, setOrden] = useState<OrdenTrabajoResponse | null>(null);
  const [insumos, setInsumos] = useState<InsumoResponse[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [insumoId, setInsumoId] = useState<number | ''>('');
  const [papelUtilizado, setPapelUtilizado] = useState<string>('500');
  const [papelMerma, setPapelMerma] = useState<string>('15');
  const [observaciones, setObservaciones] = useState<string>('');

  useEffect(() => {
    async function cargar() {
      if (!id) return;
      try {
        setCargando(true);
        const [resOrden, resInsumos] = await Promise.all([
          ordenesApi.obtener(Number(id)),
          insumosApi.listar({ por_pagina: 100 }),
        ]);
        setOrden(resOrden);
        setInsumos(resInsumos.datos || []);
        if (resInsumos.datos?.length > 0) {
          setInsumoId(resInsumos.datos[0].id_insumo);
        }
      } catch {
        setError('Error al cargar la orden o el catálogo de insumos.');
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [id]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!orden || !insumoId) return;

    try {
      setGuardando(true);
      setError(null);
      await ordenesApi.registrarConsumoReal(orden.id_orden, {
        orden_id: orden.id_orden,
        insumo_id: Number(insumoId),
        cantidad_utilizada: parseFloat(papelUtilizado) || 0,
        cantidad_merma: parseFloat(papelMerma) || 0,
      });
      navigate('/ordenes');
    } catch {
      setError('Error al registrar el consumo real de producción.');
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: UAGRM_TOKENS.colors.ruby }} />
        <p className="text-sm font-semibold">Cargando datos de la orden...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/ordenes"
        className="inline-flex items-center gap-2 text-sm font-bold hover:opacity-80 transition"
        style={{ color: UAGRM_TOKENS.colors.ruby }}
      >
        <ArrowLeft size={16} /> Volver al tablero de producción
      </Link>

      <div
        className="rounded-2xl p-6 shadow-sm space-y-5"
        style={{
          backgroundColor: UAGRM_TOKENS.colors.background.paper,
          border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
        }}
      >
        <div
          className="pb-4"
          style={{ borderBottom: `1px solid ${UAGRM_TOKENS.border.subtle}` }}
        >
          <span
            className="font-mono text-xs font-bold"
            style={{ color: UAGRM_TOKENS.colors.ruby }}
          >
            {orden?.codigo_ot}
          </span>
          <h1
            className="text-2xl font-extrabold mt-1"
            style={{ color: UAGRM_TOKENS.colors.primaryDark }}
          >
            Registro de Consumo Real y Mermas
          </h1>
          <p className="text-xs" style={{ color: UAGRM_TOKENS.colors.slate }}>
            {orden?.proforma?.detalles?.[0]?.descripcion_trabajo || 'Orden de Trabajo Litográfica'}
          </p>
        </div>

        {error && (
          <div
            className="flex items-center gap-3 p-4 rounded-xl text-sm"
            style={{
              backgroundColor: UAGRM_TOKENS.colors.status.error.light,
              border: `1px solid ${UAGRM_TOKENS.border.danger}`,
              color: UAGRM_TOKENS.colors.status.error.dark,
            }}
          >
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div
          className="flex gap-3 rounded-xl p-3.5 text-xs leading-5"
          style={{
            backgroundColor: UAGRM_TOKENS.colors.status.info.light,
            border: `1px solid ${UAGRM_TOKENS.colors.status.info.border}`,
            color: UAGRM_TOKENS.colors.status.info.dark,
          }}
        >
          <Info size={18} className="shrink-0 mt-0.5" />
          <span>
            Los consumos registrados se deducen del almacén central y alimentan el dataset de Machine Learning para optimizar los pedidos futuros.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              className="block text-xs font-bold uppercase mb-1.5"
              style={{ color: UAGRM_TOKENS.colors.charcoal }}
            >
              Insumo de Sustrato
            </label>
            <select
              required
              value={insumoId}
              onChange={(e) => setInsumoId(Number(e.target.value))}
              className="form-input text-sm font-semibold"
            >
              {insumos.map((i) => (
                <option key={i.id_insumo} value={i.id_insumo}>
                  {i.codigo} - {i.descripcion} ({i.unidad_medida})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-xs font-bold mb-1"
                style={{ color: UAGRM_TOKENS.colors.charcoal }}
              >
                Cantidad Útil Utilizada
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={papelUtilizado}
                onChange={(e) => setPapelUtilizado(e.target.value)}
                className="form-input text-right font-mono font-bold"
              />
            </div>

            <div>
              <label
                className="block text-xs font-bold mb-1 flex items-center gap-1"
                style={{ color: UAGRM_TOKENS.colors.status.warning.dark }}
              >
                <AlertOctagon size={13} /> Merma (Desperdicio)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={papelMerma}
                onChange={(e) => setPapelMerma(e.target.value)}
                className="form-input text-right font-mono font-bold"
                style={{
                  borderColor: UAGRM_TOKENS.colors.status.warning.border,
                  backgroundColor: UAGRM_TOKENS.colors.status.warning.light,
                  color: UAGRM_TOKENS.colors.status.warning.dark,
                }}
              />
            </div>
          </div>

          <div>
            <label
              className="block text-xs font-bold uppercase mb-1"
              style={{ color: UAGRM_TOKENS.colors.charcoal }}
            >
              Observaciones del Prensista
            </label>
            <textarea
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej. Merma por calibración de pinzas y balance agua-tinta..."
              className="form-input text-sm resize-none"
            />
          </div>

          <div className="flex items-center justify-center gap-3 pt-3">
            <Button
              variant="outline"
              component={Link}
              to="/ordenes"
              disabled={guardando}
              style={{ minWidth: 125 }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={guardando}
              isLoading={guardando}
              icon={<Check size={18} />}
              style={{ minWidth: 165 }}
            >
              Confirmar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default ConsumoRealPage;
