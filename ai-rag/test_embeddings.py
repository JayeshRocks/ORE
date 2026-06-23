"""
test_embeddings.py

ORE AI-RAG Pipeline - smoke test for the embedder.
Direct port of rag_playground/test_embeddings.py.
"""

from chunking.chunker import create_chunks
from embedding.embedder import get_embedding
from ingestion.pdf_processor import extract_pdf_text


text = extract_pdf_text("documents/sample.pdf")

chunks = create_chunks(text)

print(f"Chunks: {len(chunks)}")

first_chunk = chunks[0]

embedding = get_embedding(first_chunk)

print(f"Embedding Dimensions: {len(embedding)}")
print()
print("First 10 Values:")
print(embedding[:10])
