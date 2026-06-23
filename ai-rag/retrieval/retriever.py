"""
retrieval/retriever.py

ORE AI-RAG Pipeline - Retrieval layer.

Wraps the embedding + vector-store layers in a single function so callers
(retrieval-augmented chat, future agents) don't have to know which model
or DB is wired in. Backed by rag_playground's rag_chat.py retrieval step.

Public API (stable):
    - retrieve(question, n_results=4) -> list[str]
        Embeds the question and returns the top-n relevant chunks.
    - retrieve_with_meta(question, n_results=4) -> list[dict]
        Same, but also returns metadatas + distances.
"""

from __future__ import annotations

from typing import Any, Dict, List

from embedding.embedder import get_embedding
from storage.vector_store import query, search


def retrieve(question: str, n_results: int = 4) -> List[str]:
    """
    Plain-text retrieval, rag_playground-compatible.

    Returns a list of document chunks (strings) most relevant to `question`.
    """
    if not question or not question.strip():
        raise ValueError("retrieve() requires a non-empty question.")

    q_emb = get_embedding(question)
    return search(q_emb, n_results=n_results)


def retrieve_with_meta(question: str, n_results: int = 4) -> List[Dict[str, Any]]:
    """
    Rich retrieval result. Each item:
        { "text": str,
          "metadata": dict | None,
          "distance": float | None,
          "id": str | None }
    """
    if not question or not question.strip():
        raise ValueError("retrieve_with_meta() requires a non-empty question.")

    q_emb = get_embedding(question)
    raw = query(q_emb, n_results=n_results)

    docs = (raw.get("documents") or [[]])[0]
    metas = (raw.get("metadatas") or [[]])[0]
    dists = (raw.get("distances") or [[]])[0]
    ids = (raw.get("ids") or [[]])[0]

    out: List[Dict[str, Any]] = []
    for i, doc in enumerate(docs):
        out.append(
            {
                "text": doc,
                "metadata": metas[i] if i < len(metas) else None,
                "distance": dists[i] if i < len(dists) else None,
                "id": ids[i] if i < len(ids) else None,
            }
        )
    return out
