"""Tests for orerag.storage.vector_store."""
import pytest

from orerag.storage import add_chunk, add_chunks, clear, count, search


@pytest.fixture(autouse=True)
def _reset(tmp_chroma_dir):
    # Each test gets a fresh on-disk DB.
    clear()


def test_add_and_count(tmp_chroma_dir):
    add_chunk("1", "hello world", [0.0] * 8)
    assert count() == 1


def test_search_returns_inserted_text(tmp_chroma_dir):
    add_chunk("1", "the quick brown fox", [0.0] * 8)
    add_chunk("2", "completely unrelated", [1.0] * 8)
    results = search([0.0] * 8, n_results=1)
    assert results == ["the quick brown fox"]


def test_add_chunks_validates_lengths(tmp_chroma_dir):
    with pytest.raises(ValueError):
        add_chunks(ids=["1"], texts=["a", "b"], embeddings=[[0.0]])


def test_search_empty_collection_returns_empty(tmp_chroma_dir):
    assert search([0.0] * 8, n_results=3) == []
