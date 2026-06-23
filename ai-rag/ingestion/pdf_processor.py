"""
ingestion/pdf_processor.py

ORE AI-RAG Pipeline - PDF text extraction.

Replicates rag_playground/pdf_read.py semantics while keeping the
existing PyMuPDF-based extractor (used by ingestion/pipeline.py and
chunking/chunker.py) so we don't regress on page-level metadata.

Public API (stable):
    - extract_pages(pdf_path) -> list[dict]
        [{ "page": <int 1-based>, "text": <str> }, ...]
    - extract_pdf_text(pdf_path) -> str
        Flat text across all pages (rag_playground-compatible shim).
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List

import fitz  # PyMuPDF


def extract_pages(pdf_path: str | Path) -> List[Dict[str, Any]]:
    """
    Extract page-level text from a PDF using PyMuPDF.

    Returns a list of dicts: { "page": <int 1-based>, "text": <str> }.
    """
    pdf_path = str(pdf_path)
    doc = fitz.open(pdf_path)

    pages: List[Dict[str, Any]] = []
    try:
        for page_num, page in enumerate(doc):
            pages.append(
                {
                    "page": page_num + 1,
                    "text": page.get_text() or "",
                }
            )
    finally:
        doc.close()

    return pages


def extract_pdf_text(pdf_path: str | Path) -> str:
    """
    Flatten all page text into a single string.

    This mirrors rag_playground/pdf_read.py so existing call sites
    and downstream code keep working unchanged.
    """
    pages = extract_pages(pdf_path)
    return "\n".join(p["text"] for p in pages).strip() + "\n"
