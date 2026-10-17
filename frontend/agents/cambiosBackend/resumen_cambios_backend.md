# CONTRATO DE INTEGRACIÓN Y RESUMEN DE CAMBIOS DEL BACKEND PARA EL FRONTEND
## Software Integral de Gestión y Predicción de Insumos — Imprenta Universitaria UAGRM

> **Documento Oficial de Referencia para el Frontend:** Este archivo contiene el catálogo operativo completo de los **34 endpoints RESTful**, los esquemas JSON de entrada/salida (request/response), las reglas de negocio de la tesis y la guía de adaptación requerida en la SPA (React + TypeScript).

---

## 1. CONEXIÓN Y VARIABLES DE ENTORNO

### 1.1 Configuración en el Frontend (`frontend/.env`)
El cliente Axios de la aplicación (`src/api/client.ts`) debe apuntar a la URL base del backend:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Imprenta Universitaria UAGRM
```

### 1.2 Documentación Interactiva en Tiempo Real
Con el backend ejecutándose (`uvicorn app.main:app --reload`), puedes consultar esquemas vivos e interactivos:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`
- **OpenAPI JSON:** `http://localhost:8000/openapi.json`

### 1.3 CORS Habilitado
El backend acepta peticiones con credenciales (`allow_credentials=True`) y cualquier header/método HTTP desde:
- `http://localhost:5173` (Servidor de desarrollo de Vite)
- `http://localhost:80` y `http://localhost` (Nginx en contenedor Docker)

---

## 2. AUTENTICACIÓN Y ROLES (RBAC)

### 2.1 Flujo de Autenticación
1. El usuario envía `email` y `password` al endpoint `POST /api/v1/auth/login`.
2. El backend verifica credenciales con **bcrypt** y devuelve un token JWT firmado.
3. El frontend almacena el token en **memoria** (en el interceptor de Axios `src/api/client.ts`) y lo envía en cada petición:
   ```http
   Authorization: Bearer <access_token>
   ```
4. El frontend llama a `GET /api/v1/auth/me` para obtener los datos del usuario autenticado y su rol.

### 2.2 Roles Oficiales de la UAGRM
El backend ahora maneja exactamente los **5 roles canónicos** de la imprenta universitaria:

| Rol Oficial | Clave en JWT / Enum | Vistas y Permisos en el Frontend |
| :--- | :--- | :--- |
| **Superadministrador** | `Superadministrador` | Acceso total a todos los módulos + Vista de **Bitácora de Auditoría**. |
| **Administrador** | `Administrador` | Acceso de gestión: Usuarios, Clientes, Insumos, Tarifas, Compras, ML y Reportes. |
| **Operador Mostrador** | `Operador Mostrador` | Cotizador de Proformas (emisión/aprobación), Clientes, Consulta de Insumos y Tarifas. |
| **Operador Taller** | `Operador Taller` | **Tablero Kanban** de Órdenes de Trabajo, cambio de estado de producción y registro de consumo real con merma. *No debe ver Proformas ni Configuración.* |
| **Cliente** | `Cliente` | Portal de autoservicio: consulta de sus proformas y seguimiento de órdenes solicitadas. |

### 2.3 Cuentas de Prueba Pre-creadas en Base de Datos
La base de datos ya cuenta con 5 cuentas activas creadas con contraseñas seguras (`Uagrm2026*`):

| Rol | Correo Electrónico | Contraseña | Nombre Completo |
| :--- | :--- | :--- | :--- |
| **Superadministrador** | `superadmin@uagrm.edu.bo` | `Uagrm2026*` | Ing. Director de Tecnología |
| **Administrador** | `admin@uagrm.edu.bo` | `Uagrm2026*` | Lic. Jefe Administrativo Imprenta |
| **Operador Mostrador** | `mostrador@uagrm.edu.bo` | `Uagrm2026*` | Auxiliar de Atención Mostrador |
| **Operador Taller** | `taller@uagrm.edu.bo` | `Uagrm2026*` | Jefe de Taller y Prensa |
| **Cliente** | `cliente@uagrm.edu.bo` | `Uagrm2026*` | Solicitante Facultad FCET |

---

## 3. CAMBIOS ESTRUCTURALES RESPECTO AL SISTEMA ANTERIOR

