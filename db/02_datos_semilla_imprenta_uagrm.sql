-- ============================================================================
-- DATOS SEMILLA: Editorial e Imprenta Universitaria (UAGRM)
-- Inicialización de roles, usuarios base, catálogos, tarifas y periodos
-- Contraseña unificada para todos los usuarios semilla: Uagrm2026*
-- ============================================================================

BEGIN;

-- 1. Roles
INSERT INTO rol (id_rol, nombre, descripcion) VALUES
(1, 'Superadministrador', 'Acceso técnico total, configuración global y auditoría del sistema'),
(2, 'Administrador', 'Jefe de imprenta, supervisión operativa, aprobación y machine learning'),
(3, 'Operador Mostrador', 'Atención en recepción, cálculo paramétrico de proformas y entregas'),
(4, 'Operador Taller', 'Operario de imprenta, avance de órdenes de trabajo y registro de mermas'),
(5, 'Cliente', 'Delegado facultativo o solicitante institucional con acceso de consulta')
ON CONFLICT (nombre) DO UPDATE SET descripcion = EXCLUDED.descripcion;

SELECT setval(pg_get_serial_sequence('rol', 'id_rol'), coalesce(max(id_rol), 1)) FROM rol;

-- 2. Usuarios Iniciales (Hash bcrypt de 'Uagrm2026*')
INSERT INTO usuario (id_usuario, rol_id, nombre_completo, email, password_hash, activo) VALUES
(1, 1, 'Luis Eduardo Céspedes', 'superadmin@uagrm.edu.bo', '$2b$12$mintm4Sptdb2momaflVl8OJ.xjyMG8bso7/SRKO4zX0Pb/l98qo52', TRUE),
(2, 2, 'Ing. Carlos Mendoza (Jefe Imprenta)', 'administrador@uagrm.edu.bo', '$2b$12$mintm4Sptdb2momaflVl8OJ.xjyMG8bso7/SRKO4zX0Pb/l98qo52', TRUE),
(3, 3, 'Lic. María Elena Ramos (Recepción)', 'mostrador@uagrm.edu.bo', '$2b$12$mintm4Sptdb2momaflVl8OJ.xjyMG8bso7/SRKO4zX0Pb/l98qo52', TRUE),
(4, 4, 'Téc. Roberto Justiniano (Maquinista)', 'taller@uagrm.edu.bo', '$2b$12$mintm4Sptdb2momaflVl8OJ.xjyMG8bso7/SRKO4zX0Pb/l98qo52', TRUE),
(5, 5, 'Delegado FICCT (Facultad Computación)', 'delegado.ficct@uagrm.edu.bo', '$2b$12$mintm4Sptdb2momaflVl8OJ.xjyMG8bso7/SRKO4zX0Pb/l98qo52', TRUE)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, rol_id = EXCLUDED.rol_id;

SELECT setval(pg_get_serial_sequence('usuario', 'id_usuario'), coalesce(max(id_usuario), 1)) FROM usuario;

-- 3. Clientes Institucionales UAGRM
INSERT INTO cliente (id_cliente, tipo_cliente, razon_social, telefono, email, direccion, codigo_facultad, dependencia, ci_nit) VALUES
(1, 'Institucional', 'Facultad de Ingeniería en Ciencias de la Computación (FICCT)', '3-3554411', 'ficct@uagrm.edu.bo', 'Campus Universitario Mod. 236', 'FICCT', 'Decanato', '1020304050'),
(2, 'Institucional', 'Facultad de Ciencias Económicas y Financieras (FCEF)', '3-3554422', 'economicas@uagrm.edu.bo', 'Campus Universitario Mod. 240', 'FCEF', 'Dirección de Carrera', '1020304051'),
(3, 'Institucional', 'Facultad de Humanidades (FH)', '3-3554433', 'humanidades@uagrm.edu.bo', 'Campus Universitario Mod. 210', 'FH', 'Vicedecanatura', '1020304052'),
(4, 'Particular', 'Editorial Universitaria Independiente', '7-7889900', 'contacto@edituniver.bo', 'Av. Busch 2do Anillo', NULL, NULL, '4938201018')
ON CONFLICT (id_cliente) DO NOTHING;

SELECT setval(pg_get_serial_sequence('cliente', 'id_cliente'), coalesce(max(id_cliente), 1)) FROM cliente;

-- 4. Categorías de Insumos
INSERT INTO categoria_insumo (id_categoria, nombre, unidad_base) VALUES
(1, 'Papeles y Cartulinas', 'Resma / Pliego'),
(2, 'Tintas Offset', 'Kilogramo'),
(3, 'Matrices y Planchas', 'Unidad'),
(4, 'Químicos y Acabados', 'Litro / Kilogramo')
ON CONFLICT (nombre) DO UPDATE SET unidad_base = EXCLUDED.unidad_base;

SELECT setval(pg_get_serial_sequence('categoria_insumo', 'id_categoria'), coalesce(max(id_categoria), 1)) FROM categoria_insumo;

