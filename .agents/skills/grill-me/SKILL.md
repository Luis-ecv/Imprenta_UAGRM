---
name: grill-me
description: Protocolo de alineación interactiva para desafiar supuestos, resolver dudas de UX/técnicas mediante preguntas concisas de opción múltiple y confirmar un plan antes de escribir código.
---

# Skill: Grill Me (Alineación Previa Anti-Ambigüedad)

Este skill se invoca **antes de implementar o rediseñar cualquier funcionalidad o vista** para erradicar suposiciones, alucinaciones y decisiones unilaterales del agente.

---

## Procedimiento Obligatorio

### Fase 1: Análisis de Decisiones Abiertas
Antes de proponer una solución o tocar código:
1. Inspeccionar los archivos existentes relacionados con la tarea.
2. Identificar las decisiones donde no hay una especificación única evidente:
   - **Estructura visual:** (¿Tarjetas KPIs arriba o tabla directa?).
   - **Flujo de interacción / UX:** (¿Modal emergente `Dialog` o página dedicada para formularios?).
   - **Comportamiento de datos:** (¿Paginación cliente vs servidor, filtros por pestañas vs selectores?).
   - **Permisos y roles:** (¿Deshabilitar botones o no renderizarlos según el rol?).

### Fase 2: Formulación de la Ronda de Preguntas
El agente debe formular entre 3 y 5 preguntas numeradas con opciones claras (A, B, C):
- Cada opción debe tener un impacto técnico o visual explícito.
- Se debe recomendar una opción cuando aporte mayor coherencia con el resto del sistema institucional (ej. `(Recomendado) Opción A`).
- El formato debe permitir al usuario responder rápidamente (ej. *"1A, 2B, 3A"*).

### Fase 3: Síntesis y Plan de Acción
Una vez recibidas las respuestas:
1. Resumir las decisiones tomadas en una tabla o lista concisa.
2. Generar el plan de implementación paso a paso (checklist atómico).
3. Solicitar confirmación explícita antes de crear o editar cualquier archivo.
