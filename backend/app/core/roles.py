from enum import Enum


class RolEnum(str, Enum):
    SUPERADMIN = "Superadministrador"
    ADMIN = "Administrador"
    MOSTRADOR = "Operador Mostrador"
    TALLER = "Operador Taller"
    CLIENTE = "Cliente"


# Mapeo de alias a nombres oficiales en base de datos
ALIAS_ROLES = {
    "SUPERADMIN": RolEnum.SUPERADMIN.value,
    "SUPERADMINISTRADOR": RolEnum.SUPERADMIN.value,
    "ADMIN": RolEnum.ADMIN.value,
    "ADMINISTRADOR": RolEnum.ADMIN.value,
    "MOSTRADOR": RolEnum.MOSTRADOR.value,
    "RECEPCION": RolEnum.MOSTRADOR.value,
    "OPERADOR MOSTRADOR": RolEnum.MOSTRADOR.value,
    "TALLER": RolEnum.TALLER.value,
    "PRODUCCION": RolEnum.TALLER.value,
    "OPERADOR TALLER": RolEnum.TALLER.value,
    "CLIENTE": RolEnum.CLIENTE.value,
}


def normalizar_rol(rol: str | RolEnum) -> str:
    """Retorna el nombre formal del rol almacenado en la base de datos."""
    if isinstance(rol, RolEnum):
        return rol.value
    rol_limpio = str(rol).strip()
    return ALIAS_ROLES.get(rol_limpio.upper(), rol_limpio)
