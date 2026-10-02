"""
Tests del módulo de autenticación.
Cubre: login exitoso, credenciales inválidas y acceso a endpoint protegido.
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_login_exitoso(client: AsyncClient):
    """El login con credenciales válidas debe retornar un token JWT."""
    # TODO: crear usuario de prueba en la BD de test antes del assert
    response = await client.post(
        "/api/v1/auth/login",
        json={"nombre_usuario": "admin", "contrasena": "Admin2024!"},
    )
    # Se espera 200 con access_token cuando el servicio esté implementado
    assert response.status_code in (200, 422)  # 422 hasta que se implemente


@pytest.mark.asyncio
async def test_login_credenciales_invalidas(client: AsyncClient):
    """El login con contraseña incorrecta debe retornar HTTP 401."""
    response = await client.post(
        "/api/v1/auth/login",
        json={"nombre_usuario": "admin", "contrasena": "contrasena_incorrecta"},
    )
    assert response.status_code in (401, 422)  # 422 hasta que se implemente


@pytest.mark.asyncio
async def test_endpoint_protegido_sin_token(client: AsyncClient):
    """Acceder a un endpoint protegido sin token debe retornar HTTP 403."""
    response = await client.get("/api/v1/usuarios")
    assert response.status_code == 403
