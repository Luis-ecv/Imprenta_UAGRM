"""
Servicio de Autenticación.
Lógica de negocio para login, generación de tokens JWT y protección anti-fuerza bruta.
"""
import math
import time
from datetime import datetime, timezone
from typing import Dict, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.core.exceptions import CredencialesInvalidas, CuentaBloqueadaPorFuerzaBruta
from app.core.security import create_access_token, verify_password
from app.models.usuario import Usuario
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.auth import LoginRequest, TokenResponse
from app.services import bitacora_service


class LoginRateLimiter:
    """
    Controlador en memoria de intentos fallidos de inicio de sesión.
    Protege el endpoint de login contra ataques de fuerza bruta y diccionario.
    """

    def __init__(self):
        # Clave: f"{email}:{ip}" -> (intentos: int, timestamp_ultimo_fallo: float, bloqueado_hasta: float)
        self._intentos: Dict[str, Tuple[int, float, float]] = {}

    def _generar_clave(self, email: str, ip: str) -> str:
        return f"{email.strip().lower()}:{ip.strip()}"

    def verificar_bloqueo(self, email: str, ip: str) -> None:
        """Lanza CuentaBloqueadaPorFuerzaBruta si el usuario/IP se encuentra en periodo de bloqueo."""
        clave = self._generar_clave(email, ip)
        ahora = time.time()
        if clave in self._intentos:
            intentos, _, bloqueado_hasta = self._intentos[clave]
            if ahora < bloqueado_hasta:
                minutos_restantes = max(1, math.ceil((bloqueado_hasta - ahora) / 60))
                raise CuentaBloqueadaPorFuerzaBruta(minutos_restantes=minutos_restantes)
            elif bloqueado_hasta > 0 and ahora >= bloqueado_hasta:
                # El periodo de castigo expiró; reseteamos el estado para permitir nuevos intentos
                del self._intentos[clave]

    def registrar_fallo(self, email: str, ip: str, max_intentos: int, minutos_bloqueo: int) -> int:
        """
        Registra un intento fallido. Si se alcanza max_intentos, bloquea y lanza excepción.
        Retorna los intentos restantes antes del bloqueo.
        """
        clave = self._generar_clave(email, ip)
        ahora = time.time()
        intentos = 0
        if clave in self._intentos:
            intentos, _, _ = self._intentos[clave]

        intentos += 1
        if intentos >= max_intentos:
            bloqueado_hasta = ahora + (minutos_bloqueo * 60)
            self._intentos[clave] = (intentos, ahora, bloqueado_hasta)
            raise CuentaBloqueadaPorFuerzaBruta(minutos_restantes=minutos_bloqueo)
        else:
            self._intentos[clave] = (intentos, ahora, 0.0)
            return max_intentos - intentos

    def registrar_exito(self, email: str, ip: str) -> None:
        """Limpia el contador de intentos al autenticarse exitosamente."""
        clave = self._generar_clave(email, ip)
        self._intentos.pop(clave, None)


# Instancia singleton del rate limiter en memoria
login_rate_limiter = LoginRateLimiter()


async def autenticar(
    db: AsyncSession,
    datos: LoginRequest,
    ip_cliente: str = "127.0.0.1",
) -> TokenResponse:
    # 1. Verificar si la cuenta o IP está bloqueada por intentos previos
    login_rate_limiter.verificar_bloqueo(datos.email, ip_cliente)

    repo = UsuarioRepository(db)
    usuario = await repo.obtener_por_email(datos.email)

    # 2. Si el usuario no existe o está inactivo, registrar intento fallido y lanzar error
    if not usuario or not usuario.activo:
        login_rate_limiter.registrar_fallo(
            datos.email, ip_cliente, settings.MAX_LOGIN_ATTEMPTS, settings.LOGIN_LOCKOUT_MINUTES
        )
        raise CredencialesInvalidas()

    # 3. Verificar contraseña con bcrypt
    if not verify_password(datos.password, usuario.password_hash):
        intentos_restantes = login_rate_limiter.registrar_fallo(
            datos.email, ip_cliente, settings.MAX_LOGIN_ATTEMPTS, settings.LOGIN_LOCKOUT_MINUTES
        )
        # Auditoría de fallo de autenticación
        await bitacora_service.registrar(
            db,
            usuario_id=usuario.id_usuario,
            accion="FALLO_LOGIN",
            modulo="Autenticación",
            detalle={"mensaje": "Contraseña incorrecta", "intentos_restantes": intentos_restantes},
            ip_origen=ip_cliente,
        )
        raise CredencialesInvalidas()

    # 4. Éxito: Limpiar cualquier intento fallido acumulado
    login_rate_limiter.registrar_exito(datos.email, ip_cliente)

    # Actualizar timestamp de último acceso
    usuario.ultimo_acceso = datetime.now(timezone.utc)
    await db.flush()

    # Payload para el JWT
    payload = {
        "sub": usuario.email,
        "id_usuario": usuario.id_usuario,
        "rol": usuario.rol.nombre if usuario.rol else "Cliente",
        "nombre_completo": usuario.nombre_completo,
    }

    token = create_access_token(payload)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expira_en_minutos=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
    )
