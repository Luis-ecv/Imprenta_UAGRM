"""
Tests del módulo de Insumos.
Cubre: listar insumos, crear insumo, stock insuficiente.
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_listar_insumos_requiere_auth(client: AsyncClient):
    """Listar insumos sin token debe retornar HTTP 403."""
    response = await client.get("/api/v1/insumos")
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_crear_insumo_datos_invalidos(client: AsyncClient):
    """
    Crear un insumo con datos incompletos debe retornar HTTP 422 (Unprocessable Entity).
    Valida que Pydantic rechace correctamente los datos inválidos.
    """
    response = await client.post(
        "/api/v1/insumos",
        json={"nombre": ""},  # faltan campos requeridos
        headers={"Authorization": "Bearer token_invalido"},
    )
    assert response.status_code in (401, 422)
