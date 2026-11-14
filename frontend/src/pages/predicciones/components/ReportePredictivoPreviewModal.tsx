import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ExternalLink, Printer } from 'lucide-react';

import { Modal, Button } from '@/components/ui';
import { UAGRM_TOKENS } from '@/theme/tokens';
import { imprimirDocumentoHtml, abrirDocumentoEnPestana } from '@/utils/impresion';

interface ReportePredictivoPreviewModalProps {
  open: boolean;
  htmlDoc: string;
  insumoNombre?: string;
  onClose: () => void;
}

export const ReportePredictivoPreviewModal: React.FC<ReportePredictivoPreviewModalProps> = ({
  open,
  htmlDoc,
  insumoNombre,
  onClose,
}) => {
  const handleConfirmarImpresion = () => {
    if (htmlDoc) {
      imprimirDocumentoHtml(htmlDoc);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Vista Previa de Informe Predictivo Oficial (ML)"
      subtitle={insumoNombre ? `Inferencia de Demanda para: ${insumoNombre}` : 'Documento Oficial Imprimible Litográfico UAGRM'}
      maxWidth="md"
      actions={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            style={{ minWidth: 120 }}
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
            style={{ minWidth: 185 }}
          >
            Imprimir / Guardar PDF
          </Button>
        </>
      }
    >
      {htmlDoc ? (
        <Box
          sx={{
            width: '100%',
            height: '65vh',
            border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
            borderRadius: 2,
            overflow: 'hidden',
            backgroundColor: '#ffffff',
          }}
        >
          <iframe
            title="Vista previa del informe predictivo oficial"
            srcDoc={htmlDoc}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </Box>
      ) : (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate }}>
            Generando informe técnico de predicción...
          </Typography>
        </Box>
      )}
    </Modal>
  );
};

export default ReportePredictivoPreviewModal;
