#!/usr/bin/env bash
# =============================================================================
# setup_ssl_domain.sh — Configuración de Dominio y Certificados SSL (HTTPS)
# Let's Encrypt / Certbot para el despliegue en Microsoft Azure
# =============================================================================

set -e

if [ "$EUID" -ne 0 ]; then
  echo "[-] Por favor ejecute este script con permisos sudo: sudo bash setup_ssl_domain.sh <DOMINIO> <EMAIL>"
  exit 1
fi

DOMAIN="$1"
EMAIL="$2"

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
  echo "Uso: sudo bash setup_ssl_domain.sh <dominio> <email_contacto>"
  echo "Ejemplo: sudo bash setup_ssl_domain.sh imprenta-uagrm.eastus.cloudapp.azure.com admin@uagrm.edu.bo"
  exit 1
fi

echo "================================================================="
echo "CONFIGURANDO HTTPS CON LET'S ENCRYPT PARA: $DOMAIN"
echo "================================================================="

# 1. Instalar Certbot
apt-get update -y
apt-get install -y certbot

# 2. Detener temporalmente el frontend para liberar el puerto 80 durante la emisión standalone
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "[+] Deteniendo contenedor frontend para emisión standalone de certificado..."
docker compose stop frontend

# 3. Solicitar certificado a Let's Encrypt
echo "[+] Solicitando certificado SSL..."
certbot certonly --standalone \
  --preferred-challenges http \
  --agree-tos \
  --no-eff-email \
  --email "$EMAIL" \
  -d "$DOMAIN"

# 4. Crear configuración SSL en Nginx
NGINX_CONF="frontend/nginx.conf"
echo "[+] Actualizando configuración de Nginx para HTTPS..."

cat <<EOF > "$NGINX_CONF"
server {
    listen 80;
    server_name $DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    location ~* \.(js|css|png|jpg|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location ~ ^/(docs|redoc|openapi.json) {
        proxy_pass http://backend:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# 5. Agregar montaje de certificados a docker-compose.yml si no está
if ! grep -q "/etc/letsencrypt:/etc/letsencrypt:ro" docker-compose.yml; then
  echo "[+] Añadiendo volumen de certificados a docker-compose.yml..."
  sed -i '/container_name: imprenta_frontend/a \    volumes:\n      - /etc/letsencrypt:/etc/letsencrypt:ro' docker-compose.yml
fi

# 6. Actualizar ALLOWED_ORIGINS en .env
if [ -f .env ]; then
  echo "[+] Actualizando CORS en .env con el nuevo dominio HTTPS..."
  if ! grep -q "https://$DOMAIN" .env; then
    sed -i "s|ALLOWED_ORIGINS=|ALLOWED_ORIGINS=https://$DOMAIN,|g" .env
  fi
fi

# 7. Reconstruir y reiniciar frontend
echo "[+] Reiniciando contenedores con HTTPS activado..."
docker compose up -d --build

echo "================================================================="
echo "[✓] HTTPS ACTIVADO SATISFACTORIAMENTE"
echo "Ingrese a su sistema de manera segura en:"
echo "  -> https://$DOMAIN/"
echo "  -> Documentación: https://$DOMAIN/docs"
echo "================================================================="
