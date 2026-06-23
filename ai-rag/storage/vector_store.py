"""
storage/vector_store.py

ORE AI-RAG Pipeline - Persistent ChromaDB vector store.

Replicates rag_playground/vector_store.py (PersistentClient + collection
named "documents") and adds small helpers used by the rest of the ORE
pipeline (clear, count, peek).

Public API (stable):
    - add_chunk(chunk_id, chunk_text, embedding, metadata=None) -> None
    - add_chunks(ids, texts, embeddings, metadatas=None) -> None
    - search(query_embedding, n_results=4) -> list[str]
    - query(query_embedding, n_results=4) -> dict   (raw chroma output)
    - clear() -> None
    - count() -> int
    - peek(limit=5) -> dict
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Dict, List, Optional

import chromadb


# ---------------------------------------------------------------------------
# Module-level client + collection (matches rag_playground/vector_store.py)
# ---------------------------------------------------------------------------

_DEFAULT_DB_PATH = os.environ.get(
    "ORE_CHROMA_PATH",
    str(Path(__file__).resolve().parent.parent / "chroma_db"),
)

_COLLECTION_NAME = os.environ.get("ORE_CHROMA_COLLECTION", "documents")

_client = chromadb.PersistentClient(path=_DEFAULT_DB_PATH)
collection = _client.get_or_create_collection(name=_COLLECTION_NAME)


# ---------------------------------------------------------------------------
# Write API
# ---------------------------------------------------------------------------

def add_chunk(
    chunk_id: Any,
    chunk_text: str,
    embedding: List[float],
    metadata: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Add a single chunk to the collection.

    Mirrors rag_playground/vector_store.add_chunk exactly.
    """
    payload = {
        "ids": [str(chunk_id)],
        "documents": [chunk_text],
        "embeddings": [embedding],
    }
    if metadata is not None:
        payload["metadatas"] = [metadata]

    collection.add(**payload)


def add_chunks(
    ids: List[Any],
    texts: List[str],
    embeddings: List[List[float]],
    metadatas: Optional[List[Dict[str, Any]]] = None,
) -> None:
    """
    Bulk insert. ids are coerced to str (Chroma requirement).
    """
    if not (len(ids) == len(texts) == len(embeddings)):
        raise ValueError("ids, texts, and embeddings must have equal length.")

    payload = {
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
# Read API
# ---------------------------------------------------------------------------

def search(query_embedding: List[float], n_results: int = 4) -> List[str]:
    """
    Return the top-n document chunks most similar to the query embedding.

    Mirrors rag_playground/vector_store.search: flattens to a list[str].
    """
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
    )
    docs = results.get("documents") or []
    return docs[0] if docs else []


def query(query_embedding: List[float], n_results: int = 4) -> Dict[str, Any]:
    """
    Raw Chroma query result (documents, metadatas, distances, ids).
    Useful when you want scores / sources, not just text.
    """
    return collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
    )


# ---------------------------------------------------------------------------
# Maintenance helpers
# ---------------------------------------------------------------------------

def clear() -> None:
    """Wipe the collection (useful for tests / re-ingest)."""
    global collection
    _client.delete_collection(name=_COLLECTION_NAME)
    collection = _client.get_or_create_collection(name=_COLLECTION_NAME)


def count() -> int:
    return collection.count()


def peek(limit: int = 5) -> Dict[str, Any]:
    return collection.peek(limit=limit)
