# ORE AI-RAG Pipeline

The production-quality AI-RAG pipeline that powers **ORE** (Kaju Open Source).

This module is a faithful port of the experimental
[`rag_playground/`](../rag_playground/) sandbox onto a real module
layout (`ingestion/`, `chunking/`, `embedding/`, `storage/`,
`retrieval/`, `prompts/`) so it can be wired into the ORE backend,
CLI, and self-hostable Docker image.

---

## What it does

```text
PDF
 ↓  ingestion/pdf_processor.py
Text Extraction
 ↓  chunking/chunker.py
Chunking
 ↓  embedding/embedder.py
Embeddings (Ollama - nomic-embed-text)
 ↓  storage/vector_store.py
Vector Database (ChromaDB - persistent)
 ↓  retrieval/retriever.py
Semantic Retrieval
 ↓  rag_chat.py
Local LLM (Ollama - default: gemma4:31b-cloud)
 ↓
Answer Generation
```

---

## Features

- **PDF Processing** – Extract text via PyMuPDF (`ingestion/pdf_processor.py`),
  with a rag_playground-compatible flat-text shim.
- **Chunking** – LangChain `RecursiveCharacterTextSplitter` with
  context-preserving overlap, plus a page-aware shim used by the
  legacy ORE pipeline.
- **Embeddings** – Local via Ollama (`nomic-embed-text`).
- **Vector DB** – Persistent ChromaDB with rich metadata (source file,
  chunk index, page number).
- **Retrieval** – One-call wrapper that hides the embedding + DB plumbing.
- **RAG Chat** – Default study-assistant prompt that refuses to answer
  outside the retrieved context.
- **HTTP API** – FastAPI service (`app.py`) with `/chat`, `/upload`,
  `/documents`, and `/`.

---

## Repository Structure

```text
ai-rag/
├── ingestion/
│   └── pdf_processor.py     # PDF -> text (PyMuPDF, rag_playground-compatible)
├── chunking/
│   ├── chunker.py           # RecursiveCharacterTextSplitter
│   └── data/
│       └── sample.pdf       # Local dev fixture
├── embedding/
│   └── embedder.py          # Ollama embeddings (nomic-embed-text)
├── storage/
│   └── vector_store.py      # ChromaDB persistent client
├── retrieval/
│   └── retriever.py         # retrieve() / retrieve_with_meta()
├── prompts/
│   └── __init__.py          # study-assistant system prompt
│
├── ingest.py                # CLI: ingest PDFs -> ChromaDB
├── rag_chat.py              # ask_question() end-to-end RAG
├── app.py                   # FastAPI service (uvicorn app:app)
├── main.py                  # interactive CLI (--rag or full-PDF)
│
├── test_chunks.py           # smoke test
├── test_embeddings.py       # smoke test
├── test_search.py           # smoke test
│
├── MAKEFILE                 # make ingest / serve / test-*
├── requirements.txt
├── .env.example
└── README.md
```

---

## Quick Start

```bash
# 1. Create + activate the venv (Python 3.9+)
python3 -m venv .venv
source .venv/bin/activate

# 2. Install deps
pip install -r requirements.txt

# 3. Drop a PDF in documents/ (sample.pdf ships under chunking/data/, copy or symlink)
mkdir -p documents
cp chunking/data/sample.pdf documents/

# 4. Ingest it (extracts -> chunks -> embeds -> upserts into ChromaDB)
python ingest.py

# 5. Talk to it
python rag_chat.py           # one-shot
python main.py --rag         # REPL

# 6. Or run the HTTP service
uvicorn app:app --reload --port 8000
```

Required local services:

- **Ollama** running on `http://127.0.0.1:11434` with both:
  - `nomic-embed-text` – embeddings
  - `gemma4:31b-cloud` (or override via `model=` in `rag_chat.ask_question`)

Pull them with:

```bash
ollama pull nomic-embed-text
ollama pull gemma4:31b-cloud
```

---

## Configuration

| Variable                | Default        | Purpose                                  |
|-------------------------|----------------|------------------------------------------|
| `ORE_CHROMA_PATH`       | `./chroma_db`  | ChromaDB persistent directory            |
| `ORE_CHROMA_COLLECTION` | `documents`    | ChromaDB collection name                 |
| `ORE_DOCUMENTS_DIR`     | `./documents`  | Folder watched by FastAPI `/upload`      |

See [`.env.example`](./.env.example).

---

## Relation to Kaju Open Source

> `rag_playground/` is the experimental sandbox.
> `ai-rag/` is the production pipeline.

Kaju's long-term goal is to transform academic resources into a shared,
searchable, AI-powered knowledge repository for students. This module is
the AI core that powers that vision inside ORE.

---

## Status

🚧 Initial port of `rag_playground/` onto the production module layout.
Defaults match the playground exactly so behavior is reproducible.
