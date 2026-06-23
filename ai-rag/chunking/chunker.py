"""
chunking/chunker.py

ORE AI-RAG Pipeline - Text chunking.

Replicates rag_playground/chunker.py (RecursiveCharacterTextSplitter via
langchain-text-splitters) AND keeps the existing `chunk_pages(...)` shim
used by ingestion/pipeline.py so the older workflow doesn't regress.

Public API (stable):
    - create_chunks(text, chunk_size=1000, chunk_overlap=200) -> list[str]
        rag_playground-compatible: split a single string into chunks.
    - chunk_pages(pages, chunk_size=500, overlap=50) -> list[dict]
        Backwards-compatible with the pre-existing ORE shim:
        [{ "chunk_id", "page", "text" }, ...].
"""

from __future__ import annotations

from typing import Any, Dict, Iterable, List

from langchain_text_splitters import RecursiveCharacterTextSplitter


# ---------------------------------------------------------------------------
# rag_playground-compatible API
# ---------------------------------------------------------------------------

def create_chunks(
    text: str,
    chunk_size: int = 1000,
    chunk_overlap: int = 200,
) -> List[str]:
    """
    Split a flat text blob into overlapping chunks.

    Defaults mirror rag_playground/chunker.py exactly.
    """
    if not text:
        return []

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
    )
    return splitter.split_text(text)


# ---------------------------------------------------------------------------
# ORE pre-existing shim (page-aware chunking)
# ---------------------------------------------------------------------------

def chunk_pages(
    pages: Iterable[Dict[str, Any]],
    chunk_size: int = 500,
    overlap: int = 50,
) -> List[Dict[str, Any]]:
    """
    Page-aware chunker used by ingestion/pipeline.py.

    Each output dict has: { "chunk_id": int, "page": int, "text": str }.
    """
    out: List[Dict[str, Any]] = []
    chunk_id = 1

    for page in pages:
        text = page.get("text", "") or ""
        page_num = page.get("page", 0)

        if not text:
            continue

        start = 0
        n = len(text)
        step = max(chunk_size - overlap, 1)

        while start < n:
            end = start + chunk_size
            out.append(
                {
                    "chunk_id": chunk_id,
                    "page": page_num,
                    "text": text[start:end],
                }
            )
            chunk_id += 1
            start += step

    return out


# ---------------------------------------------------------------------------
# Manual smoke test (mirrors the bottom of rag_playground/chunker.py).
# Run:  python -m chunking.chunker
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    from ingestion.pdf_processor import extract_pages

    file_path = "./data/sample.pdf"
    pages = extract_pages(file_path)

    print(chunk_pages(pages, chunk_size=500, overlap=50))
