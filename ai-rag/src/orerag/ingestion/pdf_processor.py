"""
ingestion/pdf_processor.py

PDF text extraction.

Returns page-level records ({page, text}) for downstream chunking, plus a
flat-text helper for callers that just want the whole document as one
string.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import fitz  # PyMuPDF


def extract_pages(pdf_path: str | Path) -> list[dict[str, Any]]:
    """
    Extract page-level text from a PDF.

    Returns a list of dicts: { "page": <int 1-based>, "text": <str> }.
    """
    pdf_path = str(pdf_path)
    doc = fitz.open(pdf_path)
    pages: list[dict[str, Any]] = []
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
    """Flatten all page text into a single newline-separated string."""
    pages = extract_pages(pdf_path)
    return "\n".join(p["text"] for p in pages).strip() + "\n"
