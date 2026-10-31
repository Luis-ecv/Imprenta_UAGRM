import { createTheme, alpha } from '@mui/material/styles';

/**
 * Tema Institucional UAGRM para Material UI
 * Sistema Integral de Gestión y Predicción de Insumos - Imprenta Universitaria
 */

// Colores institucionales oficiales
export const UAGRM_COLORS = {
  // Rojo Guindo Institucional
  red: {
    main: '#800000',
    dark: '#5d0000',
    light: '#9c1c1c',
    contrastText: '#ffffff',
  },
  // Azul Marino Corporativo
  blue: {
    main: '#1e2b4d',
    dark: '#141d34',
    light: '#344675',
    contrastText: '#ffffff',
  },
  // Celeste Institucional (Acentos)
  cyan: {
    main: '#55a6bc',
    dark: '#3a7f92',
    light: '#e8f4f7',
    contrastText: '#ffffff',
  },
  // Fondos y bordes
  background: {
    default: '#f4f7fb',
    paper: '#ffffff',
    subtle: '#f8fafc',
  },
  border: '#e2e8f0',
};

export const uagrmTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: UAGRM_COLORS.blue.main,
      dark: UAGRM_COLORS.blue.dark,
      light: UAGRM_COLORS.blue.light,
      contrastText: UAGRM_COLORS.blue.contrastText,
    },
    secondary: {
      main: UAGRM_COLORS.red.main,
      dark: UAGRM_COLORS.red.dark,
      light: UAGRM_COLORS.red.light,
      contrastText: UAGRM_COLORS.red.contrastText,
    },
    info: {
      main: UAGRM_COLORS.cyan.main,
      dark: UAGRM_COLORS.cyan.dark,
      light: UAGRM_COLORS.cyan.light,
      contrastText: UAGRM_COLORS.cyan.contrastText,
    },
    success: {
      main: '#10b981',
      dark: '#047857',
      light: '#d1fae5',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b',
      dark: '#b45309',
      light: '#fef3c7',
      contrastText: '#ffffff',
    },
    error: {
      main: '#dc2626',
      dark: '#991b1b',
      light: '#fee2e2',
      contrastText: '#ffffff',
    },
    background: {
      default: UAGRM_COLORS.background.default,
      paper: UAGRM_COLORS.background.paper,
    },
    text: {
      primary: '#0f172a',
      secondary: '#334155',
    },
    divider: UAGRM_COLORS.border,
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: [
      '"Plus Jakarta Sans"',
      '"Inter"',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 800, color: UAGRM_COLORS.blue.main },
    h2: { fontWeight: 800, color: UAGRM_COLORS.blue.main },
    h3: { fontWeight: 800, color: UAGRM_COLORS.blue.main },
    h4: { fontWeight: 800, color: UAGRM_COLORS.blue.main },
    h5: { fontWeight: 700, color: UAGRM_COLORS.blue.main },
    h6: { fontWeight: 700, color: UAGRM_COLORS.blue.main },
    subtitle1: { color: '#334155', fontWeight: 600 },
    subtitle2: { color: '#334155', fontWeight: 600 },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 50,
          padding: '8px 18px',
          transition: 'all 0.2s ease-in-out',
          '&.MuiButton-containedPrimary': {
            backgroundColor: UAGRM_COLORS.blue.main,
            color: '#ffffff',
            '&:hover': {
              backgroundColor: UAGRM_COLORS.blue.dark,
              boxShadow: `0 4px 12px ${alpha(UAGRM_COLORS.blue.main, 0.25)}`,
            },
          },
          '&.MuiButton-containedSecondary': {
            backgroundColor: UAGRM_COLORS.red.main,
            color: '#ffffff',
            '&:hover': {
              backgroundColor: UAGRM_COLORS.red.dark,
              boxShadow: `0 4px 12px ${alpha(UAGRM_COLORS.red.main, 0.25)}`,
            },
          },
          '&.MuiButton-outlinedPrimary': {
            borderColor: UAGRM_COLORS.blue.main,
            color: UAGRM_COLORS.blue.main,
            '&:hover': {
              backgroundColor: alpha(UAGRM_COLORS.blue.main, 0.04),
              borderColor: UAGRM_COLORS.blue.dark,
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${UAGRM_COLORS.border}`,
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#64748b',
          fontSize: '0.875rem',
          fontWeight: 500,
          '&.Mui-focused': {
            color: '#1e2b4d',
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: '#94a3b8',
          fontSize: '0.75rem',
          marginTop: '4px',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#ffffff',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: UAGRM_COLORS.blue.light,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: UAGRM_COLORS.blue.main,
            borderWidth: 2,
          },
          '&.Mui-focused': {
            boxShadow: `0 0 0 3px ${alpha(UAGRM_COLORS.blue.main, 0.12)}`,
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: '#dc2626',
          },
          '&.Mui-error.Mui-focused': {
            boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.15)',
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: UAGRM_COLORS.background.subtle,
          '& .MuiTableCell-head': {
            fontWeight: 600,
            color: UAGRM_COLORS.blue.main,
            borderBottom: `2px solid ${UAGRM_COLORS.border}`,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: alpha(UAGRM_COLORS.cyan.light, 0.5),
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: UAGRM_COLORS.border,
          padding: '12px 16px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 6,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 14,
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: UAGRM_COLORS.blue.main,
          borderRadius: 6,
          fontSize: '0.75rem',
        },
      },
    },
  },
});
