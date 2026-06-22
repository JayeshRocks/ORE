import fitz

def extract_pages(pdf_path):
    doc = fitz.open(pdf_path)

    pages = []

    for page_num, page in enumerate(doc):
        pages.append({
            "page": page_num + 1,
            "text": page.get_text()
        })

    doc.close()

    return pages 


# Sample "Unit_1.pdf" with use case : 

#pages = extract_pages("Unit_1.pdf")
#for page in pages:
#       print(f"\n--- Page {page['page']} ---")
#       print(page["text"][:300])
#extract_pages("Unit_1.pdf")

