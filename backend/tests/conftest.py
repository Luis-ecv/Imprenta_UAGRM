"""
Fixtures de pytest para los tests del backend.
Configura una base de datos de test aislada y un cliente HTTP asíncrono.
"""
import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.database import get_db
from app.main import app
from app.models.base import Base

# URL de la base de datos de test (SQLite en memoria para tests rápidos)
# Para tests de integración real, usar PostgreSQL de test:
# TEST_DATABASE_URL = "postgresql+asyncpg://test_user:test_pass@localhost:5432/test_imprenta"
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture(scope="session")
async def engine_test():
    """Motor de BD de test creado una vez por sesión."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def db_test(engine_test) -> AsyncSession:
    """Sesión de BD de test con rollback automático al finalizar cada test."""
    AsyncSessionTest = async_sessionmaker(
        bind=engine_test,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    async with AsyncSessionTest() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def client(db_test: AsyncSession) -> AsyncClient:
    """
    Cliente HTTP asíncrono que sobreescribe la dependencia get_db
    para usar la BD de test en lugar de la de producción.
    """
    async def override_get_db():
        yield db_test

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
