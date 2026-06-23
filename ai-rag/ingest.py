"""
ingest.py

ORE AI-RAG Pipeline - End-to-end PDF ingestion.

Replicates rag_playground/ingest.py:ingest_pdf(...) and adds:
    - rich metadata per chunk (page number, source filename, chunk index)
    - optional batched embedding via embedding.embedder.get_embeddings
    - a top-level ingest_documents(...) helper for folders of PDFs

Public API (stable):
    - ingest_pdf(pdf_path) -> int
        Ingest one PDF, return number of chunks added.
    - ingest_documents(documents_dir="documents", pattern="*.pdf") -> dict
        Ingest every PDF in a folder; returns {file: chunk_count, ...}.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List

from chunking.chunker import create_chunks
from embedding.embedder import get_embeddings
from ingestion.pdf_processor import extract_pages, extract_pdf_text
from storage.vector_store import add_chunks


def _next_id_offset() -> int:
    """
    Use Chroma's current count() as the chunk-id offset so re-ingesting
    the same document doesn't collide with previously-stored ids.
    """
    try:
        from storage.vector_store import count

        return count()
    except Exception:
        return 0


def ingest_pdf(pdf_path: str | Path) -> int:
    """
    Extract -> chunk -> embed -> upsert one PDF into ChromaDB.

    Returns the number of chunks ingested.

    Mirrors rag_playground/ingest.py:ingest_pdf(...) so any existing
    caller (FastAPI app, CLI scripts) keeps working unchanged.
    """
    pdf_path = Path(pdf_path)

    # 1. Extract (use the flat-text path to stay aligned with rag_playground).
    text = extract_pdf_text(pdf_path)

    # 2. Chunk
    chunks: List[str] = create_chunks(text)
    if not chunks:
        return 0

    # 3. Embed (batched - single Ollama call for the whole document).
    embeddings = get_embeddings(chunks)

    # 4. Upsert with metadata (page index = chunk index for flat-text path;
    #    we additionally attach the source filename so future RAG responses
    #    can cite the file).
    offset = _next_id_offset()
    ids = list(range(offset, offset + len(chunks)))
    metadatas: List[Dict[str, Any]] = [
        {"source": pdf_path.name, "chunk_index": i}
        for i in range(len(chunks))
    ]

    add_chunks(
        ids=ids,
        texts=chunks,
        embeddings=embeddings,
        metadatas=metadatas,
    )
    return len(chunks)


def ingest_documents(
    documents_dir: str | Path = "documents",
    pattern: str = "*.pdf",
) -> Dict[str, int]:
    """
    Ingest every file matching `pattern` in `documents_dir`.

    Returns { "<relative_path>": <chunk_count>, ... }.
    """
    documents_dir = Path(documents_dir)
    if not documents_dir.exists():
        raise FileNotFoundError(f"Documents directory not found: {documents_dir}")

    summary: Dict[str, int] = {}
    for pdf_path in sorted(documents_dir.glob(pattern)):
        summary[pdf_path.name] = ingest_pdf(pdf_path)
    return summary
