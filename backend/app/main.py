"""
Punto de entrada principal de la API REST.
Software Integral de Gestión y Predicción de Insumos - Imprenta Universitaria UAGRM
"""
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.permissions import get_current_user
from app.database import get_db
from app.routers import (
    auth,
    usuarios,
    clientes,
    insumos,
    tarifas,
    proveedores,
    proformas,
    ordenes,
    compras,
    predicciones,
    reportes,
    bitacora,
)
from app.schemas.tipo_trabajo import TipoTrabajoResponse
from app.services import tarifa_service

app = FastAPI(
    title="API Imprenta Universitaria UAGRM",
    description="Software Integral de Gestión y Predicción de Insumos mediante Machine Learning",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS — orígenes permitidos configurados desde variables de entorno
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prefijo global de la API — todas las rutas viven bajo /api/v1
API_PREFIX = "/api/v1"

app.include_router(auth.router,         prefix=API_PREFIX, tags=["Autenticación"])
app.include_router(usuarios.router,     prefix=API_PREFIX, tags=["Usuarios"])
app.include_router(clientes.router,     prefix=API_PREFIX, tags=["Clientes"])
app.include_router(insumos.router,      prefix=API_PREFIX, tags=["Insumos"])
app.include_router(tarifas.router,      prefix=API_PREFIX, tags=["Tarifas"])
app.include_router(proveedores.router,  prefix=API_PREFIX, tags=["Proveedores"])
app.include_router(proformas.router,    prefix=API_PREFIX, tags=["Proformas"])
app.include_router(ordenes.router,      prefix=API_PREFIX, tags=["Órdenes de Trabajo"])
app.include_router(compras.router,      prefix=API_PREFIX, tags=["Compras"])
app.include_router(predicciones.router, prefix=API_PREFIX, tags=["Predicciones ML"])
app.include_router(reportes.router,     prefix=API_PREFIX, tags=["Reportes"])
app.include_router(bitacora.router,     prefix=API_PREFIX, tags=["Bitácora"])


# Alias directo para tipos de trabajo (admite tanto /tipos-trabajo como /tarifas/tipos-trabajo)
@app.get(
    f"{API_PREFIX}/tipos-trabajo",
    response_model=list[TipoTrabajoResponse],
    tags=["Tarifas"],
    summary="Listar tipos de trabajo gráfico",
)
async def listar_tipos_trabajo_directo(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await tarifa_service.listar_tipos_trabajo(db)


@app.get("/", tags=["Health"])
async def root():
    """Health check del servicio — verifica que la API está en línea."""
    return {"status": "ok", "service": "Imprenta UAGRM API", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
