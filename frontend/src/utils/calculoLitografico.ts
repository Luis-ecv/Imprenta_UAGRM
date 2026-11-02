import type { Modalidad } from '@/types';

export interface CalculoLitograficoResult {
  hojas: number;
  costoPapel: number;
  costoTinta: number;
  costoPlanchas: number;
  costoManoObra: number;
  total: number;
}

/**
 * Cálculo paramétrico técnico oficial UAGRM para cotizaciones litográficas.
 * Calcula los pliegos (hojas a doble cara), tinta CMYK, planchas CTP y mano de obra.
 */
export function calcularCostosLitograficos(
  modalidad: Modalidad,
  tiraje: number,
  numeroPaginas: number
): CalculoLitograficoResult {
  const safeTiraje = Math.max(0, Number(tiraje) || 0);
  const safePaginas = Math.max(0, Number(numeroPaginas) || 0);

  // Pliegos = (Tiraje * Páginas) / 2 páginas por pliego doble cara
  const hojas = Math.ceil((safeTiraje * safePaginas) / 2);

  // Costo Papel: 0 si la modalidad es insumos_cliente
  const costoPapel = modalidad === 'insumos_imprenta' ? Number((hojas * 0.45).toFixed(2)) : 0;
  const costoTinta = Number((safeTiraje * safePaginas * 0.04).toFixed(2));
  const costoPlanchas = 150 * 4; // 4 planchas CTP térmicas (CMYK) = 600 Bs
  const costoManoObra = Number((50 + safeTiraje * 0.05).toFixed(2));
  const total = Number((costoPapel + costoTinta + costoPlanchas + costoManoObra).toFixed(2));

  return {
    hojas,
    costoPapel,
    costoTinta,
    costoPlanchas,
    costoManoObra,
    total,
  };
}
