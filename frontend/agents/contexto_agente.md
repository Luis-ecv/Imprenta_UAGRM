# CONTEXTO DEL AGENTE — FRONTEND

## Software Integral de Gestión y Predicción de Insumos - Imprenta Universitaria UAGRM

---

> Este archivo define las reglas, el contexto del dominio y las convenciones que
> cualquier agente de IA debe seguir al trabajar en el código del **frontend**.
> Formato: Markdown estándar. Compatible con Kiro, Cursor, GitHub Copilot, Claude y cualquier agente que lea archivos de contexto.

---

## 1. IDENTIDAD DEL PROYECTO

**Nombre del sistema:** Software Integral de Gestión y Predicción de Insumos mediante Machine Learning para la Imprenta Universitaria de la UAGRM.

**Institución:** Editorial e Imprenta Universitaria — Universidad Autónoma Gabriel René Moreno (UAGRM), Santa Cruz, Bolivia.

**Propósito del frontend:** Proveer la interfaz gráfica (SPA) que permite al personal de la imprenta gestionar proformas, órdenes de trabajo, inventario, compras y visualizar predicciones de demanda. La interfaz se adapta según el rol del usuario autenticado.

**Metodología de desarrollo:** Proceso Unificado de Desarrollo de Software (PUDS).

---

## 2. STACK TECNOLÓGICO DEL FRONTEND

| Componente   | Tecnología      | Versión           |
| ------------ | --------------- | ----------------- |
| Lenguaje     | TypeScript      | 5 (modo estricto) |
| Framework UI | React           | 18                |
| Build tool   | Vite            | 5                 |
| Estilos      | Tailwind CSS    | 3                 |
| Routing      | React Router    | v6                |
| HTTP client  | Axios           | 1.7               |
| Formularios  | React Hook Form | 7.53              |
| Gráficos     | Recharts        | 2.12              |
| Iconos       | Heroicons       | 2.1               |
| Fechas       | date-fns        | 4.1               |
| Runtime prod | Nginx (Alpine)  | latest            |

---

## 3. ARQUITECTURA INTERNA

El frontend sigue una separación estricta por responsabilidades:

```
pages/          ← orquestan una pantalla completa (lógica + layout)
    ↓ usa
components/     ← componentes reutilizables y puros (sin lógica de negocio)
    ↓ usa
hooks/          ← lógica reutilizable (estado, efectos, llamadas a API)
    ↓ usa
api/            ← funciones que llaman al backend (una por recurso)
    ↓ usa
api/client.ts   ← instancia Axios con JWT en memoria + interceptors

context/        ← estado global (AuthContext, AlertasContext)
types/          ← interfaces TypeScript del dominio
routes/         ← configuración de rutas protegidas por auth y rol
utils/          ← funciones puras (formatters, validators, constants)
```

**Regla de oro:** Los `components/` son puros y reutilizables — no hacen llamadas a la API directamente. La lógica de negocio vive en `pages/` y `hooks/`.

---

## 4. MÓDULOS DE LA SPA (secciones del sistema)

| Módulo             | Ruta base         | Roles con acceso         |
| ------------------ | ----------------- | ------------------------ |
| Login              | `/login`          | Público                  |
| Dashboard          | `/`               | Todos                    |
| Insumos            | `/insumos`        | Admin, Mostrador, Taller |
| Clientes           | `/clientes`       | Admin, Mostrador         |
| Proformas          | `/proformas`      | Admin, Mostrador         |
| Órdenes de Trabajo | `/ordenes`        | Admin, Mostrador, Taller |
| Compras            | `/compras`        | Admin                    |
| Predicciones ML    | `/predicciones`   | Admin                    |
| Reportes           | `/reportes`       | Admin                    |
| Administración     | `/administracion` | Admin, Superadmin        |
| Bitácora           | `/bitacora`       | Superadmin               |

---

## 5. REGLAS DE NEGOCIO CRÍTICAS (reflejan el backend)

### 5.1 Autenticación y roles

- El token JWT se guarda **en memoria** (variable en `api/client.ts`), NUNCA en `localStorage` ni `sessionStorage`.
- Al expirar el token (respuesta 401), el interceptor de Axios limpia la sesión y redirige a `/login`.
- El `AuthContext` expone: `usuario`, `isAuthenticated`, `rol`, `login()`, `logout()`.
- Los 4 roles del sistema: `Superadministrador`, `Administrador`, `Operador Mostrador`, `Operador Taller`.