1. **Nombres de tablas y entidades en singular:**
   - Antes: `usuarios`, `insumos`, `proformas`, `ordenes_trabajo`.
   - Ahora: `usuario`, `insumo`, `proforma`, `orden_trabajo`, `cliente`, `proveedor`, etc.
2. **Llaves primarias y foráneas explícitas:**
   - Cada tabla usa su identificador nombrado: `id_usuario`, `id_insumo`, `id_proforma`, `id_orden`, `id_cliente`, `id_tarifa`, `id_tipo_trabajo`.
3. **Formato de Paginación Estandarizado:**
   - Todos los endpoints de listado paginado devuelven el atributo **`datos`** (en lugar de `items`):
     ```json
     {
       "total": 45,
       "pagina": 1,
       "por_pagina": 20,
       "datos": [ ... ]
     }
     ```
4. **Correlativos Institucionales Automáticos:**
   - El frontend ya no genera correlativos. El backend asigna correlativos anuales thread-safe:
     - Proformas: `PRF-YYYY-#####` (Ej: `PRF-2026-00001`)
     - Órdenes de Trabajo: `OT-YYYY-#####` (Ej: `OT-2026-00001`)
     - Órdenes de Compra: `OC-YYYY-#####` (Ej: `OC-2026-00001`)
5. **Precios y Moneda:**
   - Todos los costos están en Bolivianos (Bs.) con 2 decimales (`Decimal` / `number` en JS).

---

## 4. CATÁLOGO COMPLETO DE LOS 34 ENDPOINTS RESTFUL

### Módulo 1: Autenticación y Perfil (`/api/v1/auth`)

#### 1. Iniciar Sesión (Público)
- **Método y Ruta:** `POST /api/v1/auth/login`
- **Request Body:**
  ```json
  {
    "email": "admin@uagrm.edu.bo",
    "password": "Uagrm2026*"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expira_en_minutos": 480
  }
  ```
- **Errores:** `401 Unauthorized` si las credenciales son incorrectas o usuario inactivo.

#### 2. Obtener Usuario Autenticado
- **Método y Ruta:** `GET /api/v1/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "id_usuario": 1,
    "email": "admin@uagrm.edu.bo",
    "nombre_completo": "Lic. Jefe Administrativo Imprenta",
    "rol": "Administrador"
  }
  ```

---

### Módulo 2: Usuarios y Roles (`/api/v1/usuarios`)
*Permisos: Superadministrador, Administrador.*

#### 3. Listar Usuarios Paginados
- **Método y Ruta:** `GET /api/v1/usuarios?pagina=1&por_pagina=20&rol_id=2&solo_activos=true`
- **Response (200 OK):**
  ```json
  {
    "total": 5,
    "pagina": 1,
    "por_pagina": 20,
    "datos": [
      {
        "id_usuario": 1,
        "rol_id": 2,
        "nombre_completo": "Lic. Jefe Administrativo Imprenta",
        "email": "admin@uagrm.edu.bo",
        "activo": true,
        "ultimo_acceso": "2026-10-16T19:30:00Z",
        "rol": { "id_rol": 2, "nombre": "Administrador", "descripcion": "..." }
      }
    ]
  }
  ```

#### 4. Crear Usuario
- **Método y Ruta:** `POST /api/v1/usuarios`
- **Request Body:**
  ```json
  {
    "rol_id": 3,
    "nombre_completo": "Carlos Mendoza",
    "email": "cmendoza@uagrm.edu.bo",
    "password": "Password2026*"
  }
  ```
- **Response (201 Created):** Objeto `UsuarioResponse`.

#### 5. Obtener Usuario por ID
- **Método y Ruta:** `GET /api/v1/usuarios/{id_usuario}`
- **Response (200 OK):** Objeto `UsuarioResponse`.

#### 6. Cambiar Estado (Alta / Baja Lógica)
- **Método y Ruta:** `PATCH /api/v1/usuarios/{id_usuario}/estado?activo=false`
- **Response (200 OK):** Objeto `UsuarioResponse` actualizado.

---

### Módulo 3: Clientes Institucionales (`/api/v1/clientes`)
*Permisos: Superadministrador, Administrador, Operador Mostrador.*

