def chunk_pages(pages, chunk_size=500, overlap=50):
    chunks = []
    chunk_id = 1

    for page in pages:
        text = page["text"]
        page_num = page["page"]

        start = 0

        while start < len(text):
            end = start + chunk_size

            chunks.append({
                "chunk_id": chunk_id,
                "page": page_num,
                "text": text[start:end]
            })

            chunk_id += 1
            start += chunk_size - overlap

    return chunks

import pdf_processor as proc

pages = proc.extract_pages("Unit_1.pdf")

print(chunk_pages(
    pages,
    chunk_size=500,
    overlap=50
))