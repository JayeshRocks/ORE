"""
api/app.py

FastAPI service exposing ORERAG over HTTP.

Run:
    uvicorn orerag.api.app:app --reload --port 8000
or:
    orerag serve
"""

from __future__ import annotations

import os
from typing import Any

from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel

from orerag.config import get_settings
from orerag.pipeline import ask_question, ingest_document


class ChatRequest(BaseModel):
    """Request body for POST /chat."""

    question: str


def create_app() -> FastAPI:
    """FastAPI app factory. Useful for tests."""
    settings = get_settings()
    app = FastAPI(
        title="ORE AI-RAG Pipeline",
        description="Local Retrieval-Augmented Generation API (Kaju Open Source - ORE).",
        version="0.2.0",
    )
    documents_dir = settings.documents_dir
    documents_dir.mkdir(parents=True, exist_ok=True)

    @app.get("/")
    def root() -> dict[str, str]:
        return {"status": "online", "service": "ore-ai-rag", "version": "0.2.0"}

    @app.get("/health")
    def health() -> dict[str, Any]:
        from orerag.storage import count

        try:
            return {"status": "ok", "documents_indexed": count()}
        except Exception as exc:  # pragma: no cover - defensive
            return {"status": "degraded", "error": str(exc)}

    @app.post("/chat")
    def chat_endpoint(request: ChatRequest) -> dict[str, Any]:
        result = ask_question(request.question)
        return {"answer": result["answer"], "sources": len(result["chunks"])}

    @app.post("/upload")
    async def upload_pdf(file: UploadFile = File(...)) -> dict[str, Any]:
        # Sanitize filename: only basename, no path traversal.
        safe_name = os.path.basename(file.filename or "uploaded.pdf")
        if not safe_name.lower().endswith(".pdf"):
            return {"status": "error", "error": "Only .pdf files are accepted."}

        target = documents_dir / safe_name
        with open(target, "wb") as buffer:
            buffer.write(await file.read())

        chunk_count = ingest_document(target)
        return {"status": "success", "filename": safe_name, "chunks": chunk_count}

    @app.get("/documents")
    def get_documents() -> dict[str, Any]:
        return {"documents": sorted(p.name for p in documents_dir.glob("*.pdf"))}

    return app


# Module-level app for `uvicorn orerag.api.app:app`.
app = create_app()