#### 7. Listar Clientes
- **Método y Ruta:** `GET /api/v1/clientes?pagina=1&por_pagina=50&buscar=FCET`
- **Response (200 OK):**
  ```json
  {
    "total": 1,
    "pagina": 1,
    "por_pagina": 50,
    "datos": [
      {
        "id_cliente": 1,
        "tipo_cliente": "INTERNO",
        "razon_social": "Facultad de Ciencias Exactas y Tecnología",
        "codigo_facultad": "FCET",
        "dependencia": "Decanato",
        "telefono": "3598000",
        "email": "decanato.fcet@uagrm.edu.bo",
        "direccion": "Campus Universitario Módulo 225",
        "ci_nit": "1020304050"
      }
    ]
  }
  ```

#### 8. Registrar Cliente
- **Método y Ruta:** `POST /api/v1/clientes`
- **Request Body:**
  ```json
  {
    "tipo_cliente": "EXTERNO",
    "razon_social": "Colegio de Ingenieros de Santa Cruz",
    "codigo_facultad": null,
    "dependencia": null,
    "telefono": "3345566",
    "email": "contacto@ingenieros.bo",
    "direccion": "Av. Las Américas #340",
    "ci_nit": "4567891011"
  }
  ```
- **Response (201 Created):** Objeto `ClienteResponse`.

#### 9. Obtener Cliente por ID
- **Método y Ruta:** `GET /api/v1/clientes/{id_cliente}`
- **Response (200 OK):** Objeto `ClienteResponse`.

---

### Módulo 4: Insumos e Inventario (`/api/v1/insumos`)
*Permisos lectura: Todos los roles autenticados. Permisos escritura: Superadministrador, Administrador.*

#### 10. Listar Insumos con Stock
- **Método y Ruta:** `GET /api/v1/insumos?pagina=1&por_pagina=20&categoria_id=1&solo_bajo_stock=false`
- **Response (200 OK):**
  ```json
  {
    "total": 9,
    "pagina": 1,
    "por_pagina": 20,
    "datos": [
      {
        "id_insumo": 1,
        "categoria_id": 1,
        "codigo": "PAP-BND-75",
        "descripcion": "Papel Bond 75g Resma Carta",
        "stock_actual": 120.00,
        "stock_minimo": 20.00,
        "costo_reposicion": 38.50,
        "unidad_medida": "RESMA",
        "categoria": { "id_categoria": 1, "nombre": "Papeles", "unidad_base": "RESMA" }
      }
    ]
  }
  ```

#### 11. Crear Insumo
- **Método y Ruta:** `POST /api/v1/insumos`
- **Request Body:**
  ```json
  {
    "categoria_id": 1,
    "codigo": "PAP-COU-200",
    "descripcion": "Papel Couche Brillante 200g Pliego",
    "stock_minimo": 15.00,
    "costo_reposicion": 85.00,
    "unidad_medida": "PAQUETE"
  }
  ```
- **Response (201 Created):** Objeto `InsumoResponse`.

#### 12. Obtener Insumo por ID
- **Método y Ruta:** `GET /api/v1/insumos/{id_insumo}`
- **Response (200 OK):** Objeto `InsumoResponse`.

#### 13. Registrar Movimiento de Inventario (Entrada / Salida / Ajuste)
- **Método y Ruta:** `POST /api/v1/insumos/{id_insumo}/movimiento`
- **Request Body:**
  ```json
  {
    "tipo_movimiento": "INGRESO",
    "cantidad": 50.00,
    "concepto": "Recepción según Orden de Compra OC-2026-00001",
    "costo_unitario": 38.50
  }
  ```
- **Response (200 OK):** Objeto `InsumoResponse` con stock actualizado.

---

### Módulo 5: Tarifas y Catálogos (`/api/v1/tarifas`, `/api/v1/tipos-trabajo`, `/api/v1/proveedores`)

#### 14. Listar Tarifas de Servicios
- **Método y Ruta:** `GET /api/v1/tarifas?categoria=IMPRESION&solo_activas=true`
- **Response (200 OK):**
  ```json
  [
    {
      "id_tarifa": 1,
      "concepto": "Impresión Offset 1/1 (Monocromático)",
      "costo_unitario": 0.08,
      "unidad_calculo": "PAGINA",
      "categoria": "IMPRESION",
      "activo": true
    }
  ]
  ```

