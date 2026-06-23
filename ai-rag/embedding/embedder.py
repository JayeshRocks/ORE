"""
embedding/embedder.py

ORE AI-RAG Pipeline - Local embedding generation via Ollama.

Replicates rag_playground/embedder.py:
    - Uses Ollama's `nomic-embed-text` model by default.
    - Returns a single embedding vector for a single text input.

Public API (stable):
    - get_embedding(text, model="nomic-embed-text") -> list[float]
    - get_embeddings(texts, model="nomic-embed-text") -> list[list[float]]
        Convenience batch helper for ingest pipelines.
"""

from __future__ import annotations

from typing import Iterable, List

import ollama


DEFAULT_EMBED_MODEL = "nomic-embed-text"


def get_embedding(
    text: str,
    model: str = DEFAULT_EMBED_MODEL,
) -> List[float]:
    """
    Return the embedding vector for a single text chunk.

    Mirrors rag_playground/embedder.py: ollama.embed(... )["embeddings"][0].
    """
    if not text or not text.strip():
        raise ValueError("get_embedding() requires non-empty text.")

    response = ollama.embed(model=model, input=text)
    return response["embeddings"][0]


def get_embeddings(
    texts: Iterable[str],
    model: str = DEFAULT_EMBED_MODEL,
) -> List[List[float]]:
    """
    Batch embedding helper. Single Ollama call, one vector per text.
    Empty / whitespace-only inputs are skipped (preserves ordering
    via index map - callers should pre-filter if they need exact parity).
    """
    texts = [t for t in texts if t and t.strip()]
    if not texts:
        return []

    response = ollama.embed(model=model, input=texts)
    return response["embeddings"]
