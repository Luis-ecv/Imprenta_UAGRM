import type { OrdenCompraResponse, ProveedorResponse } from '@/types';
import { formatearMoneda, formatearFecha } from '@/utils/formatters';

/**
 * Genera la plantilla HTML oficial para la Orden de Compra Litográfica de la UAGRM.
 * Replica el diseño y estándares institucionales de las proformas oficiales:
 * - Membrete oficial UAGRM (Azul institucional #1E3A8A y Rojo rubí #9B1C1C).
 * - Código formal de orden (#OC-XXXX).
 * - Padrón de proveedor y datos de contacto/NIT.
 * - Tabla técnica de insumos y materiales presupuestados.
 * - Desglose de totales y condiciones de recepción en almacén litográfico.
 * - Líneas de firma reglamentarias.
 */
export function generarHtmlOrdenCompra(
  compra: OrdenCompraResponse,
  proveedorCustom?: ProveedorResponse | null
): string {
  const prov = proveedorCustom || compra.proveedor;
  const codigoOC = `#OC-${String(compra.id_orden_compra).padStart(4, '0')}`;
  const proveedorNombre = prov?.razon_social || `Proveedor #${compra.proveedor_id}`;
  const proveedorNit = prov?.nit ? prov.nit : 'S/N';
  const proveedorContacto = prov?.contacto || 'Almacén Central / Ventas';
  const proveedorTelefono = prov?.telefono || 'No registrado';
  const proveedorEmail = prov?.email || 'No registrado';
  const proveedorDireccion = prov?.direccion || 'Santa Cruz de la Sierra, Bolivia';

  const fechaEmision = formatearFecha(compra.fecha_generacion);
  const totalEstimadoNum = Number(compra.total_estimado || 0);
  const totalFormateado = formatearMoneda(totalEstimadoNum);
  const estadoTexto = (compra.estado || 'SUGERIDA').toUpperCase();

  const origenPredictivo = compra.prediccion_id
    ? `Generada automáticamente por Inferencia de Machine Learning (Demanda Bimestral #ML-${compra.prediccion_id})`
    : 'Reposición programada de stock para el taller litográfico';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Orden de Compra Oficial ${codigoOC} - Imprenta UAGRM</title>
  <style>
    @page {
      size: letter;
      margin: 14mm 15mm 15mm 15mm;
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #1f2937;
      margin: 25px;
      font-size: 13px;
      line-height: 1.45;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header {
      border-bottom: 3px solid #1E3A8A;
      padding-bottom: 14px;
      margin-bottom: 18px;
    }
    .titulo {
      color: #1E3A8A;
      margin: 0;
      font-size: 21px;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: -0.01em;
    }
    .subtitulo {
      color: #9B1C1C;
      margin: 3px 0 0 0;
      font-size: 13.5px;
      font-weight: 700;
    }
    .sede {
      font-size: 11px;
      color: #64748b;
      margin-top: 3px;
    }
    .tabla-info {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
    }
    .tabla-info td {
      padding: 12px 14px;
      vertical-align: top;
      border: none;
    }
    .info-label {
      font-size: 10px;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 700;
      letter-spacing: 0.04em;
      margin-bottom: 2px;
    }
    .codigo-oc {
      font-size: 19px;
      color: #9B1C1C;
      font-weight: 900;
      letter-spacing: -0.02em;
    }
    .badge-estado {
      display: inline-block;
      padding: 3px 9px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      margin-top: 4px;
      background-color: #e2e8f0;
      color: #334155;
    }
    .badge-RECIBIDA { background-color: #dcfce7; color: #15803d; }
    .badge-ENVIADA { background-color: #e0f2fe; color: #0369a1; }
    .badge-APROBADA { background-color: #fef3c7; color: #b45309; }
    .badge-SUGERIDA { background-color: #f1f5f9; color: #475569; }
    .badge-CANCELADA { background-color: #fee2e2; color: #b91c1c; }

    table.items-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    table.items-table th {
      background-color: #1E3A8A;
      color: #ffffff;
      border: 1px solid #1E3A8A;
      padding: 10px 12px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    table.items-table td {
      border: 1px solid #e2e8f0;
      padding: 10px 12px;
      font-size: 12.5px;
    }
    table.items-table tr:nth-child(even) td {
      background-color: #f8fafc;
    }

    .total-box {
      text-align: right;
      margin-top: 18px;
      font-size: 16px;
      font-weight: bold;
      color: #1E3A8A;
      padding: 10px 12px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
    }
    .nota-almacen {
      margin-top: 24px;
      font-size: 11.5px;
      color: #475569;
      background-color: #f8fafc;
      border-left: 3px solid #1E3A8A;
      padding: 9px 12px;
      border-radius: 0 4px 4px 0;
    }
    .firmas {
      margin-top: 60px;
      display: flex;
      justify-content: space-around;
      text-align: center;
    }
    .linea-firma {
      width: 200px;
      border-top: 1px solid #334155;
      padding-top: 6px;
      font-size: 11px;
      font-weight: 700;
      color: #1e293b;
    }
    .cargo-firma {
      font-size: 10px;
      color: #64748b;
      margin-top: 2px;
    }

    @media print {
      body {
        margin: 0;
        padding: 5mm;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <!-- Encabezado Institucional -->
  <div class="header">
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <h1 class="titulo">Editorial e Imprenta Universitaria</h1>
        <div class="subtitulo">Universidad Autónoma Gabriel René Moreno (UAGRM)</div>
        <div class="sede">Santa Cruz de la Sierra - Bolivia · División de Adquisiciones y Suministros</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 11px; color: #1E3A8A; font-weight: 800; text-transform: uppercase;">
          Orden de Compra Oficial
        </div>
        <div class="codigo-oc">${codigoOC}</div>
        <div class="badge-estado badge-${estadoTexto}">${estadoTexto}</div>
      </div>
    </div>
  </div>

  <!-- Información de Proveedor y Fechas -->
  <table class="tabla-info">
    <tr>
      <td style="width: 55%;">
        <div class="info-label">Proveedor Adjudicado</div>
        <div style="font-size: 14px; font-weight: 800; color: #0f172a;">${proveedorNombre}</div>
        <div style="font-size: 11.5px; color: #334155; margin-top: 2px;">
          <strong>NIT:</strong> ${proveedorNit} &nbsp;|&nbsp; <strong>Contacto:</strong> ${proveedorContacto}
        </div>
        <div style="font-size: 11.5px; color: #475569; margin-top: 1px;">
          <strong>Teléfono:</strong> ${proveedorTelefono} &nbsp;|&nbsp; <strong>Email:</strong> ${proveedorEmail}
        </div>
        <div style="font-size: 11.5px; color: #475569; margin-top: 1px;">
          <strong>Dirección:</strong> ${proveedorDireccion}
        </div>
      </td>
      <td style="width: 45%; border-left: 1px solid #e2e8f0;">
        <div class="info-label">Datos de Emisión y Entrega</div>
        <div style="font-size: 12px; margin-bottom: 3px;">
          <strong>Fecha de Emisión:</strong> ${fechaEmision}
        </div>
        <div style="font-size: 12px; margin-bottom: 3px;">
          <strong>Punto de Recepción:</strong> Almacén Central Litográfico • Ciudad Universitaria UAGRM
        </div>
        <div style="font-size: 11.5px; color: #475569;">
          <strong>Motivo:</strong> ${origenPredictivo}
        </div>
      </td>
    </tr>
  </table>

  <!-- Tabla de Insumos y Materiales -->
  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 6%; text-align: center;">#</th>
        <th style="width: 18%; text-align: left;">Código / Ítem</th>
        <th style="width: 46%; text-align: left;">Descripción del Insumo / Especificaciones</th>
        <th style="width: 12%; text-align: center;">Cantidad</th>
        <th style="width: 18%; text-align: right;">Total Presupuesto</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align: center; font-weight: 700;">1</td>
        <td>
          <strong>MAT-LIT-01</strong><br>
          <small style="color: #64748b;">Insumos Litográficos</small>
        </td>
        <td>
          <strong>Lote Consolidado de Insumos y Materia Prima Litográfica</strong><br>
          <small style="color: #64748b;">
            Reposición de sustratos de papel (couche/bond), tintas offset de cuatricromía, planchas térmicas CTP y químicos de acabado para tirajes del taller.
          </small>
        </td>
        <td style="text-align: center;">1 Lote</td>
        <td style="text-align: right; font-weight: 800; color: #1E3A8A;">${totalFormateado}</td>
      </tr>
    </tbody>
  </table>

  <!-- Cuadro de Total Presupuestado -->
  <div class="total-box">
    TOTAL PRESUPUESTADO DE ADQUISICIÓN: ${totalFormateado}
  </div>

  <!-- Condiciones y Control de Calidad -->
  <div class="nota-almacen">
    <strong>Condiciones Generales de Entrega y Recepción:</strong>
    <ul style="margin: 4px 0 0 16px; padding: 0;">
      <li>Todo insumo entregado debe corresponder a lotes nuevos, empaquetados y debidamente rotulados.</li>
      <li>La entrega se formaliza mediante la presentación de la Factura Oficial o Nota de Entrega debidamente firmada.</li>
      <li>El ingreso físico valorado al inventario del taller se registrará tras la inspección de conformidad del encargado de almacén.</li>
    </ul>
  </div>

  <!-- Firmas Reglamentarias -->
  <div class="firmas">
    <div class="linea-firma">
      Encargado de Almacén y Compras
      <div class="cargo-firma">Imprenta Universitaria UAGRM</div>
    </div>
    <div class="linea-firma">
      Jefe de Imprenta / Administrador
      <div class="cargo-firma">Dirección Administrativa UAGRM</div>
    </div>
    <div class="linea-firma">
      Proveedor Adjudicado
      <div class="cargo-firma">Firma y Sello de Recepción</div>
    </div>
  </div>
</body>
</html>`;
}
