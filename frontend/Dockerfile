# =============================================
# STAGE 1: Build - compila el proyecto React
# =============================================
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar dependencias primero (aprovechar cache de Docker)
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Copiar código y compilar
COPY . .
RUN npm run build

# =============================================
# STAGE 2: Runtime - sirve con Nginx
# =============================================
FROM nginx:alpine

# Copiar la build al directorio de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
