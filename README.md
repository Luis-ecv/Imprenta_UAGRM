# Sistema Integral de GestiÃ³n y PredicciÃ³n de Insumos mediante Machine Learning
## Imprenta Universitaria â€” Universidad AutÃ³noma Gabriel RenÃ© Moreno (UAGRM)

Sistema web institucional para la gestiÃ³n de proformas de impresiÃ³n, Ã³rdenes de trabajo e inventario de insumos de la Imprenta de la UAGRM. Incorpora un mÃ³dulo de predicciÃ³n de demanda basado en Machine Learning (Random Forest Regressor) para optimizar las compras y evitar desabastecimiento.

Desarrollado bajo la metodologÃ­a **Proceso Unificado de Desarrollo de Software (PUDS)** con arquitectura **Three-Tier (3 capas)** desacoplada mediante servicios RESTful.

---

## Stack TecnolÃ³gico

| Capa | TecnologÃ­a | VersiÃ³n |
|------|-----------|---------|
| Frontend | React + Vite + TypeScript + Tailwind CSS | 18 / 5 / 5 / 3 |
| Backend | Python + FastAPI + SQLAlchemy | 3.11 / 0.115 / 2.0 |
| Base de datos | PostgreSQL | 16 |
| AutenticaciÃ³n | JWT (python-jose + bcrypt) | â€” |
| ContenerizaciÃ³n | Docker + Docker Compose | v2 |
| DocumentaciÃ³n API | Swagger / OpenAPI (nativo FastAPI) | â€” |

---

## Requisitos Previos

AsegÃºrese de tener instalados los siguientes programas antes de continuar:

