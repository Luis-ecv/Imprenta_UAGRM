import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, Loader2 } from 'lucide-react';
import { proformasApi } from '@/api/proformas.api';
import type { ProformaResponse, EstadoProforma } from '@/types';
import { formatearMoneda, formatearFecha } from '@/utils/formatters';
import { imprimirDocumentoHtml } from '@/utils/impresion';
import { Button, Badge } from '@/components/ui';
import { UAGRM_TOKENS } from '@/theme/tokens';

export function ProformaDetallePage() {
  const { id } = useParams<{ id: string }>();
  const [proforma, setProforma] = useState<ProformaResponse | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      if (!id) return;
      try {
        setCargando(true);
        const data = await proformasApi.obtener(Number(id));
        setProforma(data);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [id]);

  async function handleImprimir() {
    if (!id) return;
    const html = await proformasApi.obtenerImpresionHtml(Number(id));
    imprimirDocumentoHtml(html);
  }

  if (cargando) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin" style={{ color: UAGRM_TOKENS.colors.ruby }} />
      </div>
    );
  }

  if (!proforma) {
    return (
      <div className="p-8 text-center" style={{ color: UAGRM_TOKENS.colors.slate }}>
        <p>No se encontró la proforma solicitada.</p>
        <Link
          to="/proformas"
          className="font-bold mt-2 inline-block hover:opacity-80"
          style={{ color: UAGRM_TOKENS.colors.ruby }}
        >
          Volver a proformas
        </Link>
      </div>
    );
  }

  const variantMap: Record<EstadoProforma, 'info' | 'success' | 'error' | 'warning'> = {
    EMITIDA: 'info',
    APROBADA: 'success',
    RECHAZADA: 'error',
    VENCIDA: 'warning',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/proformas"
        className="inline-flex items-center gap-2 text-sm font-bold transition hover:opacity-80"
        style={{ color: UAGRM_TOKENS.colors.ruby }}
      >
        <ArrowLeft size={16} /> Volver a proformas
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
              {proforma.codigo_proforma}
            </span>
            <h1
              className="text-2xl font-black mt-1"
              style={{ color: UAGRM_TOKENS.colors.primaryDark }}
            >
              {proforma.detalles?.[0]?.descripcion_trabajo || 'Detalle de Proforma'}
            </h1>
            <p className="text-xs mt-1" style={{ color: UAGRM_TOKENS.colors.slate }}>
              Cliente: <strong>{proforma.cliente?.razon_social || `ID #${proforma.cliente_id}`}</strong>
            </p>
          </div>
          <Badge variant={variantMap[proforma.estado] || 'info'}>
            {proforma.estado}
          </Badge>
        </div>

        <div
          className="grid grid-cols-2 gap-4 text-xs p-4 rounded-xl"
          style={{
            backgroundColor: UAGRM_TOKENS.colors.background.subtle,
            border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
          }}
        >
          <div>
            <span className="block" style={{ color: UAGRM_TOKENS.colors.mutedSlate }}>
              Fecha de Emisión:
            </span>
            <strong style={{ color: UAGRM_TOKENS.colors.charcoal }}>
              {formatearFecha(proforma.fecha_emision)}
            </strong>
          </div>
          <div>
            <span className="block" style={{ color: UAGRM_TOKENS.colors.mutedSlate }}>
              Vencimiento:
            </span>
            <strong style={{ color: UAGRM_TOKENS.colors.charcoal }}>
              {formatearFecha(proforma.fecha_vencimiento)}
            </strong>
          </div>
          <div>
            <span className="block" style={{ color: UAGRM_TOKENS.colors.mutedSlate }}>
              Modalidad:
            </span>
            <strong className="capitalize" style={{ color: UAGRM_TOKENS.colors.charcoal }}>
              {proforma.modalidad === 'insumos_imprenta' ? 'Insumos Imprenta' : 'Insumos Cliente'}
            </strong>
          </div>
          <div>
            <span className="block" style={{ color: UAGRM_TOKENS.colors.mutedSlate }}>
              Total Cotizado:
            </span>
            <strong
              className="text-lg font-mono"
              style={{ color: UAGRM_TOKENS.colors.ruby }}
            >
              {formatearMoneda(proforma.total_presupuesto)}
            </strong>
          </div>
        </div>

        <div
          className="flex justify-end pt-3"
          style={{ borderTop: `1px solid ${UAGRM_TOKENS.border.subtle}` }}
        >
          <Button
            variant="default"
            icon={<Printer size={16} />}
            onClick={handleImprimir}
          >
            Imprimir Formato Oficial UAGRM
          </Button>
        </div>
      </div>
    </div>
  );
}
export default ProformaDetallePage;
