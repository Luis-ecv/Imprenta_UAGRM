---
name: handoff
description: Protocolo de relevo para resumir el estado del proyecto, registrar vistas rediseñadas, decisiones tomadas y la siguiente acción atómica para continuar el trabajo entre sesiones o agentes sin pérdida de contexto.
---

# Skill: Handoff de Sesión y Control de Avance

Este protocolo garantiza que cualquier agente o sesión de trabajo pueda pausarse y reanudarse sin ambigüedades ni repetición de trabajo en el frontend de la Imprenta UAGRM.

---

## Cuándo Ejecutar este Skill

- Al concluir el rediseño de una vista o componente.
- Al final de una sesión de desarrollo antes de cerrar el entorno.
- Cuando una tarea compleja queda a la mitad y debe continuarla otro agente o el usuario más tarde.

---

## Formato del Documento de Handoff

El agente debe generar o actualizar un informe de relevo estructurado con los siguientes bloques:

### 1. Estado Actual de la Tarea
- **Vista o Módulo trabajado:** (ej. `frontend/src/pages/insumos/InsumosPage.tsx`)
- **Estado:** `[COMPLETADO]`, `[EN PROGRESO]` o `[BLOQUEADO]`.
- **Resumen del cambio:** Explicación técnica concisa de las mejoras implementadas (ej. migración a componentes MUI, integración con `uagrmTheme`, nuevos chips de stock).

### 2. Archivos Modificados / Creados
Lista explícita de archivos tocados durante la sesión con enlaces Markdown:
- `[Ruta](file:///c:/Users/Usua/Documents/Universidad/9%20no/Taller%20de%20grado/Imprenta_UAGRM/...)`

### 3. Decisiones de Diseño Tomadas
- Componentes MUI adoptados.
- Tratamiento de datos o estados de carga.
- Adaptaciones de responsive aplicadas.

### 4. Una Próxima Acción Inmediata (Siguiente Paso Atómico)
Definir con absoluta claridad **exactamente cuál es el siguiente archivo a rediseñar** y qué objetivo persigue. Ejemplo:
> *"Siguiente paso: Rediseñar `frontend/src/pages/insumos/StockAlertasPage.tsx` para alinear las tarjetas de advertencia de insumos críticos con los tokens `UAGRM_COLORS.red` y el estilo de tabla del Dashboard."*

### 5. Advertencias o Puntos de Atención
- Variables de entorno o dependencias requeridas.
- Validaciones pendientes con el backend o Docker.
