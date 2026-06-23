"""
test_chunks.py

ORE AI-RAG Pipeline - smoke test for the chunker.
Direct port of rag_playground/test_chunks.py.
"""

from chunking.chunker import create_chunks
from ingestion.pdf_processor import extract_pdf_text


text = extract_pdf_text("documents/sample.pdf")

chunks = create_chunks(text)

print(f"Total Chunks: {len(chunks)}")

for i, chunk in enumerate(chunks[:3]):
    print(f"\n--- Chunk {i+1} ---")
    print(chunk[:500])