-- 5. Catálogo Base de Insumos
INSERT INTO insumo (id_insumo, categoria_id, codigo, descripcion, stock_actual, stock_minimo, costo_reposicion, unidad_medida) VALUES
(1, 1, 'PAP-BOND-75', 'Papel Bond 75g Tamaño Oficio', 120.00, 20.00, 38.50, 'Resma'),
(2, 1, 'PAP-COUCH-150', 'Papel Couché Brillante 150g Pliego', 350.00, 50.00, 4.20, 'Pliego'),
(3, 1, 'CAR-DUP-250', 'Cartulina Dúplex 250g Pliego', 180.00, 30.00, 6.50, 'Pliego'),
(4, 2, 'TIN-OFF-NEG', 'Tinta Offset Process Black', 45.00, 10.00, 85.00, 'Kg'),
(5, 2, 'TIN-OFF-CYA', 'Tinta Offset Process Cyan', 30.00, 8.00, 92.00, 'Kg'),
(6, 2, 'TIN-OFF-MAG', 'Tinta Offset Process Magenta', 28.00, 8.00, 92.00, 'Kg'),
(7, 2, 'TIN-OFF-YEL', 'Tinta Offset Process Yellow', 32.00, 8.00, 92.00, 'Kg'),
(8, 3, 'PLA-CTP-01', 'Plancha Térmica CTP 0.30mm', 150.00, 25.00, 35.00, 'Unidad'),
(9, 4, 'PEG-ENC-HOT', 'Pegamento Termofusible Hotmelt', 60.00, 15.00, 48.00, 'Kg')
ON CONFLICT (codigo) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    costo_reposicion = EXCLUDED.costo_reposicion,
    stock_minimo = EXCLUDED.stock_minimo;

SELECT setval(pg_get_serial_sequence('insumo', 'id_insumo'), coalesce(max(id_insumo), 1)) FROM insumo;

-- 6. Proveedores
INSERT INTO proveedor (id_proveedor, razon_social, nit, contacto, telefono, email, direccion) VALUES
(1, 'Papelera Santa Cruz S.A.', '1029384756', 'Ing. Roberto Paz', '3-3445566', 'ventas@papelerasantacruz.bo', 'Parque Industrial Mz. 12'),
(2, 'Insumos Gráficos Bolivia S.R.L.', '2039485761', 'Lic. Andrea Suárez', '3-3667788', 'cotizaciones@insumosgraficos.bo', 'Av. Cristo Redentor Km 4.5'),
(3, 'Química Gráfica Oriental', '3049586712', 'Sr. Mario Vargas', '3-3778899', 'pedidos@quimicaoriental.bo', 'Av. Doble Vía La Guardia Km 6')
ON CONFLICT (nit) DO NOTHING;

SELECT setval(pg_get_serial_sequence('proveedor', 'id_proveedor'), coalesce(max(id_proveedor), 1)) FROM proveedor;

-- 7. Insumo - Proveedor (Cotizaciones)
INSERT INTO insumo_proveedor (insumo_id, proveedor_id, precio_cotizado, fecha_cotizacion) VALUES
(1, 1, 38.00, CURRENT_DATE),
(2, 1, 4.10, CURRENT_DATE),
(4, 2, 84.00, CURRENT_DATE),
(8, 2, 34.50, CURRENT_DATE),
(9, 3, 47.00, CURRENT_DATE)
ON CONFLICT (insumo_id, proveedor_id) DO NOTHING;

-- 8. Tarifas de Producción y Mano de Obra
INSERT INTO tarifa (id_tarifa, concepto, precio_unitario, tipo_tarifa, vigencia_hasta) VALUES
(1, 'Tirada Offset Monocolor por Millar', 65.00, 'Hora-Máquina', '2026-12-31'),
(2, 'Tirada Offset Cuatricromía (CMYK) por Millar', 140.00, 'Hora-Máquina', '2026-12-31'),
(3, 'Corte en Guillotina Programable por Millar', 25.00, 'Mano de Obra', '2026-12-31'),
(4, 'Encuadernación Rústica Fresada por Millar', 180.00, 'Acabado', '2026-12-31'),
(5, 'Doblado y Alzado Mecánico por Millar', 35.00, 'Acabado', '2026-12-31')
ON CONFLICT (id_tarifa) DO UPDATE SET precio_unitario = EXCLUDED.precio_unitario;

SELECT setval(pg_get_serial_sequence('tarifa', 'id_tarifa'), coalesce(max(id_tarifa), 1)) FROM tarifa;

-- 9. Tipos de Trabajo Gráfico
INSERT INTO tipo_trabajo (id_tipo_trabajo, nombre, descripcion, activo) VALUES
(1, 'Libro o Texto Guía Docente', 'Edición bibliográfica con encuadernación rústica y lomo pegado', TRUE),
(2, 'Revista Institucional o Científica', 'Impresión policromía CMYK en couché con grampado a caballo', TRUE),
(3, 'Tríptico / Folleto Informativo', 'Plegado en acordeón a 3 cuerpos full color', TRUE),
(4, 'Afiche Promocional Académico', 'Impresión formato pliego o medio pliego full color', TRUE),
(5, 'Talonario / Formulario Institucional', 'Papel químico autocopiante encolado con numeración', TRUE)
ON CONFLICT (nombre) DO NOTHING;

SELECT setval(pg_get_serial_sequence('tipo_trabajo', 'id_tipo_trabajo'), coalesce(max(id_tipo_trabajo), 1)) FROM tipo_trabajo;

-- 10. Periodos Académicos
INSERT INTO periodo_academico (id_periodo, gestion, semestre, fecha_inicio, fecha_fin, es_pico_demanda) VALUES
(1, 2025, 'I-2025', '2025-02-10', '2025-06-30', TRUE),
(2, 2025, 'II-2025', '2025-08-04', '2025-12-15', TRUE),
(3, 2026, 'I-2026', '2026-02-09', '2026-06-26', TRUE),
(4, 2026, 'II-2026', '2026-08-03', '2026-12-18', TRUE)
ON CONFLICT (id_periodo) DO NOTHING;

SELECT setval(pg_get_serial_sequence('periodo_academico', 'id_periodo'), coalesce(max(id_periodo), 1)) FROM periodo_academico;

COMMIT;