### 5.2 Proformas

- Una proforma tiene **múltiples ítems** (componente de lista dinámica en el formulario).
- La vigencia (días) es configurable al crear. Mostrar fecha de vencimiento calculada en tiempo real.
- Dos modalidades: `insumos_imprenta` / `insumos_cliente`. Al seleccionar `insumos_cliente`, ocultar el campo de costo de papel en la proforma.
- Estados con colores: `emitida` (gris), `aprobada` (verde), `rechazada` (rojo), `vencida` (naranja), `cerrada` (azul).

### 5.3 Órdenes de Trabajo

- El tablero de órdenes muestra las órdenes agrupadas por estado con colores diferenciados.
- La secuencia de estados es OBLIGATORIA (no se puede saltar):
  `Registrado → En Cola → En Impresion → En Acabado → Finalizado → Entregado`
- Los colores por estado están definidos en `utils/constants.ts` (`COLORES_ESTADO_ORDEN`).
- Solo `Administrador` y `Superadministrador` pueden crear órdenes directas (sin proforma).
- Al marcar `Finalizado`, mostrar automáticamente el formulario de consumo real.

### 5.4 Inventario y alertas

- Si un insumo tiene `alerta_stock: true` en la respuesta del backend, mostrar badge rojo en la lista.
- El `AlertasContext` debe verificar periódicamente el stock y mostrar notificaciones toast.
- Las alertas de stock crítico se muestran en el Dashboard y en la página de Insumos.

### 5.5 Predicciones ML

- Mostrar gráficos de barras (Recharts) con cantidades proyectadas por insumo.
- Si `es_referencial: true`, mostrar advertencia visible: "Predicción referencial — histórico insuficiente".
- Permitir exportar el reporte predictivo (llamar al endpoint de exportación).

---

## 6. TIPOS TYPESCRIPT DEL DOMINIO

Los tipos viven en `src/types/`. Siempre importar desde ahí, nunca definir tipos inline en componentes.

### Tipos clave en `common.types.ts`:

```typescript
type EstadoOrden =
  | "Registrado"
  | "En Cola"
  | "En Impresion"
  | "En Acabado"
  | "Finalizado"
  | "Entregado";
type EstadoProforma =
  | "emitida"
  | "aprobada"
  | "rechazada"
  | "vencida"
  | "cerrada";
type Modalidad = "insumos_imprenta" | "insumos_cliente";
type TipoCliente =
  | "facultad"
  | "docente"
  | "autoridad"
  | "estudiante"
  | "particular";
type RolSistema =
  | "Superadministrador"
  | "Administrador"
  | "Operador Mostrador"
  | "Operador Taller";

interface UsuarioAutenticado {
  sub: string; // email
  nombre: string;
  rol: RolSistema;
  id: number;
  exp: number;
}

interface RespuestaPaginada<T> {
  total: number;
  pagina: number;
  por_pagina: number;
  datos: T[];
}
```

---

## 7. CONVENCIONES DE CÓDIGO

### Nomenclatura TypeScript/React

```typescript
// Componentes: PascalCase
function ProformaFormPage() { ... }

// Hooks: camelCase con prefijo use
function useAuth() { ... }

// Tipos e interfaces: PascalCase con sufijo descriptivo
interface InsumoResponse { ... }
interface ProformaCreate { ... }

// Variables y funciones: camelCase
const calcularSubtotal = (cantidad: number, precio: number): number => ...

// Constantes globales: UPPER_SNAKE_CASE
const MAX_ITEMS_PROFORMA = 20

// Archivos:
// Componentes/Pages: PascalCase.tsx
// Hooks/Utils/API: camelCase.ts
// Tipos: camelCase.types.ts
```

### Imports — siempre usar alias `@/`

```typescript
// CORRECTO
import { useAuth } from "@/hooks/useAuth";
import type { InsumoResponse } from "@/types/insumo.types";
import apiClient from "@/api/client";

// INCORRECTO
import { useAuth } from "../../hooks/useAuth"; // ← nunca rutas relativas profundas
```

### Componentes funcionales con tipos explícitos

```typescript
// CORRECTO
interface ProformaCardProps {
  proforma: ProformaResponse
  onAprobar: (id: number) => void
}

function ProformaCard({ proforma, onAprobar }: ProformaCardProps) {
  return ( ... )
}

// INCORRECTO
function ProformaCard(props: any) { ... }  // ← nunca any
```

