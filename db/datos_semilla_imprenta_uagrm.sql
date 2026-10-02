-- =============================================================================
-- datos_semilla_imprenta_uagrm.sql — Datos iniciales del sistema
-- Imprenta Universitaria UAGRM — Santa Cruz, Bolivia
--
-- Este script inserta los datos mínimos necesarios para que el sistema
-- funcione correctamente desde el primer inicio:
--   - Roles del sistema (RBAC)
--   - Usuario administrador por defecto
--   - Categorías de insumos
--   - Insumos básicos de imprenta
--   - Tarifas de servicios base
--
-- IMPORTANTE: Cambiar la contraseña del administrador en el primer inicio.
-- El hash corresponde a la contraseña: Admin2024!
-- =============================================================================

-- =============================================================================
-- MÓDULO 1: ROLES DEL SISTEMA
-- =============================================================================

INSERT INTO roles (nombre, descripcion) VALUES
    ('ADMINISTRADOR',  'Acceso total al sistema: usuarios, roles, parámetros y reportes.'),
    ('OPERADOR',       'Gestión de proformas, órdenes de trabajo y registro de consumos.'),
    ('ALMACENERO',     'Control de inventario: entradas, salidas y ajustes de stock.'),
    ('COMPRAS',        'Gestión de órdenes de compra y proveedores.'),
    ('SUPERVISOR',     'Visualización de reportes y aprobación de documentos.'),
    ('CLIENTE',        'Consulta del estado de sus proformas y órdenes de trabajo.')
ON CONFLICT (nombre) DO NOTHING;

-- =============================================================================
-- USUARIO ADMINISTRADOR POR DEFECTO
-- Contraseña: Admin2024! (CAMBIAR EN PRIMER INICIO)
-- Hash generado con bcrypt (cost factor 12)
-- =============================================================================

INSERT INTO usuarios (nombre_usuario, correo, hash_contrasena, nombre_completo, rol_id)
VALUES (
    'admin',
    'admin@imprenta.uagrm.edu.bo',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lek.pVjNQBIhzK5gC',
    'Administrador del Sistema',
    (SELECT id FROM roles WHERE nombre = 'ADMINISTRADOR')
)
ON CONFLICT (nombre_usuario) DO NOTHING;

-- =============================================================================
-- MÓDULO 2: CATEGORÍAS DE INSUMOS
-- =============================================================================

INSERT INTO categorias_insumo (nombre, descripcion) VALUES
    ('Papel',              'Papeles de diferentes gramajes y formatos para impresión.'),
    ('Tóner e Tinta',      'Cartuchos de tóner, tintas y cilindros para impresoras.'),
    ('Encuadernación',     'Materiales para encuadernación: espirales, tapas, grapas, pegamento.'),
    ('Químicos',           'Soluciones químicas para procesos de impresión offset.'),
    ('Planchas y Cilindros','Planchas de impresión offset y cilindros de caucho.'),
    ('Embalaje',           'Materiales para embalaje y entrega de trabajos terminados.'),
    ('Varios',             'Otros insumos no clasificados en categorías anteriores.')
ON CONFLICT (nombre) DO NOTHING;

-- =============================================================================
-- INSUMOS BASE DE LA IMPRENTA
-- =============================================================================

