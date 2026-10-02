"""
Servicio de Bitácora (Auditoría).
Registra automáticamente todas las operaciones críticas del sistema.
Este servicio es llamado por otros services, nunca por routers directamente.

REGLA: Toda operación de escritura crítica (crear, modificar estado, eliminar)
       debe invocar bitacora_service.registrar() antes de retornar.
"""
from sqlalchemy.ext.asyncio import AsyncSession


async def registrar(
    db: AsyncSession,
    usuario_id: int,
    accion: str,
    tabla_afec: str | None = None,
    registro_id: int | None = None,
    detalle: dict | None = None,
    ip_origen: str | None = None,
) -> None:
    """
    Persiste un registro de auditoría en la tabla bitacora.

    Args:
        db: Sesión de base de datos activa.
        usuario_id: ID del usuario que ejecutó la acción.
        accion: Descripción de la acción (ej: "CREAR_ORDEN", "CAMBIAR_ESTADO").
        tabla_afec: Nombre de la tabla afectada (ej: "ordenes_trabajo").
        registro_id: ID del registro afectado.
        detalle: Datos adicionales en formato JSON (estado anterior/nuevo, etc.).
        ip_origen: Dirección IP del cliente que realizó la petición.
    """
    # TODO: implementar inserción en la tabla bitacora usando SQLAlchemy
    pass


async def listar(
    db: AsyncSession,
    pagina: int,
    por_pagina: int,
    usuario_id: int | None = None,
    accion: str | None = None,
) -> dict:
    """
    Retorna el historial paginado de la bitácora.
    Permite filtrar por usuario y tipo de acción.
    """
    # TODO: implementar con filtros opcionales
    pass
