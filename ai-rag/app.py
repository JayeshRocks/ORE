"""
app.py

ORE AI-RAG Pipeline - FastAPI service.

Direct port of rag_playground/app.py onto the ORE ai-rag module layout.
Routes:
    GET  /              -> health
    POST /chat          -> { question: str } -> { answer, sources }
    POST /upload        -> multipart PDF upload, auto-ingests
    GET  /documents     -> list ingested PDF filenames

Run:
    uvicorn app:app --reload --port 8000
"""

from __future__ import annotations

import os
from typing import Any, Dict

from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel

from ingest import ingest_pdf
from rag_chat import ask_question


app = FastAPI(
    title="ORE AI-RAG Pipeline",
    description="Local Retrieval-Augmented Generation API (Kaju Open Source - ORE).",
    version="0.1.0",
)

# Documents directory lives next to this file: <repo>/ai-rag/documents/
DOCUMENTS_DIR = os.environ.get(
    "ORE_DOCUMENTS_DIR",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "documents"),
)
os.makedirs(DOCUMENTS_DIR, exist_ok=True)


class ChatRequest(BaseModel):
    question: str


@app.get("/")
def root() -> Dict[str, str]:
    return {"status": "online", "service": "ore-ai-rag"}


@app.post("/chat")
def chat_endpoint(request: ChatRequest) -> Dict[str, Any]:
    """
    Answer a question using the locally-stored vector DB + Ollama LLM.
    """
    result = ask_question(request.question)
    return {
        "answer": result["answer"],
        "sources": len(result["chunks"]),
    }


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Accept a PDF upload, save it under DOCUMENTS_DIR, and ingest it
    into the ChromaDB collection.
    """
    file_path = os.path.join(DOCUMENTS_DIR, file.filename or "uploaded.pdf")

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    chunk_count = ingest_pdf(file_path)

    return {
        "status": "success",
        "filename": os.path.basename(file_path),
        "chunks": chunk_count,
    }


@app.get("/documents")
def get_documents() -> Dict[str, Any]:
    """List PDF files currently present in DOCUMENTS_DIR."""
    files = [
        f
        for f in os.listdir(DOCUMENTS_DIR)
        if f.lower().endswith(".pdf")
    ]
    return {"documents": files}