#### 15. Crear / Actualizar Tarifa
- **Método y Ruta:** `POST /api/v1/tarifas`
- **Request Body:**
  ```json
  {
    "concepto": "Barnizado UV Total Pliego",
    "costo_unitario": 1.20,
    "unidad_calculo": "PLIEGO",
    "categoria": "ACABADO",
    "activo": true
  }
  ```
- **Response (201 Created):** Objeto `TarifaResponse`.

#### 16. Listar Tipos de Trabajo
- **Método y Ruta:** `GET /api/v1/tipos-trabajo`
- **Response (200 OK):**
  ```json
  [
    {
      "id_tipo_trabajo": 1,
      "nombre": "Libros / Textos Universitarios",
      "descripcion": "Edición oficial empastada o encuadernada",
      "activo": true
    }
  ]
  ```

#### 17. Listar Proveedores
- **Método y Ruta:** `GET /api/v1/proveedores`
- **Response (200 OK):**
  ```json
  [
    {
      "id_proveedor": 1,
      "razon_social": "Papelera Santa Cruz S.R.L.",
      "nit": "1023456029",
      "contacto": "Lic. Mario Prado",
      "telefono": "3348899",
      "email": "ventas@papelerasantacruz.com",
      "activo": true
    }
  ]
  ```

---

### Módulo 6: Proformas de Impresión (`/api/v1/proformas`)
*Permisos: Superadministrador, Administrador, Operador Mostrador, Cliente (solo suyas).*

#### 18. Listar Proformas
- **Método y Ruta:** `GET /api/v1/proformas?pagina=1&por_pagina=20&cliente_id=1&estado=EMITIDA`
- **Response (200 OK):** Objeto paginado con lista de `ProformaResponse`.

#### 19. Emitir Nueva Proforma (Cálculo Paramétrico)
- **Método y Ruta:** `POST /api/v1/proformas`
- **Regla de Negocio:**
  - Si `modalidad == "insumos_imprenta"`: Se cobra papel, tinta, planchas y mano de obra.
  - Si `modalidad == "insumos_cliente"`: El costo de papel **debe ser 0.00** (el cliente trae su propio papel).
- **Request Body:**
  ```json
  {
    "cliente_id": 1,
    "modalidad": "insumos_imprenta",
    "dias_vigencia": 15,
    "detalles": [
      {
        "tipo_trabajo_id": 1,
        "insumo_id": 1,
        "descripcion_trabajo": "Guía Académica Álgebra Lineal",
        "tiraje": 500,
        "paginas_totales": 120,
        "costo_papel": 250.00,
        "costo_tinta": 80.00,
        "costo_planchas": 60.00,
        "costo_mano_obra": 120.00,
        "subtotal": 510.00
      }
    ]
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id_proforma": 1,
    "cliente_id": 1,
    "usuario_id": 3,
    "codigo_proforma": "PRF-2026-00001",
    "modalidad": "insumos_imprenta",
    "total_presupuesto": 510.00,
    "estado": "EMITIDA",
    "fecha_emision": "2026-10-16T21:00:00Z",
    "fecha_vencimiento": "2026-10-31",
    "detalles": [ ... ]
  }
  ```

#### 20. Obtener Detalle de Proforma
- **Método y Ruta:** `GET /api/v1/proformas/{id_proforma}`
- **Response (200 OK):** Objeto `ProformaResponse`.

#### 21. Generar Documento Imprimible / Exportación HTML
- **Método y Ruta:** `GET /api/v1/proformas/{id_proforma}/imprimir`
- **Response (200 OK - Content-Type: text/html):**
  Retorna el documento HTML estilizado con membrete oficial de la UAGRM, tabla de desglose, vigencia y líneas de firma institucionales, listo para imprimir (`window.print()`) o previsualizar en un iframe/modal.

#### 22. Cambiar Estado de Proforma
- **Método y Ruta:** `PATCH /api/v1/proformas/{id_proforma}/estado?nuevo_estado=APROBADA`
- **Valores posibles:** `APROBADA`, `RECHAZADA`, `VENCIDA`.
- **Response (200 OK):** Objeto `ProformaResponse` con nuevo estado.

---

### Módulo 7: Órdenes de Trabajo y Taller (`/api/v1/ordenes`)
*Permisos: Superadministrador, Administrador, Operador Taller.*

