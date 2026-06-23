"""
embedding/embedder.py

Local embedding generation via Ollama.

Default model: nomic-embed-text.

Public API:
    get_embedding(text, model=...) -> list[float]
    get_embeddings(texts, model=...) -> list[list[float]]   # batched
"""

from __future__ import annotations

from collections.abc import Iterable

import ollama

from orerag.config import get_settings


def get_embedding(text: str, model: str | None = None) -> list[float]:
    """Return the embedding vector for a single text chunk."""
    if not text or not text.strip():
        raise ValueError("get_embedding() requires non-empty text.")
    model = model or get_settings().embed_model

    response = ollama.embed(model=model, input=text)
    return response["embeddings"][0]


def get_embeddings(
    texts: Iterable[str],
    model: str | None = None,
) -> list[list[float]]:
    """Batch embedding helper. One Ollama call, one vector per text."""
    texts = [t for t in texts if t and t.strip()]
    if not texts:
        return []
    model = model or get_settings().embed_model

    response = ollama.embed(model=model, input=texts)
    return response["embeddings"]
