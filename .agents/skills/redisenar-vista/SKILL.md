---
name: redisenar-modulo
description: Guía metodológica para rediseñar módulos completos del frontend (1, 2 o 3 pantallas por módulo) garantizando la trazabilidad del dominio litográfico, la integridad de las rutas y el estándar visual de DashboardPage, Sidebar y uagrmTheme.
---

# Skill: Rediseño Modular y Trazabilidad Integral UAGRM

Este protocolo define el flujo de trabajo para rediseñar el frontend **módulo por módulo** sin dejar pantallas huérfanas, sin romper flujos de navegación y preservando la trazabilidad de la Imprenta Universitaria UAGRM (Metodología PUDS).

---

## 1. Clasificación Anatómica de Módulos

Al iniciar un módulo en `src/pages/<modulo>/`, el agente debe identificar cuántos archivos lo componen y aplicar el patrón correspondiente:

| Tipo de Módulo | Cantidad de Archivos | Ejemplos en el Proyecto | Flujo de Trazabilidad Requerido |
| :--- | :---: | :--- | :--- |
| **Módulo Analítico / Visor** | **1 archivo** | `ReportesPage.tsx`, `PrediccionesPage.tsx`, `BitacoraPage.tsx` | Métricas de cabecera, filtros de rango/fecha, gráficos interactivos con `recharts` o tabla de eventos. |
| **Módulo Maestro / Gestión** | **2 archivos** | `Clientes` (`ClientesPage` + `ClienteFormPage`), `Compras`, `Usuarios` | El listado contiene botones para "Nuevo" y "Editar" que navegan al formulario; el formulario valida con `react-hook-form` y al guardar retorna con feedback al listado. |
| **Módulo Operativo Complejo** | **3 archivos** | `Insumos` (`InsumosPage` + `InsumoFormPage` + `StockAlertasPage`), `Proformas` | Listado general + Formulario de captura técnica + Vista especializada (Alertas de inventario / Detalle de orden). |

---

## 2. Procedimiento de Ejecución en 5 Fases

### Fase 1: Mapeo y Trazabilidad de Contratos
Antes de tocar el código:
1. Inspeccionar **todos los archivos** del módulo dentro de `src/pages/<modulo>/`.
2. Verificar el archivo de API correspondiente en `src/api/<modulo>.api.ts`.
3. Verificar las interfaces TypeScript en `src/types/<modulo>.types.ts`.
4. **Regla de Trazabilidad:** NO cambiar nombres de endpoints, estructuras de payloads ni claves de objetos que rompan la comunicación con FastAPI o con otros módulos.

---

### Fase 2: Rediseño Armónico del Módulo
Todas las pantallas del módulo deben compartir una identidad visual uniforme:

1. **Cabeceras Coordinadas:**
   - Misma jerarquía tipográfica con `Typography variant="h4"` en azul corporativo (`UAGRM_COLORS.blue.dark`).
   - Breadcrumb o subtítulo contextual que indique el módulo litográfico.
2. **Estructura de Tarjetas y Grillas:**
   - Usar `<Grid container spacing={2.5}>` con sintaxis moderna `<Grid size={{ xs: 12, sm: ... }}>` (no usar `item`).
   - Tarjetas `Card` con `borderRadius: 3`, borde `UAGRM_COLORS.border` y sombra sutil.
3. **Formularios (`*FormPage.tsx`):**
   - Agrupar campos en secciones lógicas dentro de tarjetas (`Datos Generales`, `Parámetros Técnicos`, `Costos`).
   - Inputs con `TextField` de Material UI `size="small"` o `Select` con etiquetas claras.
   - Barra de acciones inferior fija o flotante con botón "Cancelar" (outlined) y "Guardar" (contained azul institucional).

---

### Fase 3: Integración y Navegación entre Pantallas del Módulo
- Comprobar que los botones `<Button component={Link} to="...">` o `useNavigate` dirijan a las rutas reales declaradas en `src/routes`.
- Si el módulo incluye alertas o detalles (ej. `StockAlertasPage`), asegurar que haya enlaces bidireccionales fluidos (ir a alertas desde el listado y volver al catálogo fácilmente).

---

### Fase 4: Limpieza de Caracteres y Cero Hardcodeo
- Corregir cualquier caracter corrupto heredado en textos o comentarios (`Gestión`, `Reposición`, `Catálogo`, `Órdenes`, `Mínimo`).
- Cero colores hexadecimales directos en el JSX: importar y usar `UAGRM_COLORS` desde `@/theme/uagrmTheme`.

---

### Fase 5: Validación Técnica de Cierre del Módulo
El módulo solo se considera terminado cuando:
1. No existen errores de compilación ni advertencias de tipos en TypeScript.
2. No se utiliza `any` en ninguna variable ni parámetro de función.
3. Se genera el reporte de relevo con el skill **`handoff`** indicando que el módulo completo quedó cerrado y cuál es el siguiente módulo de la lista.
