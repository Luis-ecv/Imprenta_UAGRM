-- =============================================================================
-- esquema_imprenta_uagrm.sql — DDL del Sistema de Gestión de Insumos
-- Imprenta Universitaria UAGRM — Santa Cruz, Bolivia
--
-- Módulos:
--   1. Administración y Seguridad
--   2. Catálogos, Inventario y Parámetros
--   3. Gestión de Producción
--   4. Compras y Machine Learning
--
-- Motor: PostgreSQL 16
-- Codificación: UTF-8
-- =============================================================================

-- Crear la base de datos (ejecutar solo si no existe, fuera del contenedor)
-- CREATE DATABASE imprenta_uagrm WITH ENCODING 'UTF8';

-- Extensión para UUIDs (opcional, si se prefiere UUID como PK en algunos módulos)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- MÓDULO 1: ADMINISTRACIÓN Y SEGURIDAD
-- =============================================================================

-- Tabla de roles del sistema (RBAC)
CREATE TABLE IF NOT EXISTS roles (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(50)  NOT NULL UNIQUE,
    descripcion TEXT,
    activo      BOOLEAN      NOT NULL DEFAULT TRUE,
    creado_en   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Tabla de usuarios del sistema
CREATE TABLE IF NOT EXISTS usuarios (
    id              SERIAL PRIMARY KEY,
    nombre_usuario  VARCHAR(50)  NOT NULL UNIQUE,
    correo          VARCHAR(100) NOT NULL UNIQUE,
    hash_contrasena VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    rol_id          INTEGER      NOT NULL REFERENCES roles(id),
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Tabla de clientes institucionales
CREATE TABLE IF NOT EXISTS clientes (
    id             SERIAL PRIMARY KEY,
    nombre         VARCHAR(150) NOT NULL,
    unidad_academic VARCHAR(100),
    nit            VARCHAR(20),
    telefono       VARCHAR(20),
    correo         VARCHAR(100),
    direccion      TEXT,
    activo         BOOLEAN      NOT NULL DEFAULT TRUE,
    creado_en      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Tabla de auditoría de acciones críticas
CREATE TABLE IF NOT EXISTS auditoria (
    id          BIGSERIAL PRIMARY KEY,
    usuario_id  INTEGER      REFERENCES usuarios(id),
    accion      VARCHAR(100) NOT NULL,
    tabla_afec  VARCHAR(100),
    registro_id INTEGER,
    detalle     JSONB,
    ip_origen   INET,
    fecha_hora  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- MÓDULO 2: CATÁLOGOS, INVENTARIO Y PARÁMETROS
-- =============================================================================

-- Categorías de insumos
CREATE TABLE IF NOT EXISTS categorias_insumo (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(80)  NOT NULL UNIQUE,
    descripcion TEXT,
    activo      BOOLEAN      NOT NULL DEFAULT TRUE
);

-- Tabla de insumos de impresión
CREATE TABLE IF NOT EXISTS insumos (
    id               SERIAL PRIMARY KEY,
    codigo           VARCHAR(30)    NOT NULL UNIQUE,
    nombre           VARCHAR(150)   NOT NULL,
    descripcion      TEXT,
    unidad_medida    VARCHAR(20)    NOT NULL, -- ej: "resma", "litro", "unidad"
    categoria_id     INTEGER        NOT NULL REFERENCES categorias_insumo(id),
    stock_actual     NUMERIC(12, 2) NOT NULL DEFAULT 0,
    stock_minimo     NUMERIC(12, 2) NOT NULL DEFAULT 0,
    stock_maximo     NUMERIC(12, 2),
    precio_unitario  NUMERIC(10, 2) NOT NULL DEFAULT 0,
    activo           BOOLEAN        NOT NULL DEFAULT TRUE,
    creado_en        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    actualizado_en   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Historial de movimientos de inventario
CREATE TABLE IF NOT EXISTS movimientos_inventario (
    id             BIGSERIAL PRIMARY KEY,
    insumo_id      INTEGER        NOT NULL REFERENCES insumos(id),
    tipo_movim     VARCHAR(20)    NOT NULL CHECK (tipo_movim IN ('ENTRADA', 'SALIDA', 'AJUSTE')),
    cantidad       NUMERIC(12, 2) NOT NULL,
    stock_anterior NUMERIC(12, 2) NOT NULL,
    stock_nuevo    NUMERIC(12, 2) NOT NULL,
    motivo         TEXT,
    usuario_id     INTEGER        REFERENCES usuarios(id),
    fecha_hora     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Tarifas de servicios de impresión
CREATE TABLE IF NOT EXISTS tarifas (
    id              SERIAL PRIMARY KEY,
    nombre_servicio VARCHAR(100)   NOT NULL,
    descripcion     TEXT,
    precio_unitario NUMERIC(10, 2) NOT NULL,
    unidad          VARCHAR(50)    NOT NULL, -- ej: "hoja A4", "copia", "encuadernado"
    activo          BOOLEAN        NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- MÓDULO 3: GESTIÓN DE PRODUCCIÓN
-- =============================================================================

-- Estados posibles de proformas y órdenes
CREATE TYPE estado_doc AS ENUM ('BORRADOR', 'PENDIENTE', 'APROBADA', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA');

-- Tabla de proformas de impresión
CREATE TABLE IF NOT EXISTS proformas (
    id             SERIAL PRIMARY KEY,
    numero         VARCHAR(20)    NOT NULL UNIQUE, -- ej: "PROF-2024-0001"
    cliente_id     INTEGER        NOT NULL REFERENCES clientes(id),
    usuario_id     INTEGER        NOT NULL REFERENCES usuarios(id),
    descripcion    TEXT,
    total          NUMERIC(12, 2) NOT NULL DEFAULT 0,
    estado         estado_doc     NOT NULL DEFAULT 'BORRADOR',
    fecha_emision  DATE           NOT NULL DEFAULT CURRENT_DATE,
    fecha_validez  DATE,
    observaciones  TEXT,
    creado_en      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Detalle de servicios en la proforma
CREATE TABLE IF NOT EXISTS detalle_proforma (
    id            SERIAL PRIMARY KEY,
    proforma_id   INTEGER        NOT NULL REFERENCES proformas(id) ON DELETE CASCADE,
    tarifa_id     INTEGER        NOT NULL REFERENCES tarifas(id),
    cantidad      NUMERIC(10, 2) NOT NULL,
    precio_unit   NUMERIC(10, 2) NOT NULL,
    subtotal      NUMERIC(12, 2) NOT NULL,
    descripcion   TEXT
);

-- Tabla de órdenes de trabajo
CREATE TABLE IF NOT EXISTS ordenes_trabajo (
    id             SERIAL PRIMARY KEY,
    numero         VARCHAR(20)    NOT NULL UNIQUE, -- ej: "OT-2024-0001"
    proforma_id    INTEGER        REFERENCES proformas(id),
    cliente_id     INTEGER        NOT NULL REFERENCES clientes(id),
    usuario_id     INTEGER        NOT NULL REFERENCES usuarios(id),
    descripcion    TEXT           NOT NULL,
    estado         estado_doc     NOT NULL DEFAULT 'PENDIENTE',
    fecha_inicio   DATE,
    fecha_entrega  DATE,
    total          NUMERIC(12, 2) NOT NULL DEFAULT 0,
    observaciones  TEXT,
    creado_en      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Registro del consumo real de insumos por orden de trabajo
CREATE TABLE IF NOT EXISTS consumo_insumos (
    id              BIGSERIAL PRIMARY KEY,
    orden_id        INTEGER        NOT NULL REFERENCES ordenes_trabajo(id),
    insumo_id       INTEGER        NOT NULL REFERENCES insumos(id),
    cantidad_usada  NUMERIC(12, 2) NOT NULL,
    costo_unitario  NUMERIC(10, 2) NOT NULL,
    costo_total     NUMERIC(12, 2) NOT NULL,
    registrado_en   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    registrado_por  INTEGER        REFERENCES usuarios(id)
);

-- =============================================================================
-- MÓDULO 4: COMPRAS Y MACHINE LEARNING
-- =============================================================================

-- Proveedores de insumos
CREATE TABLE IF NOT EXISTS proveedores (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(150) NOT NULL,
    nit         VARCHAR(20),
    telefono    VARCHAR(20),
    correo      VARCHAR(100),
    direccion   TEXT,
    activo      BOOLEAN      NOT NULL DEFAULT TRUE,
    creado_en   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Tabla de órdenes de compra
CREATE TABLE IF NOT EXISTS ordenes_compra (
    id              SERIAL PRIMARY KEY,
    numero          VARCHAR(20)    NOT NULL UNIQUE, -- ej: "OC-2024-0001"
    proveedor_id    INTEGER        NOT NULL REFERENCES proveedores(id),
    usuario_id      INTEGER        NOT NULL REFERENCES usuarios(id),
    estado          VARCHAR(20)    NOT NULL DEFAULT 'PENDIENTE'
                        CHECK (estado IN ('PENDIENTE', 'APROBADA', 'RECIBIDA', 'CANCELADA')),
    total           NUMERIC(12, 2) NOT NULL DEFAULT 0,
    fecha_emision   DATE           NOT NULL DEFAULT CURRENT_DATE,
    fecha_recepcion DATE,
    observaciones   TEXT,
    creado_en       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Detalle de insumos en la orden de compra
CREATE TABLE IF NOT EXISTS detalle_compra (
    id             SERIAL PRIMARY KEY,
    orden_compra_id INTEGER        NOT NULL REFERENCES ordenes_compra(id) ON DELETE CASCADE,
    insumo_id       INTEGER        NOT NULL REFERENCES insumos(id),
    cantidad_pedida NUMERIC(12, 2) NOT NULL,
    precio_unitario NUMERIC(10, 2) NOT NULL,
    subtotal        NUMERIC(12, 2) NOT NULL
);

-- Predicciones generadas por el modelo de ML (Random Forest Regressor)
CREATE TABLE IF NOT EXISTS predicciones_ml (
    id                  BIGSERIAL PRIMARY KEY,
    insumo_id           INTEGER        NOT NULL REFERENCES insumos(id),
    periodo_inicio      DATE           NOT NULL, -- inicio del período predicho
    periodo_fin         DATE           NOT NULL, -- fin del período predicho
    cantidad_predicha   NUMERIC(12, 2) NOT NULL,
    confianza_pct       NUMERIC(5, 2),           -- porcentaje de confianza del modelo
    version_modelo      VARCHAR(50),             -- versión del modelo usado
    generado_en         TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    generado_por        INTEGER        REFERENCES usuarios(id)
);

-- =============================================================================
-- ÍNDICES para mejorar el rendimiento de consultas frecuentes
-- =============================================================================

-- Usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);

-- Insumos
CREATE INDEX IF NOT EXISTS idx_insumos_categoria ON insumos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_insumos_codigo ON insumos(codigo);
CREATE INDEX IF NOT EXISTS idx_insumos_stock ON insumos(stock_actual);

-- Movimientos de inventario
CREATE INDEX IF NOT EXISTS idx_movim_insumo ON movimientos_inventario(insumo_id);
CREATE INDEX IF NOT EXISTS idx_movim_fecha ON movimientos_inventario(fecha_hora);

-- Proformas
CREATE INDEX IF NOT EXISTS idx_proformas_cliente ON proformas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_proformas_estado ON proformas(estado);
CREATE INDEX IF NOT EXISTS idx_proformas_fecha ON proformas(fecha_emision);

-- Órdenes de trabajo
CREATE INDEX IF NOT EXISTS idx_ot_cliente ON ordenes_trabajo(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ot_estado ON ordenes_trabajo(estado);
CREATE INDEX IF NOT EXISTS idx_ot_fecha ON ordenes_trabajo(fecha_inicio);

-- Consumo de insumos
CREATE INDEX IF NOT EXISTS idx_consumo_orden ON consumo_insumos(orden_id);
CREATE INDEX IF NOT EXISTS idx_consumo_insumo ON consumo_insumos(insumo_id);
CREATE INDEX IF NOT EXISTS idx_consumo_fecha ON consumo_insumos(registrado_en);

-- Predicciones ML
CREATE INDEX IF NOT EXISTS idx_pred_insumo ON predicciones_ml(insumo_id);
CREATE INDEX IF NOT EXISTS idx_pred_periodo ON predicciones_ml(periodo_inicio, periodo_fin);

-- Auditoría
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON auditoria(fecha_hora);

-- =============================================================================
-- FIN DEL ESQUEMA
-- =============================================================================
