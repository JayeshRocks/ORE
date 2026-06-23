"""Tests for orerag.retrieval.retriever."""
from orerag.retrieval import retrieve, retrieve_with_meta
from orerag.storage import add_chunk, clear


def test_retrieve_empty_question_raises():
    import pytest

    with pytest.raises(ValueError):
        retrieve("")
    with pytest.raises(ValueError):
        retrieve_with_meta("   ")


def test_retrieve_returns_inserted_chunks(tmp_chroma_dir, fake_embedder):
    clear()
    add_chunk("1", "alpha", [0.0] * 8)
    add_chunk("2", "beta", [0.5] * 8)
    add_chunk("3", "gamma", [1.0] * 8)

    chunks = retrieve("anything", n_results=2)
    assert len(chunks) == 2
    assert all(isinstance(c, str) for c in chunks)


def test_retrieve_with_meta_shape(tmp_chroma_dir, fake_embedder):
    clear()
    add_chunk("42", "doc text", [0.0] * 8, metadata={"source": "x.pdf"})

    results = retrieve_with_meta("hi", n_results=1)
    assert len(results) == 1
    item = results[0]
    assert item["text"] == "doc text"
    assert item["metadata"] == {"source": "x.pdf"}
    assert item["id"] == "42"
