"""
Script de importación y carga masiva de datos históricos reales de la EIU.
Lee 'PRODUCCION EIU.xls' y puebla:
- Periodos académicos (2021-2027)
- Clientes institucionales (Facultades y Direcciones de la UAGRM)
- Proformas históricas aprobadas
- Órdenes de trabajo finalizadas
- Registros de consumo real y merma (ConsumoReal) para Machine Learning
"""
import asyncio
import os
import re
import sys
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
import pandas as pd
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Ajustar rutas para importar el backend
BACKEND_DIR = r"L:\projects 2-2026\TS\ProyectoF\backend"
os.chdir(BACKEND_DIR)
sys.path.insert(0, BACKEND_DIR)

from app.database import AsyncSessionLocal
from app.models.categoria_insumo import CategoriaInsumo
from app.models.cliente import Cliente
from app.models.consumo_real import ConsumoReal
from app.models.insumo import Insumo
from app.models.orden_trabajo import OrdenTrabajo
from app.models.periodo_academico import PeriodoAcademico
from app.models.proforma import Proforma
from app.models.usuario import Usuario

EXCEL_PATH = r"L:\projects 2-2026\TS\datos imprenta\PRODUCCION EIU.xls"


async def asegurar_periodos_academicos(db: AsyncSession):
    """Crea los periodos académicos semestrales desde 2021 hasta 2027 si faltan."""
    print("-> Verificando y creando periodos academicos (2021 - 2027)...")
    res = await db.execute(select(PeriodoAcademico))
    existentes = {(p.gestion, p.semestre): p for p in res.scalars().all()}

    nuevos = []
    for anio in range(2021, 2028):
        # Semestre I: Feb a Jun (Pico)
        if (anio, f"I-{anio}") not in existentes:
            nuevos.append(
                PeriodoAcademico(
                    gestion=anio,
                    semestre=f"I-{anio}",
                    fecha_inicio=date(anio, 2, 10),
                    fecha_fin=date(anio, 6, 30),
                    es_pico_demanda=True,
                )
            )
        # Semestre II: Ago a Dic (Pico)
        if (anio, f"II-{anio}") not in existentes:
            nuevos.append(
                PeriodoAcademico(
                    gestion=anio,
                    semestre=f"II-{anio}",
                    fecha_inicio=date(anio, 8, 5),
                    fecha_fin=date(anio, 12, 18),
                    es_pico_demanda=True,
                )
            )

    if nuevos:
        db.add_all(nuevos)
        await db.commit()
        print(f"   [OK] Se crearon {len(nuevos)} periodos academicos adicionales.")
    else:
        print("   [OK] Periodos academicos ya completos.")


async def obtener_mapa_insumos(db: AsyncSession) -> dict[str, int]:
    """Retorna un diccionario de código de insumo a id_insumo."""
    res = await db.execute(select(Insumo))
    return {ins.codigo: ins.id_insumo for ins in res.scalars().all()}


async def obtener_o_crear_cliente(db: AsyncSession, cache_clientes: dict, razon_social: str) -> int:
    """Busca o crea un cliente institucional en la base de datos."""
    razon_limpia = razon_social.strip()[:150]
    if not razon_limpia:
        razon_limpia = "Administración Central UAGRM"

    if razon_limpia in cache_clientes:
        return cache_clientes[razon_limpia]

    # Buscar en BD
    res = await db.execute(select(Cliente).where(Cliente.razon_social == razon_limpia))
    cliente = res.scalar_one_or_none()
    if cliente:
        cache_clientes[razon_limpia] = cliente.id_cliente
        return cliente.id_cliente

    # Crear nuevo cliente
    codigo_fac = None
    if "SALUD" in razon_limpia.upper():
        codigo_fac = "FCS"
    elif "AGR" in razon_limpia.upper():
        codigo_fac = "FCA"
    elif "JUR" in razon_limpia.upper() or "DERECHO" in razon_limpia.upper():
        codigo_fac = "FCJP"
    elif "TECNO" in razon_limpia.upper() or "FCET" in razon_limpia.upper():
        codigo_fac = "FCET"
    elif "HUMAN" in razon_limpia.upper():
        codigo_fac = "FH"
    elif "VET" in razon_limpia.upper():
        codigo_fac = "FCV"

    nuevo = Cliente(
        tipo_cliente="INTERNO",
        razon_social=razon_limpia,
        codigo_facultad=codigo_fac,
        dependencia="Unidad Solicitante",
        telefono="3598000",
        email=f"contacto.{re.sub(r'[^a-zA-Z0-9]', '', razon_limpia)[:15].lower()}@uagrm.edu.bo",
        direccion="Campus Universitario UAGRM",
        ci_nit="1020304050",
    )
    db.add(nuevo)
    await db.flush()
    await db.refresh(nuevo)
    cache_clientes[razon_limpia] = nuevo.id_cliente
    return nuevo.id_cliente


