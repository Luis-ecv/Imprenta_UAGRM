import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Calendar, CheckCircle2 } from 'lucide-react';
import { ordenesApi } from '@/api/ordenes.api';
import type { OrdenTrabajoResponse, EstadoOrden, PrioridadOrden } from '@/types';
import { formatearFecha } from '@/utils/formatters';
import { Button, Badge } from '@/components/ui';
import { UAGRM_TOKENS } from '@/theme/tokens';

export function OrdenDetallePage() {
  const { id } = useParams<{ id: string }>();
  const [orden, setOrden] = useState<OrdenTrabajoResponse | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

  useEffect(() => {
    async function cargar() {
      if (!id) return;
      try {
        setCargando(true);
        const data = await ordenesApi.obtener(Number(id));
        setOrden(data);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [id]);

  if (cargando) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin" style={{ color: UAGRM_TOKENS.colors.ruby }} />
      </div>
    );
  }

  if (!orden) {
    return (
      <div className="p-8 text-center" style={{ color: UAGRM_TOKENS.colors.slate }}>
        <p>No se encontró la orden solicitada.</p>
        <Link
          to="/ordenes"
          className="font-bold mt-2 inline-block hover:opacity-80 transition"
          style={{ color: UAGRM_TOKENS.colors.ruby }}
        >
          Volver a taller
        </Link>
      </div>
    );
  }

  const detalle = orden.detalles_orden?.[0];

  const estadoVariantMap: Record<EstadoOrden, 'neutral' | 'warning' | 'info' | 'primary' | 'success' | 'secondary'> = {
    REGISTRADO: 'neutral',
    'EN COLA': 'warning',
    'EN IMPRESION': 'info',
    'EN ACABADO': 'secondary',
    FINALIZADO: 'success',
    ENTREGADO: 'primary',
  };

  const prioridadVariantMap: Record<PrioridadOrden, 'neutral' | 'error'> = {
    NORMAL: 'neutral',
    URGENTE: 'error',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/ordenes"
        className="inline-flex items-center gap-2 text-sm font-bold hover:opacity-80 transition"
        style={{ color: UAGRM_TOKENS.colors.ruby }}
      >
        <ArrowLeft size={16} /> Volver al tablero
      </Link>

      <div
        className="rounded-2xl p-6 shadow-sm space-y-6"
        style={{
          backgroundColor: UAGRM_TOKENS.colors.background.paper,
          border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
        }}
      >
        <div
          className="flex items-start justify-between pb-4"
          style={{ borderBottom: `1px solid ${UAGRM_TOKENS.border.subtle}` }}
        >
          <div>
            <span
              className="font-mono text-xs font-bold"
              style={{ color: UAGRM_TOKENS.colors.ruby }}
            >
              {orden.codigo_ot}
            </span>
            <h1
              className="text-2xl font-black mt-1"
              style={{ color: UAGRM_TOKENS.colors.primaryDark }}
            >
              {orden.proforma?.detalles?.[0]?.descripcion_trabajo || 'Orden de Producción'}
            </h1>
            <p className="text-xs mt-1" style={{ color: UAGRM_TOKENS.colors.slate }}>
              Cliente: <strong>{orden.proforma?.cliente?.razon_social || 'UAGRM'}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={prioridadVariantMap[orden.prioridad] || 'neutral'}>
              {orden.prioridad}
            </Badge>
            <Badge variant={estadoVariantMap[orden.estado_actual] || 'neutral'}>
              {orden.estado_actual}
            </Badge>
          </div>
        </div>

        {detalle && (
          <div
            className="space-y-3 p-4 rounded-xl text-xs"
            style={{
              backgroundColor: UAGRM_TOKENS.colors.background.subtle,
              border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
            }}
          >
            <p>
              <strong style={{ color: UAGRM_TOKENS.colors.charcoal }}>Formato de Corte:</strong>{' '}
              <span style={{ color: UAGRM_TOKENS.colors.slate }}>{detalle.formato_corte}</span>
            </p>
            <p>
              <strong style={{ color: UAGRM_TOKENS.colors.charcoal }}>Encuadernación:</strong>{' '}
              <span style={{ color: UAGRM_TOKENS.colors.slate }}>{detalle.tipo_encuadernacion}</span>
            </p>
            {detalle.especificaciones_taller && (
              <p>
                <strong style={{ color: UAGRM_TOKENS.colors.charcoal }}>Especificaciones Taller:</strong>{' '}
                <span style={{ color: UAGRM_TOKENS.colors.slate }}>{detalle.especificaciones_taller}</span>
              </p>
            )}
            <p
              className="flex items-center gap-1"
              style={{ color: UAGRM_TOKENS.colors.slate }}
            >
              <Calendar size={13} color={UAGRM_TOKENS.colors.mutedSlate} /> Fecha de Compromiso:{' '}
              <strong style={{ color: UAGRM_TOKENS.colors.charcoal }}>
                {formatearFecha(orden.fecha_compromiso)}
              </strong>
            </p>
          </div>
        )}

        <div
          className="flex justify-end pt-3"
          style={{ borderTop: `1px solid ${UAGRM_TOKENS.border.subtle}` }}
        >
          <Button
            variant="default"
            component={Link}
            to={`/ordenes/${orden.id_orden}/consumo`}
            icon={<CheckCircle2 size={16} />}
          >
            Registrar Consumo Real y Mermas
          </Button>
        </div>
      </div>
    </div>
  );
}
export default OrdenDetallePage;