INSERT INTO insumos (codigo, nombre, unidad_medida, categoria_id, stock_actual, stock_minimo, stock_maximo, precio_unitario) VALUES
    -- Papel
    ('PAP-A4-75',  'Papel Bond A4 75g/m²',          'resma',   (SELECT id FROM categorias_insumo WHERE nombre = 'Papel'), 150, 50, 500, 35.00),
    ('PAP-A4-90',  'Papel Bond A4 90g/m²',          'resma',   (SELECT id FROM categorias_insumo WHERE nombre = 'Papel'),  80, 30, 300, 45.00),
    ('PAP-A3-75',  'Papel Bond A3 75g/m²',          'resma',   (SELECT id FROM categorias_insumo WHERE nombre = 'Papel'),  40, 20, 200, 65.00),
    ('PAP-CAR',    'Cartulina Tamaño Oficio 200g',   'resma',   (SELECT id FROM categorias_insumo WHERE nombre = 'Papel'),  25, 10, 150, 90.00),
    ('PAP-GLO',    'Papel Couché Glossy A4 150g',    'resma',   (SELECT id FROM categorias_insumo WHERE nombre = 'Papel'),  20, 10, 100, 120.00),
    -- Tóner e Tinta
    ('TON-HP-BN',  'Tóner HP Negro Compatible',     'unidad',  (SELECT id FROM categorias_insumo WHERE nombre = 'Tóner e Tinta'),  8, 2, 20, 180.00),
    ('TON-HP-COL', 'Tóner HP Color (Tricolor)',      'unidad',  (SELECT id FROM categorias_insumo WHERE nombre = 'Tóner e Tinta'),  4, 2, 10, 320.00),
    ('TINT-OFF-BN','Tinta Offset Negra 1kg',         'kg',      (SELECT id FROM categorias_insumo WHERE nombre = 'Tóner e Tinta'), 12, 5, 30, 95.00),
    -- Encuadernación
    ('ESP-5MM',    'Espiral Plástico 5mm (x100)',    'paquete', (SELECT id FROM categorias_insumo WHERE nombre = 'Encuadernación'), 30, 10, 100, 15.00),
    ('ESP-8MM',    'Espiral Plástico 8mm (x100)',    'paquete', (SELECT id FROM categorias_insumo WHERE nombre = 'Encuadernación'), 25, 10, 100, 18.00),
    ('TAPA-PVC',   'Tapa PVC Transparente A4 (x100)','paquete',(SELECT id FROM categorias_insumo WHERE nombre = 'Encuadernación'), 15, 5,  50, 22.00),
    ('PEG-HOT',    'Barra de Pegamento Termofusible','unidad',  (SELECT id FROM categorias_insumo WHERE nombre = 'Encuadernación'), 50, 20, 200, 2.50),
    -- Químicos
    ('QUIM-SOL',   'Solución Fountain Offset 5L',   'litro',   (SELECT id FROM categorias_insumo WHERE nombre = 'Químicos'),  10, 5, 30, 45.00),
    ('QUIM-WASH',  'Lavador de Rodillos 1L',         'litro',   (SELECT id FROM categorias_insumo WHERE nombre = 'Químicos'),   8, 3, 20, 35.00)
ON CONFLICT (codigo) DO NOTHING;

-- =============================================================================
-- TARIFAS DE SERVICIOS DE IMPRESIÓN
-- =============================================================================

INSERT INTO tarifas (nombre_servicio, descripcion, precio_unitario, unidad) VALUES
    ('Fotocopia Blanco y Negro A4',     'Copia simple en papel bond A4 75g', 0.40,  'copia'),
    ('Fotocopia Color A4',              'Copia a color en papel bond A4 75g', 2.00,  'copia'),
    ('Impresión Láser B/N A4',          'Impresión láser en papel bond A4',   0.50,  'hoja'),
    ('Impresión Láser Color A4',        'Impresión láser a color en A4',      2.50,  'hoja'),
    ('Impresión Offset B/N A4',         'Impresión offset por millar mínimo', 0.20,  'hoja'),
    ('Impresión Offset Color A4',       'Impresión offset a color por millar', 1.20,  'hoja'),
    ('Encuadernado Espiral A4',         'Encuadernado con espiral plástico',  5.00,  'documento'),
    ('Empastado Tapa Dura A4',          'Empastado con tapa dura y lomo',    25.00,  'documento'),
    ('Laminado Brillante A4',           'Laminado con plástico brillante',    3.00,  'hoja'),
    ('Anillado Metálico A4',            'Anillado con espiral metálico',      8.00,  'documento'),
    ('Impresión Plotter A0',            'Impresión en plotter tamaño A0',    35.00,  'impresión'),
    ('Impresión Plotter A1',            'Impresión en plotter tamaño A1',    20.00,  'impresión'),
    ('Diseño Gráfico (hora)',           'Servicio de diseño gráfico por hora', 60.00, 'hora'),
    ('Diseño Tarjetas Presentación x100','Diseño e impresión 100 tarjetas',  80.00,  'ciento'),
    ('Serigrafía (color)',              'Impresión por serigrafía por color', 15.00,  'color/unidad')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- PROVEEDOR DE EJEMPLO
-- =============================================================================

INSERT INTO proveedores (nombre, nit, telefono, correo, direccion) VALUES
    ('Distribuidora de Papel El Pergamino Ltda.', '1234567890',  '3-3456789', 'ventas@pergamino.com.bo', 'Av. Cañoto #123, Santa Cruz de la Sierra'),
    ('Suministros de Oficina S.R.L.',             '9876543210', '3-3987654', 'info@suministros.com.bo',  'Av. San Martín #456, Santa Cruz de la Sierra')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- FIN DE DATOS SEMILLA
-- =============================================================================
