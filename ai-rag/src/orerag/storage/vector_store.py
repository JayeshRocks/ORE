"""
storage/vector_store.py

Persistent ChromaDB vector store.

Module-level client + collection so existing call sites stay simple:

    from orerag.storage import add_chunk, search

For tests / notebooks that want an isolated store, build your own
``chromadb.PersistentClient`` instead of importing this module's
collection directly.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import chromadb

from orerag.config import get_settings

# ---------------------------------------------------------------------------
# Module-level client + collection
# ---------------------------------------------------------------------------

_settings = get_settings()
Path(_settings.chroma_path).mkdir(parents=True, exist_ok=True)

_client = chromadb.PersistentClient(path=str(_settings.chroma_path))
collection = _client.get_or_create_collection(name=_settings.chroma_collection)


# ---------------------------------------------------------------------------
# Write
# ---------------------------------------------------------------------------

def add_chunk(
    chunk_id: Any,
    chunk_text: str,
    embedding: list[float],
    metadata: dict[str, Any] | None = None,
) -> None:
    """Add a single chunk. Mirrors the original rag_playground API."""
    payload: dict[str, Any] = {
        "ids": [str(chunk_id)],
        "documents": [chunk_text],
        "embeddings": [embedding],
    }
    if metadata is not None:
        payload["metadatas"] = [metadata]
    collection.add(**payload)


def add_chunks(
    ids: list[Any],
    texts: list[str],
    embeddings: list[list[float]],
    metadatas: list[dict[str, Any]] | None = None,
) -> None:
    """Bulk insert. `ids` are coerced to ``str`` (Chroma requirement)."""
    if not (len(ids) == len(texts) == len(embeddings)):
        raise ValueError("ids, texts, and embeddings must have equal length.")

    payload: dict[str, Any] = {
        "ids": [str(i) for i in ids],
        "documents": texts,
        "embeddings": embeddings,
    }
    if metadatas is not None:
        if len(metadatas) != len(ids):
            raise ValueError("metadatas length must match ids length.")
        payload["metadatas"] = metadatas
    collection.add(**payload)


# ---------------------------------------------------------------------------
# Read
# ---------------------------------------------------------------------------

def search(query_embedding: list[float], n_results: int = 4) -> list[str]:
    """Return the top-n document chunks most similar to `query_embedding`."""
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
    )
    docs = results.get("documents") or []
    return docs[0] if docs else []


def query(query_embedding: list[float], n_results: int = 4) -> dict[str, Any]:
    """Raw Chroma query result (documents, metadatas, distances, ids)."""
    return collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
    )


# ---------------------------------------------------------------------------
# Maintenance
# ---------------------------------------------------------------------------

def clear() -> None:
    """Wipe the collection (useful for tests / re-ingest)."""
    global collection
    _client.delete_collection(name=_settings.chroma_collection)
    collection = _client.get_or_create_collection(name=_settings.chroma_collection)


def count() -> int:
    return collection.count()


def peek(limit: int = 5) -> dict[str, Any]:
    return collection.peek(limit=limit)
