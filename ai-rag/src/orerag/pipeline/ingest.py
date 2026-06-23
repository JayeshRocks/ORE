"""
pipeline/ingest.py

End-to-end ingestion: PDF -> chunks -> embeddings -> ChromaDB.

Public API:
    ingest_document(pdf_path) -> int           # chunks added
    ingest_documents(directory) -> dict        # {filename: chunk_count}
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

from orerag.chunking import create_chunks
from orerag.config import get_settings
from orerag.embedding import get_embeddings
from orerag.ingestion import extract_pdf_text
from orerag.storage import add_chunks, count


def _ids_for_batch(n: int) -> list[int]:
    """Use current collection size as offset so re-ingesting doesn't collide."""
    return list(range(count(), count() + n))


def ingest_document(pdf_path: str | Path) -> int:
    """
    Ingest one PDF.

    Returns the number of chunks added.
    """
    settings = get_settings()
    pdf_path = Path(pdf_path)

    text = extract_pdf_text(pdf_path)
    chunks = create_chunks(text, settings.chunk_size, settings.chunk_overlap)
    if not chunks:
        return 0

    embeddings = get_embeddings(chunks)
    ids = _ids_for_batch(len(chunks))
    metadatas: list[dict[str, Any]] = [
        {"source": pdf_path.name, "chunk_index": i}
        for i in range(len(chunks))
    ]

    add_chunks(ids=ids, texts=chunks, embeddings=embeddings, metadatas=metadatas)
    return len(chunks)


def ingest_documents(
    directory: str | Path | None = None,
    pattern: str = "*.pdf",
) -> dict[str, int]:
    """
    Ingest every file matching `pattern` in `directory`.

    Returns {filename: chunk_count}.
    """
    settings = get_settings()
    directory = Path(directory or settings.documents_dir)
    if not directory.exists():
        raise FileNotFoundError(f"Documents directory not found: {directory}")

    summary: dict[str, int] = {}
    for pdf_path in sorted(directory.glob(pattern)):
        summary[pdf_path.name] = ingest_document(pdf_path)
    return summary
