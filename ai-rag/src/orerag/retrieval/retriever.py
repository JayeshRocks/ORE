"""
retrieval/retriever.py

Thin wrapper that hides embedding + vector-store plumbing.

Public API:
    retrieve(question, n_results=4) -> list[str]
    retrieve_with_meta(question, n_results=4) -> list[dict]
"""

from __future__ import annotations

from typing import Any

from orerag.config import get_settings
from orerag.embedding import get_embedding
from orerag.storage import query, search


def retrieve(question: str, n_results: int | None = None) -> list[str]:
    """Plain-text retrieval: top-n relevant chunks for `question`."""
    if not question or not question.strip():
        raise ValueError("retrieve() requires a non-empty question.")

    n = n_results or get_settings().n_results
    q_emb = get_embedding(question)
    return search(q_emb, n_results=n)


def retrieve_with_meta(question: str, n_results: int | None = None) -> list[dict[str, Any]]:
    """Rich retrieval: [{ text, metadata, distance, id }, ...]."""
    if not question or not question.strip():
        raise ValueError("retrieve_with_meta() requires a non-empty question.")

    n = n_results or get_settings().n_results
    q_emb = get_embedding(question)
    raw = query(q_emb, n_results=n)

    docs = (raw.get("documents") or [[]])[0]
    metas = (raw.get("metadatas") or [[]])[0]
    dists = (raw.get("distances") or [[]])[0]
    ids = (raw.get("ids") or [[]])[0]

    return [
        {
            "text": doc,
            "metadata": metas[i] if i < len(metas) else None,
            "distance": dists[i] if i < len(dists) else None,
            "id": ids[i] if i < len(ids) else None,
        }
        for i, doc in enumerate(docs)
    ]