def extraer_cliente_de_detalle(detalle: str) -> str:
    """Extrae el nombre de la facultad o departamento solicitante del detalle."""
    det_up = detalle.upper()
    if "FACULTAD" in det_up or "FAC." in det_up:
        m = re.search(r"(?:FACULTAD|FAC\.)[^,-]+", detalle, re.IGNORECASE)
        if m:
            return m.group(0).strip()
    if "VICERRECTORADO" in det_up:
        return "Vicerrectorado UAGRM"
    if "SECRETARIA GENERAL" in det_up or "SECRETARÍA GENERAL" in det_up:
        return "Secretaría General UAGRM"
    if "RELACIONES PUBLICAS" in det_up or "RELACIONES PÚBLICAS" in det_up:
        return "Dpto. Relaciones Públicas UAGRM"
    if "D.U.B.S." in det_up or "BIENESTAR SOCIAL" in det_up:
        return "Dirección Universitaria de Bienestar Social (DUBS)"
    if "DICIT" in det_up or "INVESTIGACI" in det_up:
        return "Dirección de Investigación Científica e Innovación (DICIT)"
    if "PLANIFICAC" in det_up:
        return "Dirección Universitaria de Planificación"
    if "POSTGRADO" in det_up or "POSGRADO" in det_up:
        return "Escuela de Posgrado UAGRM"
    return "Editorial e Imprenta Universitaria (Interno)"


