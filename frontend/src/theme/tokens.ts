/**
 * Design Tokens — Editorial e Imprenta Universitaria UAGRM
 * Fuente de verdad única para colores, tipografías, bordes y sombras.
 * Diseñado bajo directrices del Sistema Institucional UAGRM para evitar código quemado.
 */

export const UAGRM_TOKENS = {
  colors: {
    // Aliases semánticos directos
    primaryDark: '#141d34',
    royalBlue: '#1e2b4d',
    ruby: '#dc2626',
    emerald: '#10b981',
    amber: '#f59e0b',
    cyan: '#55a6bc',
    charcoal: '#0f172a',
    slate: '#64748b',
    mutedSlate: '#94a3b8',

    // Azul Marino Institucional (Color Primario)
    primary: {
      main: '#1e2b4d',
      dark: '#141d34',
      light: '#344675',
      contrastText: '#ffffff',
    },
    // Rojo Guindo Institucional (Color Secundario / Acción Clave)
    secondary: {
      main: '#800000',
      dark: '#5d0000',
      light: '#9c1c1c',
      contrastText: '#ffffff',
    },
    // Celeste Institucional (Acentos e Indicadores)
    accent: {
      main: '#55a6bc',
      dark: '#3a7f92',
      light: '#e8f4f7',
      contrastText: '#ffffff',
    },
    // Fondos Estructurados
    background: {
      default: '#f4f7fb',
      paper: '#ffffff',
      subtle: '#f8fafc',
      card: '#ffffff',
    },
    // Tipografía y Jerarquía Textual
    text: {
      primary: '#0f172a',    // Texto principal de alto contraste
      secondary: '#64748b',  // Subtítulos y metadatos
      muted: '#94a3b8',      // Placeholders y marcas de tiempo
      leadHeader: '#475569', // Cabeceras de tabla institucional
      white: '#ffffff',
    },
    // Bordes y Delimitadores
    border: {
      default: '#e2e8f0',
      light: '#f0ede6',      // Línea divisoria suave de tablas
      strong: '#cbd5e1',
    },
    // Estandarización de Tablas Litográficas
    table: {
      headerText: '#475569',
      headerBg: '#faf8f5',
      rowBorder: '#f0ede6',
      rowHover: '#f8fafc',
    },
    // Estados Semánticos (Alertas, Badges y Notificaciones)
    status: {
      success: {
        main: '#10b981',
        dark: '#047857',
        light: '#ecfdf5',
        border: '#a7f3d0',
        text: '#065f46',
      },
      error: {
        main: '#dc2626',
        dark: '#b91c1c',
        light: '#fef2f2',
        border: '#fecaca',
        text: '#991b1b',
      },
      warning: {
        main: '#f59e0b',
        dark: '#b45309',
        light: '#fef3c7',
        border: '#fde68a',
        text: '#92400e',
      },
      info: {
        main: '#0284c7',
        dark: '#0369a1',
        light: '#e0f2fe',
        border: '#bae6fd',
        text: '#075985',
      },
    },
  },
  border: {
    subtle: '#e2e8f0',
    focus: '#cbd5e1',
    danger: '#fecaca',
    divider: '#f0ede6',
  },
  background: {
    default: '#f4f7fb',
    paper: '#ffffff',
    subtle: '#f8fafc',
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    weights: {
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
      extraBold: 800,
    },
  },
  radii: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '14px',
    card: '16px',
    pill: 50, // Formato píldora estricto para botones y badges UAGRM
    full: '9999px',
  },
  shadows: {
    card: '0 2px 10px rgba(0, 0, 0, 0.03)',
    cardHover: '0 8px 24px rgba(0, 0, 0, 0.06)',
    modal: '0 20px 40px rgba(0, 0, 0, 0.15)',
    buttonPrimary: '0 4px 14px rgba(30, 43, 77, 0.25)',
    buttonSecondary: '0 4px 14px rgba(128, 0, 0, 0.25)',
  },
} as const;

/**
 * Compatibilidad hacia atrás con UAGRM_COLORS
 * Asegura que ningún archivo existente se rompa al migrar a tokens.
 */
export const UAGRM_COLORS = {
  red: UAGRM_TOKENS.colors.secondary,
  blue: UAGRM_TOKENS.colors.primary,
  cyan: UAGRM_TOKENS.colors.accent,
  background: UAGRM_TOKENS.colors.background,
  border: UAGRM_TOKENS.colors.border.default,
  table: UAGRM_TOKENS.colors.table,
  text: UAGRM_TOKENS.colors.text,
  status: UAGRM_TOKENS.colors.status,
};

export default UAGRM_TOKENS;
