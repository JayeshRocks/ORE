"""FastAPI service exposing the RAG pipeline over HTTP."""

from orerag.api.app import app, create_app

__all__ = ["app", "create_app"]