async def procesar_importacion():
    print("================================================================")
    print("INICIANDO IMPORTACION DE HISTORIAL DE PRODUCCION LITOGRAFICA")
    print(f"Archivo fuente: {EXCEL_PATH}")
    print("================================================================")

    xl = pd.ExcelFile(EXCEL_PATH)

    async with AsyncSessionLocal() as db:
        # Limpiar datos previos si existieran para evitar duplicados en re-ejecución
        print("-> Limpiando tablas de historial para carga limpia...")
        await db.execute(text("TRUNCATE TABLE consumo_real CASCADE"))
        await db.execute(text("TRUNCATE TABLE orden_trabajo CASCADE"))
        await db.execute(text("TRUNCATE TABLE proforma CASCADE"))
        await db.commit()

        await asegurar_periodos_academicos(db)
        insumos = await obtener_mapa_insumos(db)
        print("Insumos registrados:", insumos)

        cache_clientes = {}
        total_ordenes_creadas = 0
        total_consumos_creados = 0
        correlativo_global = 100

        # Hojas a procesar
        hojas = [
            ("PRODUCCIÓN 2021", 2021),
            ("PRODUCCIÓN 2022", 2022),
            ("2024", 2024),
            ("2025", 2025),
        ]

        for nombre_hoja, anio_defecto in hojas:
            print(f"\n--- Procesando hoja: '{nombre_hoja}' (Gestion {anio_defecto}) ---")
            df = xl.parse(nombre_hoja, header=4)
            df.columns = [str(c).strip() for c in df.columns]

            date_cols = [c for c in df.columns if "FECHA" in c.upper()]
            det_cols = [c for c in df.columns if "DETALLE" in c.upper()]
            cant_cols = [c for c in df.columns if "CANT" in c.upper()]
            cost_cols = [c for c in df.columns if "COSTO" in c.upper()]

            if not date_cols or not det_cols:
                print(f"   [!] No se encontraron columnas requeridas en {nombre_hoja}, omitiendo.")
                continue

            date_col = date_cols[0]
            det_col = det_cols[0]
            cant_col = cant_cols[0] if cant_cols else None
            cost_col = cost_cols[0] if cost_cols else None

            # Filtrar filas válidas
            subset = df[df[det_col].notna()].copy()

            ordenes_en_hoja = 0
            for idx, row in subset.iterrows():
                detalle = str(row[det_col]).strip()
                if not detalle or detalle.lower() == "nan" or len(detalle) < 4:
                    continue

                # Fecha
                val_fecha = row[date_col]
                fecha_trabajo = None
                try:
                    if pd.notna(val_fecha):
                        dt = pd.to_datetime(val_fecha)
                        if dt.year >= 2020:
                            fecha_trabajo = dt
                except Exception:
                    pass

                if not fecha_trabajo:
                    # Distribuir a lo largo de los meses del año para simular estacionalidad real
                    mes_sim = (ordenes_en_hoja % 10) + 2  # Feb a Nov
                    dia_sim = (ordenes_en_hoja % 25) + 1
                    fecha_trabajo = datetime(anio_defecto, mes_sim, dia_sim, 10, 0, tzinfo=timezone.utc)
                elif fecha_trabajo.tzinfo is None:
                    fecha_trabajo = fecha_trabajo.replace(tzinfo=timezone.utc)

                # Cantidad y Costo
                try:
                    tiraje = float(row[cant_col]) if cant_col and pd.notna(row[cant_col]) else 500.0
                    tiraje = max(50.0, tiraje)
                except Exception:
                    tiraje = 500.0

                try:
                    costo_val = float(row[cost_col]) if cost_col and pd.notna(row[cost_col]) else (tiraje * 1.5)
                    costo_val = max(50.0, costo_val)
                except Exception:
                    costo_val = tiraje * 1.5

                # Cliente
                nombre_cliente = extraer_cliente_de_detalle(detalle)
                cliente_id = await obtener_o_crear_cliente(db, cache_clientes, nombre_cliente)

                correlativo_global += 1
                cod_proforma = f"PRF-{fecha_trabajo.year}-{correlativo_global:05d}"
                cod_ot = f"OT-{fecha_trabajo.year}-{correlativo_global:05d}"

                # 1. Proforma
                proforma = Proforma(
                    cliente_id=cliente_id,
                    usuario_id=2,  # Administrador
                    codigo_proforma=cod_proforma,
                    modalidad="insumos_imprenta",
                    total_presupuesto=Decimal(str(round(costo_val, 2))),
                    estado="APROBADA",
                    fecha_emision=fecha_trabajo,
                    fecha_vencimiento=fecha_trabajo.date() + timedelta(days=15),
                )
                db.add(proforma)
                await db.flush()
                await db.refresh(proforma)

                # 2. Orden de Trabajo
                orden = OrdenTrabajo(
                    proforma_id=proforma.id_proforma,
                    usuario_id=4,  # Operador Taller
                    codigo_ot=cod_ot,
                    fecha_compromiso=fecha_trabajo.date() + timedelta(days=10),
                    prioridad="NORMAL",
                    estado_actual="FINALIZADO",
                    observaciones=detalle[:250],
                    created_at=fecha_trabajo,
                )
                db.add(orden)
                await db.flush()
                await db.refresh(orden)

                # 3. Consumo Real de Insumos (Reglas litográficas según el trabajo)
                det_upper = detalle.upper()
                consumos = []

                if "LIBRO" in det_upper or "REVISTA" in det_upper or "BOLETIN" in det_upper:
                    # Insumo 1: Papel Bond (Resmas) -> aprox 1 resma por cada 10 libros de 150 págs
                    resmas = round((tiraje * 120) / (500 * 4), 2)
                    resmas = max(1.0, resmas)
                    merma_papel = round(resmas * 0.04, 2)
                    consumos.append((insumos.get("PAP-BOND-75", 1), resmas, merma_papel))

                    # Insumo 2: Couché para tapas (Pliegos)
                    pliegos_tapa = round(tiraje / 4, 2)
                    merma_tapa = round(pliegos_tapa * 0.05, 2)
                    consumos.append((insumos.get("PAP-COUCH-150", 2), pliegos_tapa, merma_tapa))

                    # Insumo 8: Planchas CTP
                    planchas = 8.0 if "COLOR" in det_upper else 4.0
                    consumos.append((insumos.get("PLA-CTP-01", 8), planchas, 0.0))

                    # Insumo 4: Tinta Negra (Kg)
                    tinta = round(tiraje * 0.0015, 2)
                    consumos.append((insumos.get("TIN-OFF-NEG", 4), max(0.2, tinta), 0.02))

                    # Insumo 9: Pegamento Hotmelt (Kg)
                    pegamento = round(tiraje * 0.002, 2)
                    consumos.append((insumos.get("PEG-ENC-HOT", 9), max(0.1, pegamento), 0.01))

                elif "MEMBRET" in det_upper or "FORMULARIO" in det_upper or "HOJA" in det_upper:
                    # Insumo 1: Papel Bond 75g (Resmas)
                    resmas = round(tiraje / 500, 2)
                    merma_papel = round(resmas * 0.03, 2)
                    consumos.append((insumos.get("PAP-BOND-75", 1), max(0.5, resmas), merma_papel))

                    # Insumo 8: Planchas CTP
                    consumos.append((insumos.get("PLA-CTP-01", 8), 1.0, 0.0))

                    # Insumo 4: Tinta Negra
                    consumos.append((insumos.get("TIN-OFF-NEG", 4), 0.2, 0.01))

                elif "FOLDER" in det_upper or "CARATULA" in det_upper:
                    # Insumo 3: Cartulina Duplex (Pliegos)
                    pliegos = round(tiraje / 2, 2)
                    merma_cart = round(pliegos * 0.04, 2)
                    consumos.append((insumos.get("CAR-DUP-250", 3), max(10.0, pliegos), merma_cart))

                    # Planchas y Tintas CMYK
                    consumos.append((insumos.get("PLA-CTP-01", 8), 4.0, 0.0))
                    consumos.append((insumos.get("TIN-OFF-NEG", 4), 0.3, 0.02))
                    consumos.append((insumos.get("TIN-OFF-CYA", 5), 0.2, 0.01))
                    consumos.append((insumos.get("TIN-OFF-MAG", 6), 0.2, 0.01))
                    consumos.append((insumos.get("TIN-OFF-YEL", 7), 0.2, 0.01))

                else:
                    # Trabajo general: Afiches, trípticos, certificados
                    pliegos_c = round(tiraje / 4, 2)
                    consumos.append((insumos.get("PAP-COUCH-150", 2), max(5.0, pliegos_c), round(pliegos_c * 0.04, 2)))
                    consumos.append((insumos.get("PLA-CTP-01", 8), 2.0, 0.0))
                    consumos.append((insumos.get("TIN-OFF-NEG", 4), 0.2, 0.01))

                # Registrar consumos en la BD
                for id_ins, cant_u, cant_m in consumos:
                    c_obj = ConsumoReal(
                        orden_id=orden.id_orden,
                        insumo_id=id_ins,
                        cantidad_utilizada=Decimal(str(cant_u)),
                        cantidad_merma=Decimal(str(cant_m)),
                        created_at=fecha_trabajo,
                    )
                    db.add(c_obj)
                    total_consumos_creados += 1

                ordenes_en_hoja += 1
                total_ordenes_creadas += 1

            await db.commit()
            print(f"   [OK] {ordenes_en_hoja} ordenes y consumos insertados para {nombre_hoja}.")

        print("\n================================================================")
        print("RESUMEN DE CARGA COMPLETADA:")
        print(f"Total Ordenes de Trabajo creadas : {total_ordenes_creadas}")
        print(f"Total Registros ConsumoReal       : {total_consumos_creados}")
        print("================================================================")


if __name__ == "__main__":
    asyncio.run(procesar_importacion())
