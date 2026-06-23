"""Tests for orerag.ingestion.pdf_processor."""
from pathlib import Path

import pytest

from orerag.ingestion import extract_pages, extract_pdf_text

DATA = Path(__file__).resolve().parent / "data" / "sample.pdf"


def test_extract_pages_returns_per_page_dicts():
    pages = extract_pages(DATA)
    assert pages, "expected at least one page"
    for p in pages:
        assert set(p.keys()) == {"page", "text"}
        assert isinstance(p["page"], int) and p["page"] >= 1
        assert isinstance(p["text"], str)


def test_extract_pages_page_numbers_are_one_indexed():
    pages = extract_pages(DATA)
    assert [p["page"] for p in pages] == list(range(1, len(pages) + 1))


def test_extract_pdf_text_is_non_empty_string():
    text = extract_pdf_text(DATA)
    assert isinstance(text, str)
    assert text.strip(), "PDF text should not be empty"


def test_extract_pages_missing_file_raises(tmp_path: Path):
    with pytest.raises(Exception):
        extract_pages(tmp_path / "nope.pdf")
