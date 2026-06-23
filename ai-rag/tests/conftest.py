"""Shared pytest fixtures.

These tests use a throwaway on-disk ChromaDB and a faked embedder so they
run without Ollama. Integration tests (under tests/integration/) opt in
to the real services via the ``network`` marker.
"""

from __future__ import annotations

import shutil
import tempfile
from collections.abc import Iterator
from pathlib import Path
from typing import List

import pytest


@pytest.fixture()
def tmp_chroma_dir(monkeypatch: pytest.MonkeyPatch) -> Iterator[Path]:
    """Point ORERAG_CHROMA_PATH at a fresh tmp dir for the test."""
    tmp = Path(tempfile.mkdtemp(prefix="orerag-test-"))
    monkeypatch.setenv("ORERAG_CHROMA_PATH", str(tmp))
    yield tmp
    shutil.rmtree(tmp, ignore_errors=True)


@pytest.fixture()
def tmp_documents_dir(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> Iterator[Path]:
    docs = tmp_path / "documents"
    docs.mkdir()
    monkeypatch.setenv("ORERAG_DOCUMENTS_DIR", str(docs))
    yield docs


@pytest.fixture()
def fake_embedder(monkeypatch: pytest.MonkeyPatch) -> List[List[float]]:
    """
    Replace ``orerag.embedding.embedder.ollama.embed`` with a deterministic
    fake so unit tests don't need Ollama running.

    Returns the list of vectors produced (handy for assertions).
    """
    produced: List[List[float]] = []

    def _fake_embed(model: str, input):  # type: ignore[no-untyped-def]
        if isinstance(input, str):
            inputs = [input]
        else:
            inputs = list(input)
        out: List[List[float]] = []
        for text in inputs:
            # 8-dim deterministic vector: hash-modded.
            h = abs(hash(text)) % (10**6)
            vec = [(h % (i + 1)) / ((i + 1) * 7) for i in range(8)]
            out.append(vec)
            produced.append(vec)
        return {"embeddings": out}

    import orerag.embedding.embedder as emb_mod

    monkeypatch.setattr(emb_mod.ollama, "embed", _fake_embed)
    return produced


@pytest.fixture()
def fake_chat(monkeypatch: pytest.MonkeyPatch) -> List[dict]:
    """Replace the LLM call with a canned response."""
    calls: List[dict] = []

    def _fake_chat(model: str, messages):  # type: ignore[no-untyped-def]
        calls.append({"model": model, "messages": messages})
        return {"message": {"content": "stub-answer"}}

    import orerag.pipeline.chat as chat_mod

    monkeypatch.setattr(chat_mod, "ollama_chat", _fake_chat)
    return calls
