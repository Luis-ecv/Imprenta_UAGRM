# SISTEMA DE DISEÑO INSTITUCIONAL UAGRM — FRONTEND
**Software Integral de Gestión y Predicción de Insumos - Imprenta Universitaria UAGRM**

---

> **REGLA MANDATORIA PARA TODOS LOS AGENTES:**
> Todas las vistas del frontend DEBEN adherirse estrictamente al estándar visual y técnico establecido en `LoginPage.tsx`, `DashboardPage.tsx`, `Sidebar.tsx` y el tema central `uagrmTheme.ts`.
> Queda prohibido crear interfaces con estilos genéricos, colores arbitrarios no institucionales o estructuras desalineadas de este estándar.

---

## 1. PALETA DE COLORES INSTITUCIONAL (`UAGRM_COLORS`)

Importar siempre desde `@/theme/uagrmTheme`:
```typescript
import { UAGRM_COLORS } from '@/theme/uagrmTheme';
```

| Token | Hex | Propósito |
| :--- | :--- | :--- |
| `UAGRM_COLORS.blue.main` | `#1e2b4d` | Color primario corporativo, cabeceras, botones principales, acentos de navegación. |
| `UAGRM_COLORS.blue.dark` | `#141d34` | Estado hover de botones primarios, fondos oscuros contrastados. |
| `UAGRM_COLORS.blue.light`| `#344675` | Bordes activos, estados de foco, variantes suaves de azul. |
| `UAGRM_COLORS.red.main`  | `#800000` | Color institucional UAGRM (Guindo), botón secundario, acentos de marca, identidad. |
| `UAGRM_COLORS.red.dark`  | `#5d0000` | Hover del color secundario guindo. |
| `UAGRM_COLORS.red.light` | `#9c1c1c` | Alertas de stock crítico, avisos de alta prioridad. |
| `UAGRM_COLORS.cyan.main` | `#55a6bc` | Acentos informativos, predicciones ML, estadísticas destacadas. |
| `UAGRM_COLORS.cyan.light`| `#e8f4f7` | Fondos de chips informativos y badges de Machine Learning. |
| `UAGRM_COLORS.background.default` | `#f4f7fb` | Fondo general de todas las páginas de la aplicación. |
| `UAGRM_COLORS.background.paper`   | `#ffffff` | Fondo de tarjetas (`Card`), diálogos y paneles. |
| `UAGRM_COLORS.border`    | `#e2e8f0` | Borde estándar y sutil de tarjetas, tablas e inputs. |

---

## 2. COMPONENTES Y LIBRERÍAS DE UI AUTORIZADAS

1. **Maquetación y Estructura:** Material UI v5 (`@mui/material`).
   - Usar: `Box`, `Grid`, `Stack`, `Card`, `CardContent`, `Typography`, `Button`, `Chip`, `Divider`, `Tooltip`.
   - Para tablas: `Table`, `TableHead`, `TableRow`, `TableCell`, `TableBody`, `TableContainer`.
   - Para formularios: `TextField`, `Select`, `MenuItem`, `FormControl`, `InputLabel`, `Checkbox`, `InputAdornment`.
2. **Iconografía:** `lucide-react` (preferente en vistas y dashboard) y `@mui/icons-material` (en inputs o complementos).
   - Tamaño estándar de iconos en botones y métricas: `18px` a `20px`.
3. **Gráficos y Visualización:** `recharts` integrado dentro de tarjetas MUI con `ResponsiveContainer`.

---

## 3. ANATOMÍA OBLIGATORIA DE UNA VISTA

Cada página debe estructurarse con la siguiente jerarquía visual:

### A. Encabezado de la Página (`Page Header`)
```tsx
<Box sx={{ mb: 3.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
  <Box>
    <Typography variant="h4" sx={{ fontWeight: 780, color: UAGRM_COLORS.blue.dark, letterSpacing: '-0.02em', mb: 0.5 }}>
      Título de la Vista
    </Typography>
    <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.925rem' }}>
      Descripción concisa de la acción o módulo correspondiente.
    </Typography>
  </Box>
  <Stack direction="row" spacing={1.5}>
    {/* Botones de acción principal (ej. Exportar, Nuevo Registro) */}
  </Stack>
</Box>
```

### B. Tarjeta Contenedora Principal (`Content Card`)
```tsx
<Card
  elevation={0}
  sx={{
    borderRadius: 3,
    border: `1px solid ${UAGRM_COLORS.border}`,
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  }}
>
  {/* Contenido de la vista (Filtros, Tablas, Formularios) */}
</Card>
```

### C. Chips de Estado (`Status Chips`)
No usar colores planos chillones. Emplear combinaciones con fondo suave y borde a tono:
- **Registrado / Pendiente:** Fondo `#f1f5f9`, texto `#475569`, borde `#cbd5e1`.
- **En Cola / Advertencia:** Fondo `#fef3c7`, texto `#b45309`, borde `#fde68a`.
- **En Proceso / Impresión:** Fondo `#e0f2fe`, texto `#0369a1`, borde `#bae6fd`.
- **Completado / Activo:** Fondo `#dcfce7`, texto `#15803d`, borde `#bbf7d0`.
- **Cancelado / Inactivo / Crítico:** Fondo `#fee2e2`, texto `#b91c1c`, borde `#fecaca`.

---

## 4. REGLAS DE CODIFICACIÓN PARA LA UI

1. **Cero Valores Hardcodeados:** Usar siempre `UAGRM_COLORS` y constantes de configuración.
2. **TypeScript Estricto:** Prohibido el uso de `any`. Todas las respuestas y props de componentes deben tener interfaz explícita importada desde `@/types`.
3. **Manejo de Carga y Vacío:** Toda tabla o lista debe contemplar:
   - Estado de carga con `CircularProgress` o skeleton estilizado.
   - Estado vacío ilustrativo con icono de `lucide-react`, título claro y botón de acción si corresponde.
4. **Interactividad:** Los botones e items clicables deben incluir transiciones suaves (`transition: all 0.2s ease`).
