"""
Servicio de Usuarios y Roles.
Lógica de negocio para la gestión de usuarios del sistema (CRUD + RBAC).
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import ConflictoRegistro, RecursoNoEncontrado
from app.core.security import hash_password
from app.models.rol import Rol
from app.models.usuario import Usuario
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.common import RespuestaPaginada
from app.schemas.usuario import RolResponse, UsuarioCreate, UsuarioResponse, UsuarioUpdate


async def listar(
    db: AsyncSession, pagina: int, por_pagina: int
) -> RespuestaPaginada[UsuarioResponse]:
    repo = UsuarioRepository(db)
    usuarios, total = await repo.listar_paginado(pagina, por_pagina)
    return RespuestaPaginada[UsuarioResponse](
        total=total,
        pagina=pagina,
        por_pagina=por_pagina,
        datos=[UsuarioResponse.model_validate(u) for u in usuarios],
    )


async def listar_roles(db: AsyncSession) -> list[RolResponse]:
    result = await db.execute(select(Rol).order_by(Rol.id_rol))
    roles = result.scalars().all()
    return [RolResponse.model_validate(r) for r in roles]


async def crear(db: AsyncSession, datos: UsuarioCreate) -> UsuarioResponse:
    repo = UsuarioRepository(db)
    existente = await repo.obtener_por_email(datos.email)
    if existente:
        raise ConflictoRegistro(f"Ya existe un usuario con el correo '{datos.email}'.")

    nuevo_usuario = Usuario(
        nombre_completo=datos.nombre_completo,
        email=datos.email,
        password_hash=hash_password(datos.password),
        rol_id=datos.rol_id,
        activo=datos.activo,
    )
    usuario_creado = await repo.crear(nuevo_usuario)
    return UsuarioResponse.model_validate(usuario_creado)


async def obtener(db: AsyncSession, id_usuario: int) -> UsuarioResponse:
    repo = UsuarioRepository(db)
    usuario = await repo.obtener_con_rol(id_usuario)
    if not usuario:
        raise RecursoNoEncontrado("Usuario", id_usuario)
    return UsuarioResponse.model_validate(usuario)


async def actualizar(
    db: AsyncSession, id_usuario: int, datos: UsuarioUpdate
) -> UsuarioResponse:
    repo = UsuarioRepository(db)
    usuario = await repo.obtener_con_rol(id_usuario)
    if not usuario:
        raise RecursoNoEncontrado("Usuario", id_usuario)

    if datos.email and datos.email != usuario.email:
        existente = await repo.obtener_por_email(datos.email)
        if existente:
            raise ConflictoRegistro(f"El correo '{datos.email}' ya está registrado.")
        usuario.email = datos.email

    if datos.nombre_completo:
        usuario.nombre_completo = datos.nombre_completo
    if datos.rol_id is not None:
        usuario.rol_id = datos.rol_id
    if datos.activo is not None:
        usuario.activo = datos.activo
    if datos.password:
        usuario.password_hash = hash_password(datos.password)

    await db.flush()
    await db.refresh(usuario)
    return UsuarioResponse.model_validate(usuario)


async def desactivar(db: AsyncSession, id_usuario: int) -> dict:
    repo = UsuarioRepository(db)
    usuario = await repo.obtener_por_id(id_usuario)
    if not usuario:
        raise RecursoNoEncontrado("Usuario", id_usuario)
    await repo.desactivar(usuario)
    return {"mensaje": f"Usuario con ID {id_usuario} desactivado exitosamente."}