- **Docker** â‰¥ 24.x â€” [Instalar Docker](https://docs.docker.com/get-docker/)
- **Docker Compose v2** (incluido en Docker Desktop) â€” `docker compose version`
- **Git** â‰¥ 2.x â€” [Instalar Git](https://git-scm.com/downloads)

---

## InstalaciÃ³n y EjecuciÃ³n

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd ProyectoF

# 2. Copiar y configurar variables de entorno
cp .env.example .env
# Editar .env con los valores reales (SECRET_KEY, contraseÃ±as, etc.)

# 3. Levantar en desarrollo (con hot reload)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# 4. Acceder al sistema
# Frontend:          http://localhost:5173
# Backend API:       http://localhost:8000
# DocumentaciÃ³n API: http://localhost:8000/docs
# Base de datos:     localhost:5432  (solo en modo desarrollo)
```

Para levantar en **producciÃ³n**:

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
â”œâ”€â”€ backend/                    # API REST â€” Python 3.11 + FastAPI
â”‚   â”œâ”€â”€ agents/                 # Agentes de IA / automatizaciÃ³n (Kiro)
â”‚   â”œâ”€â”€ app/                    # CÃ³digo fuente de la aplicaciÃ³n
â”‚   â”‚   â”œâ”€â”€ api/                # Routers y endpoints por mÃ³dulo
â”‚   â”‚   â”œâ”€â”€ core/               # ConfiguraciÃ³n, seguridad, dependencias
â”‚   â”‚   â”œâ”€â”€ models/             # Modelos SQLAlchemy (ORM)
â”‚   â”‚   â”œâ”€â”€ schemas/            # Esquemas Pydantic (validaciÃ³n/serializaciÃ³n)
â”‚   â”‚   â”œâ”€â”€ services/           # LÃ³gica de negocio
â”‚   â”‚   â”œâ”€â”€ ml/                 # MÃ³dulo de Machine Learning
â”‚   â”‚   â””â”€â”€ main.py             # Punto de entrada de FastAPI
â”‚   â”œâ”€â”€ tests/                  # Pruebas unitarias e integraciÃ³n
â”‚   â”œâ”€â”€ Dockerfile              # Imagen Docker del backend
â”‚   â”œâ”€â”€ requirements.txt        # Dependencias Python
â”‚   â””â”€â”€ .env.example            # Plantilla de variables de entorno del backend
â”‚
â”œâ”€â”€ frontend/                   # SPA â€” React 18 + Vite 5 + TypeScript
â”‚   â”œâ”€â”€ agents/                 # Agentes de IA / automatizaciÃ³n (Kiro)
â”‚   â”œâ”€â”€ src/                    # CÃ³digo fuente React
â”‚   â”‚   â”œâ”€â”€ assets/             # ImÃ¡genes, Ã­conos, fuentes
â”‚   â”‚   â”œâ”€â”€ components/         # Componentes reutilizables
â”‚   â”‚   â”œâ”€â”€ pages/              # PÃ¡ginas / vistas por mÃ³dulo
â”‚   â”‚   â”œâ”€â”€ services/           # Llamadas a la API (axios/fetch)
â”‚   â”‚   â”œâ”€â”€ store/              # Estado global (Zustand / Redux)
â”‚   â”‚   â”œâ”€â”€ hooks/              # Custom hooks
â”‚   â”‚   â”œâ”€â”€ types/              # Tipos e interfaces TypeScript
â”‚   â”‚   â””â”€â”€ main.tsx            # Punto de entrada de React
â”‚   â”œâ”€â”€ public/                 # Recursos estÃ¡ticos pÃºblicos
â”‚   â”œâ”€â”€ Dockerfile              # Imagen Docker del frontend (build + Nginx)
â”‚   â”œâ”€â”€ package.json            # Dependencias Node.js
â”‚   â””â”€â”€ .env.example            # Plantilla de variables de entorno del frontend
â”‚
â”œâ”€â”€ db/                         # Scripts SQL de base de datos
â”‚   â”œâ”€â”€ esquema_imprenta_uagrm.sql      # DDL: tablas, Ã­ndices, restricciones
â”‚   â””â”€â”€ datos_semilla_imprenta_uagrm.sql # DML: datos iniciales del sistema
â”‚
â”œâ”€â”€ docker-compose.yml          # OrquestaciÃ³n Docker â€” producciÃ³n
â”œâ”€â”€ docker-compose.dev.yml      # Override Docker â€” desarrollo (hot reload)
â”œâ”€â”€ .env.example                # Plantilla global de variables de entorno
â”œâ”€â”€ .gitignore                  # Archivos excluidos del control de versiones
â””â”€â”€ README.md                   # Este archivo
```

---

## MÃ³dulos del Sistema

El sistema estÃ¡ organizado en cuatro mÃ³dulos funcionales principales:

1. **AdministraciÃ³n y Seguridad**
   GestiÃ³n de usuarios, roles (RBAC), clientes institucionales y registro de auditorÃ­a de acciones crÃ­ticas.

2. **CatÃ¡logos, Inventario y ParÃ¡metros**
   AdministraciÃ³n del catÃ¡logo de insumos de impresiÃ³n, control de stock, tarifas de servicios y parÃ¡metros operativos generales.

3. **GestiÃ³n de ProducciÃ³n**
   ElaboraciÃ³n de proformas de impresiÃ³n, generaciÃ³n y seguimiento de Ã³rdenes de trabajo, y registro del consumo real de insumos por orden.

4. **Compras y Machine Learning**
   GestiÃ³n del proceso de compras de insumos y predicciÃ³n de demanda futura mediante el algoritmo **Random Forest Regressor**, entrenado con el historial de consumo de la imprenta.

---

## DocumentaciÃ³n de la API

La documentaciÃ³n interactiva de la API REST se genera automÃ¡ticamente con FastAPI:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **OpenAPI JSON:** http://localhost:8000/openapi.json

---

## ContribuciÃ³n

1. Crear una rama descriptiva: `git checkout -b feature/nombre-de-la-funcionalidad`
2. Realizar los cambios y commitear: `git commit -m "feat: descripciÃ³n del cambio"`
3. Abrir un Pull Request hacia la rama `main`

---

*Desarrollado para la Imprenta Universitaria de la UAGRM â€” Santa Cruz, Bolivia.*
---

## Ejecución en Entorno Local (Desarrollo Nativo sin Docker)

Para desarrollar localmente con recarga en caliente (*hot reload*) directo en el sistema operativo:

### 1. Requisitos Previos Locales
- **Python** 3.10+ instalado.
- **Node.js** ≥ 20.x y **npm** ≥ 10.x instalados.
- **PostgreSQL** 16 ejecutándose en el puerto `5432` con la base de datos `imprenta_uagrm` creada y migrada.

### 2. Levantar el Backend (FastAPI)
Abrir una terminal en la raíz del proyecto:
```powershell
cd backend

# Crear entorno virtual (si no existe)
python -m venv venv

# Activar entorno virtual
# En Windows (PowerShell):
.\venv\Scripts\activate
# En Linux / macOS:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements-dev.txt

# Iniciar servidor con recarga automática
uvicorn app.main:app --reload --port 8000
```
- **API Base:** `http://localhost:8000/api/v1`
- **Documentación Swagger:** `http://localhost:8000/docs`

---

### 3. Levantar el Frontend (React 18 + Vite 5 + TypeScript)
Abrir una segunda terminal paralela:
```powershell
cd frontend

# Instalar dependencias (incluye MUI, Emotion, Lucide y Recharts)
npm install

# Verificar compilación limpia de TypeScript
npm run build

# Iniciar servidor de desarrollo Vite
npm run dev
```
- **Aplicación Web SPA:** `http://localhost:5173`

---

### 4. Credenciales de Prueba Preconfiguradas (Datos Semilla)
Todas las cuentas de prueba iniciales utilizan la contraseña segura: `Uagrm2026*`

| Rol Oficial | Correo Institucional | Acceso Principal |
| :--- | :--- | :--- |
| **Superadministrador** | `superadmin@uagrm.edu.bo` | Acceso total + Auditoría Bitácora |
| **Administrador** | `admin@uagrm.edu.bo` | Panel General, ML, Compras y Usuarios |
| **Operador Mostrador** | `mostrador@uagrm.edu.bo` | Cotizador de Proformas y Clientes |
| **Operador Taller** | `taller@uagrm.edu.bo` | Tablero Kanban y Cierre Técnico con Merma |
| **Cliente Universitario**| `cliente@uagrm.edu.bo` | Seguimiento de solicitudes y proformas |
