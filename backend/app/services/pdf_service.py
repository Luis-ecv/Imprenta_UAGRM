"""
Servicio de Generación de Documentos y Reportes (HTML / PDF).
Compila proformas oficiales y reportes predictivos de compras con el membrete institucional de la UAGRM.
"""
from app.models.proforma import Proforma


def generar_html_proforma(proforma: Proforma) -> str:
    """Genera la plantilla HTML institucional lista para impresión o exportación a PDF."""
    detalles_filas = ""
    for idx, d in enumerate(proforma.detalles, 1):
        detalles_filas += f"""
        <tr>
            <td style="text-align: center; border: 1px solid #ddd; padding: 8px;">{idx}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">
                <strong>{d.descripcion_trabajo}</strong><br>
                <small style="color: #666;">Tiraje: {d.tiraje:,} ejemplares | Páginas: {d.paginas_totales}</small>
            </td>
            <td style="text-align: right; border: 1px solid #ddd; padding: 8px;">Bs. {float(d.costo_papel):.2f}</td>
            <td style="text-align: right; border: 1px solid #ddd; padding: 8px;">Bs. {float(d.costo_tinta):.2f}</td>
            <td style="text-align: right; border: 1px solid #ddd; padding: 8px;">Bs. {float(d.costo_planchas):.2f}</td>
            <td style="text-align: right; border: 1px solid #ddd; padding: 8px;">Bs. {float(d.costo_mano_obra):.2f}</td>
            <td style="text-align: right; border: 1px solid #ddd; padding: 8px; font-weight: bold;">Bs. {float(d.subtotal):.2f}</td>
        </tr>
        """

    cliente_nombre = proforma.cliente.razon_social if proforma.cliente else "Cliente General"
    cliente_fac = proforma.cliente.codigo_facultad or "" if proforma.cliente else ""
    cliente_nit = proforma.cliente.ci_nit or "S/N" if proforma.cliente else "S/N"
    fecha_emision = proforma.fecha_emision.strftime("%d/%m/%Y") if proforma.fecha_emision else ""
    fecha_vencimiento = proforma.fecha_vencimiento.strftime("%d/%m/%Y") if proforma.fecha_vencimiento else ""

    html = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Proforma Oficial {proforma.codigo_proforma}</title>
    <style>
        body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 30px; font-size: 13px; }}
        .header {{ border-bottom: 3px solid #1E3A8A; padding-bottom: 15px; margin-bottom: 20px; }}
        .titulo {{ color: #1E3A8A; margin: 0; font-size: 22px; text-transform: uppercase; }}
        .subtitulo {{ color: #9B1C1C; margin: 3px 0 0 0; font-size: 14px; font-weight: bold; }}
        .box-info {{ display: flex; justify-content: space-between; margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 15px; }}
        th {{ background-color: #1E3A8A; color: white; border: 1px solid #1E3A8A; padding: 10px; font-size: 12px; }}
        .total-box {{ text-align: right; margin-top: 20px; font-size: 16px; font-weight: bold; color: #1E3A8A; }}
        .firmas {{ margin-top: 60px; display: flex; justify-content: space-around; text-align: center; }}
        .linea-firma {{ width: 200px; border-top: 1px solid #333; padding-top: 5px; }}
    </style>
</head>
<body>
    <div class="header">
        <h1 class="titulo">Editorial e Imprenta Universitaria</h1>
        <div class="subtitulo">Universidad Autónoma Gabriel René Moreno (UAGRM)</div>
        <div style="font-size: 11px; color: #666; margin-top: 4px;">Santa Cruz de la Sierra - Bolivia</div>
    </div>

    <table style="margin-bottom: 20px; border: none;">
        <tr>
            <td style="width: 50%; vertical-align: top; border: none;">
                <strong>CLIENTE / SOLICITANTE:</strong> {cliente_nombre} ({cliente_fac})<br>
                <strong>NIT / CI:</strong> {cliente_nit}<br>
                <strong>MODALIDAD:</strong> {proforma.modalidad.replace('_', ' ').upper()}
            </td>
            <td style="width: 50%; vertical-align: top; text-align: right; border: none;">
                <span style="font-size: 18px; color: #9B1C1C; font-weight: bold;">{proforma.codigo_proforma}</span><br>
                <strong>Fecha Emisión:</strong> {fecha_emision}<br>
                <strong>Fecha Vencimiento:</strong> {fecha_vencimiento}<br>
                <strong>Estado:</strong> {proforma.estado}
            </td>
        </tr>
    </table>

    <table>
        <thead>
            <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 35%;">Descripción del Trabajo</th>
                <th style="width: 10%;">Papel</th>
                <th style="width: 10%;">Tinta</th>
                <th style="width: 10%;">Planchas</th>
                <th style="width: 12%;">Mano Obra</th>
                <th style="width: 18%;">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            {detalles_filas}
        </tbody>
    </table>

    <div class="total-box">
        TOTAL PRESUPUESTO: Bs. {float(proforma.total_presupuesto):.2f}
    </div>

    <div style="margin-top: 30px; font-size: 11px; color: #666;">
        <em>* Validez de la proforma sujeta a la fecha de vencimiento indicada. Los costos de insumos pueden variar conforme aranceles vigentes.</em>
    </div>

    <div class="firmas">
        <div class="linea-firma">Operador de Mostrador</div>
        <div class="linea-firma">Jefe de Imprenta / Administrador</div>
        <div class="linea-firma">Cliente / Solicitante</div>
    </div>
</body>
</html>
"""
    return html
