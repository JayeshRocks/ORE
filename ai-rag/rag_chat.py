"""
rag_chat.py

ORE AI-RAG Pipeline - Retrieval-Augmented chat.

Replicates rag_playground/rag_chat.py:ask_question(...) and extends it
with a few small, useful knobs (model override, n_results override,
history passthrough). All defaults match rag_playground exactly so
existing call sites and the FastAPI app in app.py keep working.

Public API (stable):
    - ask_question(question, model="gemma4:31b-cloud", n_results=4,
                   history=None) -> dict
        Returns: { "answer": str, "chunks": list[str] }
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from ollama import chat

from embedding.embedder import get_embedding
from prompts import build_system_prompt
from storage.vector_store import search


DEFAULT_LLM_MODEL = "gemma4:31b-cloud"
DEFAULT_N_RESULTS = 4


def ask_question(
    question: str,
    model: str = DEFAULT_LLM_MODEL,
    n_results: int = DEFAULT_N_RESULTS,
    history: Optional[List[Dict[str, str]]] = None,
) -> Dict[str, Any]:
    """
    Run the full RAG flow for a single question.

    1. Embed the question (Ollama nomic-embed-text).
    2. Retrieve the top-n chunks from ChromaDB.
    3. Build a study-assistant system prompt with that context.
    4. Ask the local LLM (Ollama) and return {answer, chunks}.

    `history` is an optional list of {role, content} messages prepended
    to the call for conversational memory (kept forward-compatible with
    the rag_playground single-turn default of history=None).
    """
    # 1. Embed the question
    question_embedding = get_embedding(question)

    # 2. Retrieve relevant chunks
    chunks: List[str] = search(question_embedding, n_results=n_results)

    # 3. Combine chunks into context
    context = "\n\n".join(chunks)
    system_content = build_system_prompt(context)

    messages: List[Dict[str, str]] = [{"role": "system", "content": system_content}]
    if history:
        messages.extend(history)
    messages.append({"role": "user", "content": question})

    # 4. Ask the local LLM
    response = chat(model=model, messages=messages)

    return {
        "answer": response["message"]["content"],
        "chunks": chunks,
    }
