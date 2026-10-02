# Sistema Integral de Gestión y Predicción de Insumos mediante Machine Learning
## Imprenta Universitaria — Universidad Autónoma Gabriel René Moreno (UAGRM)

Sistema web institucional para la gestión de proformas de impresión, órdenes de trabajo e inventario de insumos de la Imprenta de la UAGRM. Incorpora un módulo de predicción de demanda basado en Machine Learning (Random Forest Regressor) para optimizar las compras y evitar desabastecimiento.

Desarrollado bajo la metodología **Proceso Unificado de Desarrollo de Software (PUDS)** con arquitectura **Three-Tier (3 capas)** desacoplada mediante servicios RESTful.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | React + Vite + TypeScript + Tailwind CSS | 18 / 5 / 5 / 3 |
| Backend | Python + FastAPI + SQLAlchemy | 3.11 / 0.115 / 2.0 |
| Base de datos | PostgreSQL | 16 |
| Autenticación | JWT (python-jose + bcrypt) | — |
| Contenerización | Docker + Docker Compose | v2 |
| Documentación API | Swagger / OpenAPI (nativo FastAPI) | — |

---

## Requisitos Previos

Asegúrese de tener instalados los siguientes programas antes de continuar:

- **Docker** ≥ 24.x — [Instalar Docker](https://docs.docker.com/get-docker/)
- **Docker Compose v2** (incluido en Docker Desktop) — `docker compose version`
- **Git** ≥ 2.x — [Instalar Git](https://git-scm.com/downloads)

---

## Instalación y Ejecución

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd ProyectoF

# 2. Copiar y configurar variables de entorno
cp .env.example .env
# Editar .env con los valores reales (SECRET_KEY, contraseñas, etc.)

# 3. Levantar en desarrollo (con hot reload)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# 4. Acceder al sistema
# Frontend:          http://localhost:5173
# Backend API:       http://localhost:8000
# Documentación API: http://localhost:8000/docs
# Base de datos:     localhost:5432  (solo en modo desarrollo)
```

Para levantar en **producción**:

```bash
docker compose up --build -d
# Frontend: http://localhost:80
```

Para detener todos los servicios:

```bash
docker compose down
```

---

## Estructura del Proyecto

```
ProyectoF/
├── backend/                    # API REST — Python 3.11 + FastAPI
│   ├── agents/                 # Agentes de IA / automatización (Kiro)
│   ├── app/                    # Código fuente de la aplicación
│   │   ├── api/                # Routers y endpoints por módulo
│   │   ├── core/               # Configuración, seguridad, dependencias
│   │   ├── models/             # Modelos SQLAlchemy (ORM)
│   │   ├── schemas/            # Esquemas Pydantic (validación/serialización)
│   │   ├── services/           # Lógica de negocio
│   │   ├── ml/                 # Módulo de Machine Learning
│   │   └── main.py             # Punto de entrada de FastAPI
│   ├── tests/                  # Pruebas unitarias e integración
│   ├── Dockerfile              # Imagen Docker del backend
│   ├── requirements.txt        # Dependencias Python
│   └── .env.example            # Plantilla de variables de entorno del backend
│
├── frontend/                   # SPA — React 18 + Vite 5 + TypeScript
│   ├── agents/                 # Agentes de IA / automatización (Kiro)
│   ├── src/                    # Código fuente React
│   │   ├── assets/             # Imágenes, íconos, fuentes
│   │   ├── components/         # Componentes reutilizables
│   │   ├── pages/              # Páginas / vistas por módulo
│   │   ├── services/           # Llamadas a la API (axios/fetch)
│   │   ├── store/              # Estado global (Zustand / Redux)
│   │   ├── hooks/              # Custom hooks
│   │   ├── types/              # Tipos e interfaces TypeScript
│   │   └── main.tsx            # Punto de entrada de React
│   ├── public/                 # Recursos estáticos públicos
│   ├── Dockerfile              # Imagen Docker del frontend (build + Nginx)
│   ├── package.json            # Dependencias Node.js
│   └── .env.example            # Plantilla de variables de entorno del frontend
│
├── db/                         # Scripts SQL de base de datos
│   ├── esquema_imprenta_uagrm.sql      # DDL: tablas, índices, restricciones
│   └── datos_semilla_imprenta_uagrm.sql # DML: datos iniciales del sistema
│
├── docker-compose.yml          # Orquestación Docker — producción
├── docker-compose.dev.yml      # Override Docker — desarrollo (hot reload)
├── .env.example                # Plantilla global de variables de entorno
├── .gitignore                  # Archivos excluidos del control de versiones
└── README.md                   # Este archivo
```

---

## Módulos del Sistema

El sistema está organizado en cuatro módulos funcionales principales:

1. **Administración y Seguridad**
   Gestión de usuarios, roles (RBAC), clientes institucionales y registro de auditoría de acciones críticas.

2. **Catálogos, Inventario y Parámetros**
   Administración del catálogo de insumos de impresión, control de stock, tarifas de servicios y parámetros operativos generales.

3. **Gestión de Producción**
   Elaboración de proformas de impresión, generación y seguimiento de órdenes de trabajo, y registro del consumo real de insumos por orden.

4. **Compras y Machine Learning**
   Gestión del proceso de compras de insumos y predicción de demanda futura mediante el algoritmo **Random Forest Regressor**, entrenado con el historial de consumo de la imprenta.

---

## Documentación de la API

La documentación interactiva de la API REST se genera automáticamente con FastAPI:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **OpenAPI JSON:** http://localhost:8000/openapi.json

---

## Contribución

1. Crear una rama descriptiva: `git checkout -b feature/nombre-de-la-funcionalidad`
2. Realizar los cambios y commitear: `git commit -m "feat: descripción del cambio"`
3. Abrir un Pull Request hacia la rama `main`

---

*Desarrollado para la Imprenta Universitaria de la UAGRM — Santa Cruz, Bolivia.*
