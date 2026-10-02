# CONTEXTO DEL AGENTE — BACKEND

## Software Integral de Gestión y Predicción de Insumos - Imprenta Universitaria UAGRM

---

> Este archivo define las reglas, el contexto del dominio y las convenciones que
> cualquier agente de IA debe seguir al trabajar en el código del **backend**.
> Formato: Markdown estándar. Compatible con Kiro, Cursor, GitHub Copilot, Claude y cualquier agente que lea archivos de contexto.

---

## 1. IDENTIDAD DEL PROYECTO

**Nombre del sistema:** Software Integral de Gestión y Predicción de Insumos mediante Machine Learning para la Imprenta Universitaria de la UAGRM.

**Institución:** Editorial e Imprenta Universitaria — Universidad Autónoma Gabriel René Moreno (UAGRM), Santa Cruz, Bolivia.

**Propósito del backend:** Exponer una API REST segura que gestiona los procesos operativos de la imprenta: proformas de impresión, órdenes de trabajo, inventario de insumos, compras, auditoría y predicción de demanda mediante Machine Learning.

**Metodología de desarrollo:** Proceso Unificado de Desarrollo de Software (PUDS).

---

## 2. STACK TECNOLÓGICO DEL BACKEND

| Componente    | Tecnología           | Versión   |
| ------------- | -------------------- | --------- |
| Lenguaje      | Python               | 3.11      |
| Framework web | FastAPI              | 0.115     |
| ORM           | SQLAlchemy (async)   | 2.0       |
| Driver BD     | asyncpg              | 0.29      |
| Validación    | Pydantic v2          | 2.9       |
| Autenticación | python-jose + bcrypt | 3.3 / 4.2 |
| ML            | scikit-learn         | 1.5       |
| Base de datos | PostgreSQL           | 16        |
| Contenedor    | Docker (multi-stage) | -         |

---

## 3. ARQUITECTURA INTERNA

El backend sigue un patrón de capas estricto. El flujo de una petición HTTP es:

```
Request HTTP
    ↓
Router (app/routers/)       ← solo recibe la request, valida con schema, llama al service
    ↓
Service (app/services/)     ← contiene TODA la lógica de negocio
    ↓
Repository (app/repositories/) ← ejecuta las queries SQLAlchemy, accede a la BD
    ↓
Model (app/models/)         ← definición de la tabla, sin lógica
    ↓
PostgreSQL 16
```

**Regla de oro:** Ninguna capa puede saltarse la inmediatamente inferior. Un router NUNCA accede directamente al repository ni al modelo.

---

## 4. ESTRUCTURA DE CARPETAS

```
app/
├── main.py              # entrypoint FastAPI, registra routers bajo /api/v1
├── config.py            # Settings (Pydantic Settings, lee .env)
├── database.py          # motor async SQLAlchemy, get_db()
├── dependencies.py      # dependencias compartidas FastAPI
├── models/              # 24 modelos SQLAlchemy (una tabla = un archivo)
├── schemas/             # Pydantic v2 (validación entrada/salida)
├── routers/             # 12 routers (endpoints HTTP)
├── services/            # 12 services (lógica de negocio)
├── repositories/        # acceso a datos (queries)
├── core/
│   ├── security.py      # JWT + bcrypt
│   ├── permissions.py   # RBAC con require_roles()
│   └── exceptions.py    # excepciones del dominio
└── ml/
    ├── pipeline.py      # entrenamiento Random Forest
    ├── predictor.py     # genera predicciones
    └── feature_engineering.py  # prepara dataset
```

---

## 5. MODELO DE DATOS (24 tablas)

El esquema completo está en `db/esquema_imprenta_uagrm.sql`. Las 24 tablas agrupadas por módulo:

**Módulo 1 — Administración y Seguridad (7 tablas):**
`rol`, `usuario`, `cliente`, `solicitante`, `trabajador`, `proveedor`, `bitacora`

**Módulo 2 — Catálogos, Inventario y Parámetros (6 tablas):**
`tipo_trabajo`, `categoria_insumo`, `insumo`, `insumo_proveedor`, `movimiento_inventario`, `tarifa`

**Módulo 3 — Gestión de Producción (6 tablas):**
`proforma`, `detalle_proforma`, `orden_trabajo`, `detalle_orden`, `historial_estado_orden`, `consumo_real`

**Módulo 4 — Compras y Machine Learning (5 tablas):**
`compra`, `detalle_compra`, `gestion`, `periodo_academico`, `prediccion_demanda`

**Campos JSONB:** La tabla `insumo` tiene un campo `atributos JSONB` para almacenar atributos específicos por tipo (gramaje del papel, color CMYK de tinta, etc.). Usar `cast` de SQLAlchemy al consultarlo.

---

## 6. REGLAS DE NEGOCIO CRÍTICAS

### 6.1 Proformas

- Una proforma puede tener **múltiples ítems** (`detalle_proforma`).
- Tiene **vigencia configurable** (`dias_vigencia`). Al vencer, el estado cambia a `vencida` pero el registro NO se borra (dato histórico).
- Estados válidos: `emitida → aprobada → cerrada` / `emitida → rechazada` / `emitida → vencida`.
- Dos modalidades: `insumos_imprenta` (la imprenta provee todo) / `insumos_cliente` (el cliente trae el papel; solo se cobra mano de obra, planchas y acabado).

### 6.2 Órdenes de Trabajo

- Normalmente nacen de una proforma aprobada (`proforma_id` NOT NULL).
- Pueden crearse **directamente** sin proforma (`proforma_id` NULL), pero **solo por Admin o Superadministrador**.
- Secuencia de estados OBLIGATORIA (no se puede saltar):
  `Registrado → En Cola → En Impresion → En Acabado → Finalizado → Entregado`
