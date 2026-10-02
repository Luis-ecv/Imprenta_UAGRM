# =============================================================================
# Dockerfile — Backend FastAPI (Python 3.11)
# Multi-stage: build con wheels → runtime liviano sin herramientas de compilación
# =============================================================================

# =============================================
# STAGE 1: Builder — compila e instala dependencias
# =============================================
FROM python:3.11-slim AS builder

WORKDIR /app

# Instalar dependencias de sistema necesarias para compilar extensiones nativas
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar e instalar dependencias Python generando wheels
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt


# =============================================
# STAGE 2: Runtime — imagen final liviana
# =============================================
FROM python:3.11-slim AS production

WORKDIR /app

# Solo la librería de runtime de PostgreSQL (no las de compilación)
RUN apt-get update && apt-get install -y \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copiar wheels del stage anterior e instalar sin recompilar
COPY --from=builder /app/wheels /wheels
RUN pip install --no-cache /wheels/*

# Copiar el código fuente del backend
COPY . .

# Crear directorio para los modelos ML entrenados
RUN mkdir -p /app/ml_models

# Crear usuario no-root para mayor seguridad en producción
RUN adduser --disabled-password --gecos "" appuser && \
    chown -R appuser:appuser /app
USER appuser

# Puerto de FastAPI / uvicorn
EXPOSE 8000

# Comando de inicio en producción (sin --reload)
# En desarrollo, docker-compose.dev.yml sobreescribe este comando
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
