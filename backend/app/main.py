"""
Punto de entrada principal de la API REST.
Software Integral de Gestión y Predicción de Insumos - Imprenta Universitaria UAGRM
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
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


@app.get("/", tags=["Health"])
async def root():
    """Health check del servicio — verifica que la API está en línea."""
    return {"status": "ok", "service": "Imprenta UAGRM API", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