#### 23. Listar Órdenes de Trabajo (Para el Tablero Kanban)
- **Método y Ruta:** `GET /api/v1/ordenes?pagina=1&por_pagina=100&estado=EN COLA`
- **Response (200 OK):** Lista de órdenes con su historial de estados y detalles de taller.

#### 24. Generar Orden de Trabajo desde Proforma Aprobada
- **Método y Ruta:** `POST /api/v1/ordenes`
- **Condición:** La proforma debe estar previamente en estado `APROBADA`.
- **Request Body:**
  ```json
  {
    "proforma_id": 1,
    "fecha_compromiso": "2026-10-25",
    "prioridad": "NORMAL",
    "observaciones": "Entregar en decanato con 2 copias muestra",
    "detalle_orden": {
      "formato_corte": "Carta 21.5 x 28 cm",
      "tipo_encuadernacion": "Anillado plástico",
      "especificaciones_taller": "Planchas CTP térmicas, tinta negra densidad 1.4"
    }
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id_orden": 1,
    "proforma_id": 1,
    "usuario_id": 4,
    "codigo_ot": "OT-2026-00001",
    "fecha_compromiso": "2026-10-25",
    "prioridad": "NORMAL",
    "estado_actual": "REGISTRADO",
    "observaciones": "Entregar en decanato con 2 copias muestra",
    "created_at": "2026-10-16T21:15:00Z",
    "detalles_orden": [ ... ],
    "historial": [ ... ]
  }
  ```

#### 25. Avanzar Estado de Producción (Transición Estricta)
- **Método y Ruta:** `PATCH /api/v1/ordenes/{id_orden}/estado`
- **Flujo Estricto de Estados en Taller:**
  $$	ext{REGISTRADO} \longrightarrow 	ext{EN COLA} \longrightarrow 	ext{EN IMPRESION} \longrightarrow 	ext{EN ACABADO} \longrightarrow 	ext{FINALIZADO} \longrightarrow 	ext{ENTREGADO}$$
- **Request Body:**
  ```json
  {
    "estado_nuevo": "EN IMPRESION",
    "observaciones": "Ingreso a máquina Heidelberg GTO-52"
  }
  ```
- **Response (200 OK):** Objeto `OrdenTrabajoResponse`.

#### 26. Registrar Consumo Real de Insumos y Merma
- **Método y Ruta:** `POST /api/v1/ordenes/{id_orden}/consumo-real`
- **Permisos:** Operador Taller, Administrador.
- **Request Body:**
  ```json
  {
    "insumo_id": 1,
    "cantidad_utilizada": 2.50,
    "cantidad_merma": 0.15,
    "costo_total": 96.25,
    "observaciones": "Merma normal por ajuste de registro en pinzas"
  }
  ```
- **Response (201 Created):** Objeto `ConsumoRealResponse`. Este registro alimenta directamente el dataset de Machine Learning.

---

### Módulo 8: Compras y Machine Learning (`/api/v1/predicciones`, `/api/v1/compras`)

#### 27. Estimar Predicción de Demanda Futura (Random Forest)
- **Método y Ruta:** `POST /api/v1/predicciones/estimar`
- **Request Body:**
  ```json
  {
    "insumo_id": 1,
    "periodo_id": 1
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id_prediccion": 1,
    "insumo_id": 1,
    "periodo_id": 1,
    "cantidad_estimada": 145.80,
    "unidad_medida": "RESMA",
    "fecha_prediccion": "2026-10-16T21:20:00Z",
    "es_referencial": false
  }
  ```
  *(Nota: Si `es_referencial: true`, significa que el modelo usó promedio histórico ponderado porque aún no se alcanzaron los 50 registros para el modelo RandomForest).*

#### 28. Re-entrenar Modelo de Machine Learning
- **Método y Ruta:** `POST /api/v1/predicciones/entrenar`
- **Response (200 OK):**
  ```json
  {
    "mensaje": "Modelo RandomForest entrenado y serializado exitosamente",
    "r2_score": 0.942,
    "rmse": 12.4,
    "fecha_entrenamiento": "2026-10-16T21:22:00Z"
  }
  ```

#### 29. Listar Órdenes de Compra
- **Método y Ruta:** `GET /api/v1/compras?pagina=1&por_pagina=20`
- **Response (200 OK):** Objeto paginado con `OrdenCompraResponse`.

