"""
Dependencias compartidas de FastAPI.
Centraliza las dependencias más usadas para evitar repetición en los routers.
"""
from collections.abc import AsyncGenerator

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import get_current_user
from app.database import get_db

# Re-exporta get_db y get_current_user para importación directa desde dependencies
__all__ = ["get_db", "get_current_user"]