### Llamadas a la API

```typescript
// CORRECTO: try/catch con tipo de error, mostrar feedback al usuario
async function cargarInsumos() {
  try {
    const datos = await insumosApi.listar({ pagina: 1, por_pagina: 20 });
    setInsumos(datos.datos);
  } catch (error) {
    // Mostrar error con componente Alert, nunca console.log en producción
    mostrarAlerta("Error al cargar insumos. Intente nuevamente.", "error");
  }
}

// INCORRECTO
const datos = await insumosApi.listar(); // ← sin try/catch
console.log(datos); // ← nunca en producción
```

### Formularios con React Hook Form

```typescript
// Siempre tipar el formulario con la interfaz de creación
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<InsumoCreate>();
```

---

## 8. DISEÑO VISUAL

### Sistema de colores (Tailwind)

```
Primario (azul UAGRM):  primary-500 = #1E3A8A
Peligro (rojo UAGRM):   danger-500  = #9B1C1C
Éxito:                  green-600
Advertencia:            yellow-500
Información:            blue-500
Neutro:                 gray-100 a gray-900
```

### Colores de badges de estado (de constants.ts)

```typescript
'Registrado':   'bg-gray-100 text-gray-800'
'En Cola':      'bg-yellow-100 text-yellow-800'
'En Impresion': 'bg-blue-100 text-blue-800'
'En Acabado':   'bg-purple-100 text-purple-800'
'Finalizado':   'bg-green-100 text-green-800'
'Entregado':    'bg-emerald-100 text-emerald-800'
```

### Tipografía

- Fuente principal: `Inter` (sans-serif)
- Títulos de página: `text-2xl font-bold text-gray-900`
- Subtítulos de sección: `text-lg font-semibold text-gray-700`
- Texto de tabla: `text-sm text-gray-600`

### Layout

- El `AppLayout.tsx` tiene un sidebar fijo a la izquierda (240px) y el contenido ocupa el resto.
- El sidebar muestra solo las secciones accesibles según el rol del usuario.
- Las páginas tienen padding: `p-6` o `p-8`.

---

## 9. ACCESIBILIDAD (requisito de calidad)

Todo elemento interactivo debe cumplir:

- Botones sin texto visible: `aria-label` obligatorio.
- Inputs: `htmlFor` en el `<label>` apuntando al `id` del input.
- Imágenes decorativas: `alt=""`.
- Imágenes informativas: `alt` descriptivo.
- Modales: `role="dialog"` y `aria-modal="true"`.
- Tablas: `<thead>` con `<th scope="col">`.

---

## 10. PROHIBICIONES ABSOLUTAS

El agente NUNCA debe:

1. ❌ Guardar el token JWT en `localStorage`, `sessionStorage` o cookies sin `httpOnly`.
2. ❌ Usar el tipo `any` en TypeScript — usar tipos explícitos o `unknown`.
3. ❌ Hacer llamadas a la API directamente desde un componente de `components/` (solo desde `pages/` o `hooks/`).
4. ❌ Usar rutas relativas profundas (`../../..`) — siempre usar el alias `@/`.
5. ❌ Dejar `console.log` en código que va a producción.
6. ❌ Definir tipos inline en componentes — todos los tipos van en `src/types/`.
7. ❌ Omitir el `try/catch` en llamadas a la API.
8. ❌ Mostrar errores técnicos de la API al usuario — mostrar mensajes amigables en español.
9. ❌ Hardcodear URLs del backend — siempre usar `import.meta.env.VITE_API_BASE_URL`.
10. ❌ Crear componentes sin tipar sus props (siempre definir la interfaz de props).
11. ❌ Permitir que un `Operador Taller` vea las secciones de Proformas o Administración.
12. ❌ Mostrar el campo de costo de papel cuando la modalidad es `insumos_cliente`.

---

## 11. REFERENCIAS

- Resumen y Contrato de Cambios Backend: `frontend/agents/cambiosBackend/resumen_cambios_backend.md`
- Contexto del agente backend: `backend/agents/contexto_agente.md`
- Tipos del dominio: `src/types/`
- Constantes del sistema: `src/utils/constants.ts`
- Colores institucionales: `tailwind.config.ts`
- Documentación API backend: `http://localhost:8000/docs` (Swagger)
- Requisitos funcionales: RF1–RF13 (documento IEEE 830, Capítulo 4)
