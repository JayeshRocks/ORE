"""
test_search.py

ORE AI-RAG Pipeline - smoke test for semantic search.
Direct port of rag_playground/test_search.py.
"""

from embedding.embedder import get_embedding
from storage.vector_store import search


question = input("Question: ")

question_embedding = get_embedding(question)

results = search(question_embedding)

print("\nTop Results:\n")

for i, chunk in enumerate(results):
    print(f"\n--- Result {i+1} ---\n")
    print(chunk[:800])