#### 30. Generar Orden de Compra de Insumos
- **Método y Ruta:** `POST /api/v1/compras`
- **Request Body:**
  ```json
  {
    "proveedor_id": 1,
    "observaciones": "Reposición preventiva para segundo semestre",
    "detalles": [
      {
        "insumo_id": 1,
        "cantidad": 100.00,
        "precio_unitario": 38.00
      }
    ]
  }
  ```
- **Response (201 Created):** Objeto `OrdenCompraResponse` con correlativo `OC-2026-00001`.

---

### Módulo 9: Reportes y Bitácora (`/api/v1/reportes`, `/api/v1/bitacora`)

#### 31. Reporte Analítico de Consumo de Insumos
- **Método y Ruta:** `GET /api/v1/reportes/consumo?fecha_inicio=2026-01-01&fecha_fin=2026-12-31`
- **Response (200 OK):** Totales consumidos, mermas globales y porcentaje de merma por insumo.

#### 32. Reporte Financiero de Proformas y Facturación Estimada
- **Método y Ruta:** `GET /api/v1/reportes/proformas?estado=APROBADA`
- **Response (200 OK):** Total montos recaudados, volumen de tirajes y cantidad de trabajos por facultad.

#### 33. Reporte de Estado de Inventario y Alerta de Stock Crítico
- **Método y Ruta:** `GET /api/v1/reportes/inventario`
- **Response (200 OK):** Listado de insumos con semáforo de stock (Verde = Óptimo, Amarillo = Preventivo, Rojo = Crítico bajo stock mínimo).

#### 34. Consultar Bitácora de Auditoría (Solo Superadministrador)
- **Método y Ruta:** `GET /api/v1/bitacora?pagina=1&por_pagina=50&accion=CAMBIO_ESTADO`
- **Response (200 OK):** Registro inmutable con `ip_address`, `usuario_id`, `accion`, `tabla_afectada`, `valores_anteriores` y `valores_nuevos`.

---

## 5. CHECKLIST DE ADAPTACIÓN REQUERIDA EN EL FRONTEND

Al iniciar la sesión del Frontend, asegúrate de verificar o implementar los siguientes puntos en React:

- [ ] **Interceptor de Axios (`src/api/client.ts`):** Confirmar que use `VITE_API_BASE_URL` y que en caso de error `401 Unauthorized` limpie el token y redirija a `/login`.
- [ ] **Pantalla de Login (`src/pages/Login.tsx`):** Enviar `{ email, password }` a `POST /auth/login`, capturar `access_token` y cargar perfil con `/auth/me`.
- [ ] **Control de Rutas Protegidas (`src/components/ProtectedRoute.tsx`):** Ocultar rutas de Taller para clientes y mostrador; ocultar Proformas y Usuarios para el Operador de Taller.
- [ ] **Formulario de Proformas (`src/pages/Proformas/NuevaProforma.tsx`):**
  - Selector de modalidad: `insumos_imprenta` vs `insumos_cliente`.
  - Si el usuario selecciona `insumos_cliente`, el campo **Costo Papel** debe deshabilitarse o fijarse en `0.00`.
  - Botón "Imprimir Proforma" que abra `GET /api/v1/proformas/{id}/imprimir` en una pestaña nueva o modal.
- [ ] **Tablero Kanban de Taller (`src/pages/Taller/Kanban.tsx`):**
  - 6 columnas con los estados canónicos: `REGISTRADO`, `EN COLA`, `EN IMPRESION`, `EN ACABADO`, `FINALIZADO`, `ENTREGADO`.
  - Botón en cada tarjeta de orden para registrar consumo real y merma (`POST /api/v1/ordenes/{id}/consumo-real`).
- [ ] **Inventario (`src/pages/Inventario/Insumos.tsx`):**
  - Consumir respuesta paginada desde `response.data.datos`.
  - Resaltar en rojo los insumos donde `stock_actual <= stock_minimo`.
- [ ] **Panel de Machine Learning (`src/pages/ML/Predicciones.tsx`):**
  - Gráfica de demanda estimada vs stock actual con indicador visual si la predicción es referencial o generada por el RandomForestRegressor.

---
*Documento autogenerado para alineación entre capas — Imprenta Universitaria UAGRM 2026.*
