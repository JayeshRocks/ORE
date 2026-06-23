"""Tests for orerag.embedding.embedder."""
import pytest

from orerag.embedding import get_embedding, get_embeddings


def test_get_embedding_empty_raises():
    with pytest.raises(ValueError):
        get_embedding("")
    with pytest.raises(ValueError):
        get_embedding("   \n  ")


def test_get_embedding_returns_vector(fake_embedder):
    v = get_embedding("hello")
    assert isinstance(v, list)
    assert len(v) > 0
    assert all(isinstance(x, float) for x in v)


def test_get_embeddings_filters_empty(fake_embedder):
    out = get_embeddings(["a", "", "  ", "b"])
    assert len(out) == 2  # empty strings filtered
    assert all(len(v) > 0 for v in out)


def test_get_embeddings_empty_input_returns_empty(fake_embedder):
    assert get_embeddings([]) == []
    assert get_embeddings(["", "   "]) == []