- Cada transición de estado genera un registro en `historial_estado_orden` con timestamp y usuario responsable.
- Al marcar como `Finalizado`, se habilita el registro de consumo real (`consumo_real`).

### 6.3 Inventario

- Cada consumo/compra/ajuste genera un `movimiento_inventario`.
- Si `stock_actual <= stock_minimo`, se debe retornar el campo `alerta_stock: true` en las respuestas de insumos.
- El stock NUNCA puede quedar negativo (validar antes de descontar).

### 6.4 Cálculo de costos

- Los parámetros de costo viven en la tabla `tarifa` (conceptos: `tarifa_produccion`, `mano_obra`, `porcentaje_merma`, `tarifa_base`).
- **NUNCA hardcodear valores de tarifas en el código.** Siempre leer de la tabla `tarifa`.
- Fórmula base: `subtotal_item = costo_insumos + costo_produccion + merma`

### 6.5 Machine Learning

- El modelo Random Forest Regressor usa datos de `consumo_real` + `periodo_academico`.
- El archivo `.pkl` del modelo entrenado se guarda en `ml_models/` (NO en la BD).
- Si el histórico tiene menos de `ML_MIN_RECORDS_FOR_TRAINING` registros, la predicción se marca como `es_referencial = True`.
- Los resultados se guardan en `prediccion_demanda`.

---

## 7. SEGURIDAD Y AUTENTICACIÓN

### JWT

- Token en header: `Authorization: Bearer <token>`
- Payload del token incluye: `sub` (email), `nombre`, `rol`, `id`, `exp`
- Expiración configurable con `ACCESS_TOKEN_EXPIRE_MINUTES` (default: 480 min = 8 horas)
- Algoritmo: `HS256`

### RBAC — Roles y permisos

| Rol                  | Permisos principales                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `Superadministrador` | Todo, incluido gestión de roles e infraestructura                                        |
| `Administrador`      | Todo operativo: proformas, órdenes, costos, predicciones. Sin gestión de infraestructura |
| `Operador Mostrador` | Crear proformas, registrar solicitudes, entregar trabajos. Sin modificar tarifas         |
| `Operador Taller`    | Ver órdenes, actualizar estados de producción, registrar consumo/mermas                  |

### Contraseñas

- Hash con `bcrypt` (factor de trabajo mínimo 12).
- NUNCA loguear contraseñas ni tokens.

### Auditoría

- Toda operación de escritura crítica (crear/modificar proforma, crear orden, modificar stock, login/logout) DEBE registrar un evento en `bitacora`.
- La tabla `bitacora` es inmutable: solo INSERT, nunca UPDATE ni DELETE.

---

## 8. CONVENCIONES DE CÓDIGO

### Nomenclatura Python

```python
# Variables y funciones: snake_case
def calcular_subtotal_item(cantidad: int, precio: float) -> float: ...

# Clases: PascalCase
class ProformaService: ...

# Constantes: UPPER_SNAKE_CASE
MAX_ITEMS_POR_PROFORMA = 50

# Archivos: snake_case.py
# proforma_service.py, insumo_repository.py
```

### Endpoints URL

```
# Colección:     GET  /api/v1/insumos
# Ítem:          GET  /api/v1/insumos/{id}
# Crear:         POST /api/v1/insumos
# Actualizar:    PUT  /api/v1/insumos/{id}
# Baja lógica:   PUT  /api/v1/insumos/{id}/desactivar
# Acción custom: POST /api/v1/ordenes/{id}/cambiar-estado
```

### Schemas Pydantic

```python
# Schema de creación: campos requeridos para POST
class InsumoCreate(BaseModel): ...

# Schema de actualización: todos opcionales para PUT
class InsumoUpdate(BaseModel): ...

# Schema de respuesta: lo que devuelve la API
class InsumoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)  # leer desde ORM
```

### Funciones async

```python
# CORRECTO: todas las funciones que tocan BD son async
async def get_insumo_by_id(db: AsyncSession, id: int) -> Insumo | None:
    result = await db.execute(select(Insumo).where(Insumo.id == id))
    return result.scalar_one_or_none()

# INCORRECTO: función síncrona con BD async
def get_insumo_by_id(db: AsyncSession, id: int):  # ← error
    ...
```

---

## 9. PROHIBICIONES ABSOLUTAS

El agente NUNCA debe:

1. ❌ Hardcodear credenciales, URLs, claves secretas o valores de tarifas en el código.
2. ❌ Usar `except Exception` genérico sin relanzar o registrar el error.
3. ❌ Acceder a la base de datos directamente desde un router (saltarse el service/repository).
4. ❌ Usar funciones síncronas donde se requieren async (con asyncpg/SQLAlchemy async).
5. ❌ Guardar modelos ML `.pkl` en la base de datos como BLOB.
6. ❌ Hacer DELETE físico de registros que deben conservarse como histórico (usar baja lógica con `activo = False`).
7. ❌ Omitir el registro en `bitacora` en operaciones de escritura críticas.
8. ❌ Usar `any` en tipos (Python typing) — usar tipos explícitos siempre.
9. ❌ Exponer el `password_hash` en ninguna respuesta de la API.
10. ❌ Permitir que el stock de un insumo quede en valor negativo.

---

## 10. REFERENCIAS

- Esquema SQL completo: `db/esquema_imprenta_uagrm.sql`
- Datos semilla: `db/datos_semilla_imprenta_uagrm.sql`
- Informe del modelo de datos: `Modelo_de_Datos_Imprenta_UAGRM.md`
- Documentación API (en ejecución): `http://localhost:8000/docs`
- Requisitos funcionales: RF1–RF13 (documento IEEE 830, Capítulo 4)
