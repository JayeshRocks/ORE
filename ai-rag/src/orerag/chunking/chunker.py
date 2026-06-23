"""
chunking/chunker.py

Two chunking strategies:

- chunk_text(text) -> list[str]
    LangChain RecursiveCharacterTextSplitter. Default for RAG ingest.

- chunk_pages(pages) -> list[{chunk_id, page, text}]
    Page-aware chunker, useful when you need citations back to a page.
"""

from __future__ import annotations

from collections.abc import Iterable
from typing import Any

from langchain_text_splitters import RecursiveCharacterTextSplitter


def _splitter(chunk_size: int = 1000, chunk_overlap: int = 200) -> RecursiveCharacterTextSplitter:
    return RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
    )


def create_chunks(
    text: str,
    chunk_size: int = 1000,
    chunk_overlap: int = 200,
) -> list[str]:
    """Split a flat text blob into overlapping chunks."""
    if not text or not text.strip():
        return []
    return _splitter(chunk_size, chunk_overlap).split_text(text)


# Alias for the explicit "I have text, not pages" intent.
chunk_text = create_chunks


def chunk_pages(
    pages: Iterable[dict[str, Any]],
    chunk_size: int = 500,
    overlap: int = 50,
) -> list[dict[str, Any]]:
    """
    Page-aware chunker. Each output has { chunk_id, page, text }.

    `chunk_size` is in characters and `overlap` is the char-overlap
    between consecutive chunks within the same page.
    """
    out: list[dict[str, Any]] = []
    chunk_id = 1
    step = max(chunk_size - overlap, 1)

    for page in pages:
        text = page.get("text", "") or ""
        page_num = page.get("page", 0)
        if not text:
            continue

        start = 0
        n = len(text)
        while start < n:
            out.append(
                {
                    "chunk_id": chunk_id,
                    "page": page_num,
                    "text": text[start : start + chunk_size],
                }
            )
            chunk_id += 1
            start += step

    return out
