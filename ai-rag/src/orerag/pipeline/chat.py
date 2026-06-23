"""
pipeline/chat.py

Retrieval-Augmented chat: question -> embedding -> retrieval -> LLM answer.

Public API:
    ask_question(question, model=None, n_results=None, history=None)
        -> { "answer": str, "chunks": list[str] }
"""

from __future__ import annotations

from typing import Any

from ollama import chat as ollama_chat

from orerag.config import get_settings
from orerag.embedding import get_embedding
from orerag.prompts import build_system_prompt
from orerag.storage import search


def ask_question(
    question: str,
    model: str | None = None,
    n_results: int | None = None,
    history: list[dict[str, str]] | None = None,
) -> dict[str, Any]:
    """
    Run the full RAG flow for a single question.

    Returns: { "answer": str, "chunks": list[str] }
    """
    settings = get_settings()
    model = model or settings.llm_model
    n_results = n_results or settings.n_results

    # 1. Embed the question.
    question_embedding = get_embedding(question)

    # 2. Retrieve relevant chunks.
    chunks: list[str] = search(question_embedding, n_results=n_results)

    # 3. Build the system prompt with the retrieved context.
    context = "\n\n".join(chunks)
    messages: list[dict[str, str]] = [
        {"role": "system", "content": build_system_prompt(context)}
    ]
    if history:
        messages.extend(history)
    messages.append({"role": "user", "content": question})

    # 4. Ask the local LLM.
    response = ollama_chat(model=model, messages=messages)

    return {
        "answer": response["message"]["content"],
        "chunks": chunks,
    }
