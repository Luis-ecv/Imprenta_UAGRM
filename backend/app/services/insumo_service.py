"""
Servicio de Insumos e Inventario.
Lógica de negocio para el catálogo de insumos, control de stock y movimientos.
"""
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictoRegistro, RecursoNoEncontrado
from app.repositories.insumo_repository import InsumoRepository
from app.schemas.common import RespuestaPaginada
from app.schemas.insumo import (
    CategoriaInsumoCreate,
    CategoriaInsumoResponse,
    InsumoCreate,
    InsumoResponse,
    InsumoUpdate,
    MovimientoInventarioCreate,
    MovimientoInventarioResponse,
)


async def listar(
    db: AsyncSession, pagina: int, por_pagina: int
) -> RespuestaPaginada[InsumoResponse]:
    """Retorna la lista paginada de insumos del catálogo."""
    # TODO: implementar usando InsumoRepository.listar_paginado
    pass


async def crear(db: AsyncSession, datos: InsumoCreate) -> InsumoResponse:
    """
    Registra un nuevo insumo. Verifica que el código no esté duplicado.
    """
    # TODO: implementar
    # 1. Verificar unicidad del código (ConflictoRegistro si duplicado)
    # 2. Persistir con InsumoRepository.crear
    pass


async def obtener(db: AsyncSession, insumo_id: int) -> InsumoResponse:
    """Retorna un insumo por ID. Lanza RecursoNoEncontrado si no existe."""
    # TODO: implementar usando InsumoRepository.obtener_por_id
    pass


async def actualizar(
    db: AsyncSession, insumo_id: int, datos: InsumoUpdate
) -> InsumoResponse:
    """Actualiza los datos de un insumo existente."""
    # TODO: implementar usando InsumoRepository.actualizar
    pass


async def registrar_movimiento(
    db: AsyncSession, insumo_id: int, datos: MovimientoInventarioCreate
) -> MovimientoInventarioResponse:
    """
    Registra un movimiento de inventario y actualiza el stock_actual del insumo.
    - ENTRADA: suma la cantidad al stock.
    - SALIDA: resta la cantidad (valida que haya stock suficiente).
    - AJUSTE: reemplaza el stock con la cantidad indicada.
    """
    # TODO: implementar
    # 1. Obtener insumo (RecursoNoEncontrado si no existe)
    # 2. Calcular nuevo stock según tipo_movim
    # 3. Para SALIDA: verificar stock suficiente (StockInsuficiente si no alcanza)
    # 4. Persistir movimiento y actualizar stock con InsumoRepository
    pass


async def listar_categorias(db: AsyncSession) -> list[CategoriaInsumoResponse]:
    """Retorna todas las categorías de insumos activas."""
    # TODO: implementar usando InsumoRepository.listar_categorias
    pass


async def crear_categoria(
    db: AsyncSession, datos: CategoriaInsumoCreate
) -> CategoriaInsumoResponse:
    """Crea una nueva categoría de insumos."""
    # TODO: implementar usando InsumoRepository.crear_categoria
    pass
