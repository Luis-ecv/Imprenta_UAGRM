"""
Exporta los datos reales importados en la base de datos local hacia un script SQL
autónomo (db/03_datos_historicos_imprenta.sql) para inicialización automática en Azure.
"""
import asyncio
import os
import sys
from sqlalchemy import text

BACKEND_DIR = r"L:\projects 2-2026\TS\ProyectoF\backend"
os.chdir(BACKEND_DIR)
sys.path.insert(0, BACKEND_DIR)

from app.database import engine

OUTPUT_PATH = r"L:\projects 2-2026\TS\ProyectoF\db\03_datos_historicos_imprenta.sql"


async def dump_data():
    print("Iniciando exportación de datos históricos a SQL...")
    async with engine.connect() as conn:
        with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
            f.write("-- ============================================================================\n")
            f.write("-- DATOS HISTORICOS DE PRODUCCION REAL (EIU UAGRM 2021-2025)\n")
            f.write("-- Carga automatica de periodos, clientes, proformas, ordenes y consumos reales\n")
            f.write("-- Generado para inicializacion automatica de PostgreSQL en produccion (Azure)\n")
            f.write("-- ============================================================================\n\n")
            f.write("BEGIN;\n\n")

            # 1. Periodos académicos adicionales
            res = await conn.execute(
                text(
                    "SELECT id_periodo, gestion, semestre, fecha_inicio, fecha_fin, es_pico_demanda "
                    "FROM periodo_academico WHERE id_periodo > 4 ORDER BY id_periodo"
                )
            )
            periodos = res.fetchall()
            if periodos:
                f.write("-- 1. Periodos Academicos Adicionales (2021 - 2027)\n")
                f.write(
                    "INSERT INTO periodo_academico (id_periodo, gestion, semestre, fecha_inicio, fecha_fin, es_pico_demanda) VALUES\n"
                )
                p_lines = [
                    f"({p[0]}, {p[1]}, '{p[2]}', '{p[3]}', '{p[4]}', {'TRUE' if p[5] else 'FALSE'})"
                    for p in periodos
                ]
                f.write(",\n".join(p_lines))
                f.write("\nON CONFLICT (id_periodo) DO NOTHING;\n\n")
                f.write(
                    "SELECT setval(pg_get_serial_sequence('periodo_academico', 'id_periodo'), coalesce(max(id_periodo), 1)) FROM periodo_academico;\n\n"
                )

            # 2. Clientes (id_cliente > 4)
            res = await conn.execute(
                text(
                    "SELECT id_cliente, tipo_cliente, razon_social, telefono, email, direccion, codigo_facultad, dependencia, ci_nit "
                    "FROM cliente WHERE id_cliente > 4 ORDER BY id_cliente"
                )
            )
            clientes = res.fetchall()
            if clientes:
                f.write("-- 2. Clientes Institucionales y Facultades UAGRM\n")
                f.write(
                    "INSERT INTO cliente (id_cliente, tipo_cliente, razon_social, telefono, email, direccion, codigo_facultad, dependencia, ci_nit) VALUES\n"
                )
                c_lines = []
                for c in clientes:
                    fac = f"'{c[6]}'" if c[6] else "NULL"
                    dep = f"'{c[7]}'" if c[7] else "NULL"
                    ci = f"'{c[8]}'" if c[8] else "NULL"
                    rz = str(c[2]).replace("'", "''")
                    em = str(c[4]).replace("'", "''")
                    di = str(c[5]).replace("'", "''")
                    c_lines.append(f"({c[0]}, '{c[1]}', '{rz}', '{c[3]}', '{em}', '{di}', {fac}, {dep}, {ci})")
                f.write(",\n".join(c_lines))
                f.write("\nON CONFLICT (id_cliente) DO NOTHING;\n\n")
                f.write(
                    "SELECT setval(pg_get_serial_sequence('cliente', 'id_cliente'), coalesce(max(id_cliente), 1)) FROM cliente;\n\n"
                )

            # 3. Proformas
            res = await conn.execute(
                text(
                    "SELECT id_proforma, cliente_id, usuario_id, codigo_proforma, modalidad, total_presupuesto, estado, fecha_emision, fecha_vencimiento "
                    "FROM proforma ORDER BY id_proforma"
                )
            )
            proformas = res.fetchall()
            if proformas:
                f.write(f"-- 3. Proformas Historicas Aprobadas ({len(proformas)} registros)\n")
                f.write(
                    "INSERT INTO proforma (id_proforma, cliente_id, usuario_id, codigo_proforma, modalidad, total_presupuesto, estado, fecha_emision, fecha_vencimiento) VALUES\n"
                )
                pr_lines = [
                    f"({p[0]}, {p[1]}, {p[2]}, '{p[3]}', '{p[4]}', {p[5]}, '{p[6]}', '{p[7]}', '{p[8]}')"
                    for p in proformas
                ]
                f.write(",\n".join(pr_lines))
                f.write("\nON CONFLICT (id_proforma) DO NOTHING;\n\n")
                f.write(
                    "SELECT setval(pg_get_serial_sequence('proforma', 'id_proforma'), coalesce(max(id_proforma), 1)) FROM proforma;\n\n"
                )

            # 4. Ordenes de Trabajo
            res = await conn.execute(
                text(
                    "SELECT id_orden, proforma_id, usuario_id, codigo_ot, fecha_compromiso, prioridad, estado_actual, observaciones, created_at "
                    "FROM orden_trabajo ORDER BY id_orden"
                )
            )
            ordenes = res.fetchall()
            if ordenes:
                f.write(f"-- 4. Ordenes de Trabajo Litograficas ({len(ordenes)} registros)\n")
                f.write(
                    "INSERT INTO orden_trabajo (id_orden, proforma_id, usuario_id, codigo_ot, fecha_compromiso, prioridad, estado_actual, observaciones, created_at) VALUES\n"
                )
                ot_lines = []
                for o in ordenes:
                    if o[7]:
                        cleaned_obs = str(o[7]).replace("'", "''")
                        obs = f"'{cleaned_obs}'"
                    else:
                        obs = "NULL"
                    ot_lines.append(f"({o[0]}, {o[1]}, {o[2]}, '{o[3]}', '{o[4]}', '{o[5]}', '{o[6]}', {obs}, '{o[8]}')")
                f.write(",\n".join(ot_lines))
                f.write("\nON CONFLICT (id_orden) DO NOTHING;\n\n")
                f.write(
                    "SELECT setval(pg_get_serial_sequence('orden_trabajo', 'id_orden'), coalesce(max(id_orden), 1)) FROM orden_trabajo;\n\n"
                )

            # 5. Consumos Reales (consumo_real)
            res = await conn.execute(
                text(
                    "SELECT id_consumo, orden_id, insumo_id, cantidad_utilizada, cantidad_merma, created_at "
                    "FROM consumo_real ORDER BY id_consumo"
                )
            )
            consumos = res.fetchall()
            if consumos:
                f.write(f"-- 5. Consumos Reales y Mermas ({len(consumos)} registros para Machine Learning)\n")
                chunk_size = 500
                for i in range(0, len(consumos), chunk_size):
                    chunk = consumos[i : i + chunk_size]
                    f.write(
                        "INSERT INTO consumo_real (id_consumo, orden_id, insumo_id, cantidad_utilizada, cantidad_merma, created_at) VALUES\n"
                    )
                    c_lines = [f"({c[0]}, {c[1]}, {c[2]}, {c[3]}, {c[4]}, '{c[5]}')" for c in chunk]
                    f.write(",\n".join(c_lines))
                    f.write("\nON CONFLICT (id_consumo) DO NOTHING;\n\n")
                f.write(
                    "SELECT setval(pg_get_serial_sequence('consumo_real', 'id_consumo'), coalesce(max(id_consumo), 1)) FROM consumo_real;\n\n"
                )

            f.write("COMMIT;\n")
            print(f"[OK] Exportados {len(periodos)} periodos, {len(clientes)} clientes, {len(proformas)} proformas, {len(ordenes)} ordenes, {len(consumos)} consumos.")
            print(f"[OK] Archivo guardado en: {OUTPUT_PATH}")


if __name__ == "__main__":
    asyncio.run(dump_data())
