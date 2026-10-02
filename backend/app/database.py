"""
Configuración de la conexión asíncrona a PostgreSQL con SQLAlchemy 2.0.
Usa asyncpg como driver de bajo nivel para máximo rendimiento.
"""
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import settings

# =============================================================================
# Motor asíncrono de conexión a la base de datos
# =============================================================================
engine = create_async_engine(
    settings.DATABASE_URL,
    # Activa el log de sentencias SQL solo en entorno de desarrollo
    echo=settings.ENVIRONMENT == "development",
    pool_size=10,
    max_overflow=20,
    # Evita errores de conexiones caducas en el pool
    pool_pre_ping=True,
)

# =============================================================================
# Fábrica de sesiones asíncronas
# =============================================================================
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependencia de FastAPI: provee una sesión de base de datos por request.

    Uso en un router:
        async def mi_endpoint(db: AsyncSession = Depends(get_db)):
            ...

    Maneja commit, rollback y cierre automáticamente.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
