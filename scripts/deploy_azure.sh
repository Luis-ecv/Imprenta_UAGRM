#!/usr/bin/env bash
# =============================================================================
# deploy_azure.sh — Script de Aprovisionamiento y Despliegue en Azure Linux VM
# Proyecto: Sistema Integral de Gestión y Predicción Litográfica — UAGRM
# Compatible con: Ubuntu 22.04 LTS / 24.04 LTS
# =============================================================================

set -e

echo "================================================================="
echo "   DESPLIEGUE EN PRODUCCIÓN — IMPRENTA UNIVERSITARIA UAGRM"
echo "================================================================="

# 1. Comprobación de privilegios root
if [ "$EUID" -ne 0 ]; then
  echo "[-] Por favor ejecute este script con permisos sudo: sudo bash deploy_azure.sh"
  exit 1
fi

# 2. Configurar memoria Swap (2 GB) para estabilidad de compilación y base de datos
if [ ! -f /swapfile ]; then
  echo "[+] Configurando 2GB de memoria Swap de seguridad..."
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo "[✓] Swap activada correctamente."
else
  echo "[i] Swap ya configurada previamente."
fi

# 3. Actualización de paquetes del sistema
echo "[+] Actualizando repositorios del sistema..."
apt-get update -y && apt-get upgrade -y
apt-get install -y curl git ufw jq openssl ca-certificates gnupg

# 4. Instalación de Docker y Docker Compose Plugin (si no están instalados)
if ! command -v docker &> /dev/null; then
  echo "[+] Instalando Docker Engine..."
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null

  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable docker
  systemctl start docker
  echo "[✓] Docker Engine instalado exitosamente."
else
  echo "[i] Docker ya está instalado."
fi

# 5. Configurar Firewall local (UFW)
echo "[+] Configurando reglas de firewall local (UFW)..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH Administracion'
ufw allow 80/tcp comment 'HTTP Nginx Web'
ufw allow 443/tcp comment 'HTTPS Certbot SSL'
ufw --force enable
echo "[✓] Firewall UFW configurado (Puertos 22, 80, 443 abiertos)."

# 6. Verificación de archivo .env
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

if [ ! -f .env ]; then
  echo "[!] No se encontró el archivo .env. Creando a partir de .env.example..."
  cp .env.example .env
  
  # Generar clave JWT segura automáticamente
  RANDOM_SECRET=$(openssl rand -hex 32)
  RANDOM_DB_PASS=$(openssl rand -hex 16)
  
  sed -i "s/GENERAR_CON_openssl_rand_-hex_32/$RANDOM_SECRET/g" .env
  sed -i "s/CAMBIAR_EN_PRODUCCION/$RANDOM_DB_PASS/g" .env
  sed -i "s/ENVIRONMENT=development/ENVIRONMENT=production/g" .env
  
  echo "[✓] Archivo .env generado con contraseñas seguras y ambiente de producción."
  echo "[!] RECUERDE: Configure la variable ALLOWED_ORIGINS en .env con su dominio o IP pública."
fi

# 7. Crear directorios requeridos
mkdir -p backend/ml_models
chmod 775 backend/ml_models

# 8. Construcción y arranque de contenedores
echo "[+] Construyendo y levantando contenedores con Docker Compose..."
docker compose down || true
docker compose build --pull
docker compose up -d

echo "================================================================="
echo "[✓] DESPLIEGUE FINALIZADO EXITOSAMENTE"
echo "================================================================="
echo "Contenedores activos:"
docker compose ps
echo ""
echo "Acceda a la aplicación en su navegador:"
echo "  -> http://<IP_PUBLICA_AZURE>/"
echo "  -> Documentación Swagger: http://<IP_PUBLICA_AZURE>/docs"
echo "================================================================="
