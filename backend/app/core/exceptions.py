"""
Excepciones personalizadas del dominio de negocio.
Permiten que los services lancen errores semánticos que los routers
convierten automáticamente en respuestas HTTP apropiadas.

REGLA: Nunca lanzar Exception genérica en los services.
       Siempre usar una de las excepciones definidas aquí.
"""
from fastapi import HTTPException, status


class RecursoNoEncontrado(HTTPException):
    """El recurso solicitado no existe en la base de datos."""

    def __init__(self, recurso: str, id: int | str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{recurso} con id {id} no encontrado.",
        )


class AccesoDenegado(HTTPException):
    """El usuario no tiene permisos para ejecutar esta acción."""

    def __init__(self, mensaje: str = "No tiene permisos para realizar esta acción."):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=mensaje,
        )


class CredencialesInvalidas(HTTPException):
    """Usuario o contraseña incorrectos en el proceso de autenticación."""

    def __init__(self, mensaje: str = "Credenciales incorrectas."):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=mensaje,
            headers={"WWW-Authenticate": "Bearer"},
        )


class CuentaBloqueadaPorFuerzaBruta(HTTPException):
    """Demasiados intentos fallidos de inicio de sesión."""

    def __init__(self, minutos_restantes: int = 15):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                f"Demasiados intentos fallidos. Por seguridad, "
                f"intente nuevamente en {minutos_restantes} minuto(s)."
            ),
        )


class TokenInvalido(HTTPException):
    """Token JWT ausente, inválido o expirado."""

    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        )


class ConflictoRegistro(HTTPException):
    """Ya existe un registro con los mismos datos únicos (ej: correo duplicado)."""

    def __init__(self, mensaje: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=mensaje,
        )


class StockInsuficiente(HTTPException):
    """El stock disponible de un insumo no alcanza para cubrir la demanda."""

    def __init__(self, insumo: str, disponible: float, requerido: float):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Stock insuficiente para '{insumo}'. "
                f"Disponible: {disponible}, requerido: {requerido}."
            ),
        )


class TransicionEstadoInvalida(HTTPException):
    """Se intentó un cambio de estado no permitido por el flujo de negocio."""

    def __init__(self, estado_actual: str, estado_destino: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"No se puede pasar del estado '{estado_actual}' "
                f"al estado '{estado_destino}'."
            ),
        )


class DatosInsuficientesML(HTTPException):
    """No hay suficientes registros históricos para entrenar el modelo de ML."""

    def __init__(self, registros_actuales: int, minimo_requerido: int):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Datos insuficientes para el modelo de predicción. "
                f"Registros disponibles: {registros_actuales}, "
                f"mínimo requerido: {minimo_requerido}."
            ),
        )


class OperacionNoPermitida(HTTPException):
    """La operación solicitada no está permitida en el estado actual del recurso."""

    def __init__(self, mensaje: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=mensaje,
        )
