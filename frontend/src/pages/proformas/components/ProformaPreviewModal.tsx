import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { ExternalLink, Printer } from 'lucide-react';

import { Modal, Button } from '@/components/ui';
import { UAGRM_TOKENS } from '@/theme/tokens';
import type { ProformaResponse } from '@/types';
import { formatearMoneda } from '@/utils/formatters';
import { imprimirDocumentoHtml, abrirDocumentoEnPestana } from '@/utils/impresion';

interface ProformaPreviewModalProps {
  open: boolean;
  proforma: ProformaResponse | null;
  htmlDoc: string;
  cargandoHtml: boolean;
  onClose: () => void;
  onImprimirDirecto?: (id: number) => void;
}

export const ProformaPreviewModal: React.FC<ProformaPreviewModalProps> = ({
  open,
  proforma,
  htmlDoc,
  cargandoHtml,
  onClose,
  onImprimirDirecto,
}) => {
  const handleConfirmarImpresion = () => {
    if (htmlDoc) {
      imprimirDocumentoHtml(htmlDoc);
    } else if (proforma && onImprimirDirecto) {
      onImprimirDirecto(proforma.id_proforma);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Vista Previa de Proforma Oficial"
      subtitle="Documento Imprimible Litográfico UAGRM"
      maxWidth="md"
      actions={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            style={{ minWidth: 125 }}
          >
            Cerrar
          </Button>

          {htmlDoc && (
            <Button
              variant="outline"
              icon={<ExternalLink size={16} />}
              onClick={() => abrirDocumentoEnPestana(htmlDoc)}
              style={{ minWidth: 155 }}
            >
              Ver en Pestaña
            </Button>
          )}

          <Button
            variant="default"
            icon={<Printer size={18} />}
            onClick={handleConfirmarImpresion}
            style={{ minWidth: 165 }}
          >
            Imprimir
          </Button>
        </>
      }
    >
      {cargandoHtml ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 2 }}>
          <CircularProgress size={32} sx={{ color: UAGRM_TOKENS.colors.royalBlue }} />
          <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate }}>
            Generando formato oficial de cotización...
          </Typography>
        </Box>
      ) : htmlDoc ? (
        <Box
          sx={{
            width: '100%',
            height: '60vh',
            border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <iframe
            title="Vista previa de proforma oficial"
            srcDoc={htmlDoc}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </Box>
      ) : (
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          ¡La proforma fue registrada exitosamente en el sistema con código{' '}
          <strong>{proforma?.codigo_proforma}</strong> por un total de{' '}
          <strong>{formatearMoneda(proforma?.total_presupuesto || 0)}</strong>!
        </Alert>
      )}
    </Modal>
  );
};
