# Arquitectura y Ejecución del Proyecto: Imprenta Universitaria UAGRM

Este documento sirve como registro oficial para la estructura, instalación y ejecución del proyecto, asegurando que cualquier desarrollador pueda levantar el entorno rápidamente.

## 1. Resumen de Arquitectura
El proyecto está dividido en dos aplicaciones principales que se comunican a través de una API REST.

### Backend
*   **Framework:** FastAPI (Python 3.10+)
*   **Base de Datos y ORM:** PostgreSQL + SQLAlchemy + asyncpg
*   **Migraciones:** Alembic
*   **Machine Learning:** Scikit-learn, Pandas, Numpy
*   **Validaciones:** Pydantic

### Frontend
*   **Framework Base:** React 18
*   **Empaquetador:** Vite
*   **Lenguaje:** TypeScript
*   **Estilos:** TailwindCSS
*   **Rutas y Peticiones:** React Router DOM, Axios

---

## 2. Guía de Instalación (Entorno Local)

### Instalación del Backend
1. Abrir una terminal en la ruta de la carpeta ackend/.
2. Crear un entorno virtual aislado:
   `powershell
   python -m venv venv
   `
3. Activar el entorno virtual (en Windows):
   `powershell
   .\venv\Scripts\activate
   `
4. Instalar todas las dependencias necesarias:
   `powershell
   pip install -r requirements-dev.txt
   `

### Instalación del Frontend
1. Abrir una terminal en la ruta de la carpeta rontend/.
2. Instalar los paquetes y dependencias de Node:
   `powershell
   npm install
   `

---

## 3. Guía de Ejecución (Entorno Local)

Para desarrollar, se deben levantar ambos servidores en paralelo usando dos terminales distintas.

### Levantar el Backend
Con el entorno virtual activado, ejecuta el script principal:
`powershell
python app/main.py
`
*(Alternativa recomendada por CLI: astapi dev app/main.py)*

### Levantar el Frontend
En la carpeta del frontend, inicia el servidor de desarrollo de Vite (por defecto corre en el puerto 5173):
`powershell
npm run dev
`

---

## 4. Buenas Prácticas y Reglas Importantes
*   **Cero Hardcodeo:** Está estrictamente prohibido escribir credenciales, rutas quemadas o URLs absolutas (como el dominio del frontend en el CORS) directamente en el código.
*   **Variables de Entorno (.env):** Tanto el frontend como el backend utilizan archivos .env. Para el backend, la configuración se administra de manera centralizada mediante pp.config.settings con pydantic-settings.
