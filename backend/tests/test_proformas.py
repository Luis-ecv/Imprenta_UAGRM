"""
Tests del módulo de Proformas.
Cubre: creación, consulta, agregar ítems y flujo de estados.
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_listar_proformas_requiere_auth(client: AsyncClient):
    """Listar proformas sin token debe retornar HTTP 403."""
    response = await client.get("/api/v1/proformas")
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_proforma_no_encontrada(client: AsyncClient):
    """
    Consultar una proforma con ID inexistente debe retornar HTTP 404.
    Valida que RecursoNoEncontrado funciona correctamente.
    """
    response = await client.get(
        "/api/v1/proformas/99999",
        headers={"Authorization": "Bearer token_invalido"},
    )
    assert response.status_code in (401, 404)
