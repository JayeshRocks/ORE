from ingestion import extract_pages
from chunking import chunk_pages
from vector_store import store_chunk
from retrevier import retrieve_context

pages = extract_pages("./tests/data/sample.pdf")

chunks = chunk_pages(pages)

for i, chunk in enumerate(chunks):
    store_chunk(
        chunk_id=i,
        text=chunk["text"],
        page=chunk["page"]
    )


question = input("Ask a Question")

context = retrieve_context(question)

print("Answer : \n",context)