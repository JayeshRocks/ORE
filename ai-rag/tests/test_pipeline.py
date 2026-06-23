"""End-to-end pipeline tests using fakes for Ollama."""
from pathlib import Path

import pytest

from orerag.config import get_settings
from orerag.pipeline import ask_question, ingest_document, ingest_documents
from orerag.storage import clear, count

DATA = Path(__file__).resolve().parent / "data" / "sample.pdf"


@pytest.fixture(autouse=True)
def _reset(tmp_chroma_dir):
    clear()


def test_ingest_document_adds_chunks(tmp_chroma_dir, fake_embedder):
    n = ingest_document(DATA)
    assert n > 0
    assert count() == n


def test_ingest_documents_skips_missing_dir(tmp_documents_dir):
    with pytest.raises(FileNotFoundError):
        ingest_documents(tmp_documents_dir / "does-not-exist")


def test_ask_question_returns_answer_and_chunks(tmp_chroma_dir, fake_embedder, fake_chat):
    ingest_document(DATA)
    result = ask_question("What is RAG?")
    assert result["answer"] == "stub-answer"
    assert isinstance(result["chunks"], list)
    # The fake LLM was called once.
    assert len(fake_chat) == 1
    # And it received a system message that contains retrieved context.
    sys_msg = fake_chat[0]["messages"][0]
    assert sys_msg["role"] == "system"
    assert "context" in sys_msg["content"].lower()


def test_settings_are_overridable(tmp_chroma_dir, monkeypatch):
    monkeypatch.setenv("ORERAG_CHUNK_SIZE", "777")
    s = get_settings()
    assert s.chunk_size == 777
