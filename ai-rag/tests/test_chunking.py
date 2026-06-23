"""Tests for orerag.chunking.chunker."""
from orerag.chunking import chunk_pages, create_chunks


def test_create_chunks_returns_list_of_strings():
    text = ("Lorem ipsum dolor sit amet. " * 200).strip()
    chunks = create_chunks(text, chunk_size=200, chunk_overlap=20)
    assert len(chunks) > 1
    assert all(isinstance(c, str) for c in chunks)


def test_create_chunks_empty_text_returns_empty_list():
    assert create_chunks("") == []
    assert create_chunks("   \n  ") == []


def test_chunk_pages_assigns_unique_ids_and_keeps_page():
    pages = [
        {"page": 1, "text": "a" * 1500},
        {"page": 2, "text": ""},  # skipped
        {"page": 3, "text": "b" * 200},
    ]
    out = chunk_pages(pages, chunk_size=500, overlap=50)
    ids = [c["chunk_id"] for c in out]
    assert ids == list(range(1, len(out) + 1))
    assert {c["page"] for c in out} == {1, 3}


def test_chunk_pages_overlap_keeps_context():
    pages = [{"page": 1, "text": "abcdefghij" * 100}]  # 1000 chars
    out = chunk_pages(pages, chunk_size=400, overlap=100)
    # First chunk tail should overlap with the second chunk's head.
    assert out[0]["text"][-100:] == out[1]["text"][:100]
