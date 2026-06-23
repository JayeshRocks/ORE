# orerag — ORE AI-RAG Pipeline

[![Python](https://img.shields.io/badge/python-3.9%2B-blue)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Status](https://img.shields.io/badge/status-beta-yellow)](#)

Local-first **Retrieval-Augmented Generation (RAG)** pipeline that powers the
[**ORE** platform](https://github.com/kajuopensource/ore) by
[**Kaju Open Source**](https://github.com/kajuopensource).

It takes PDFs (or any text) → chunks them → embeds them locally with Ollama →
stores them in ChromaDB → retrieves relevant context → and answers questions
with a local LLM. **Nothing leaves your machine.**

---

## ✨ Features

- 📄 **PDF ingestion** via PyMuPDF
- ✂️ **Smart chunking** (LangChain `RecursiveCharacterTextSplitter` + page-aware mode)
- 🧠 **Local embeddings** via Ollama (`nomic-embed-text`)
- 💾 **Persistent vector DB** via ChromaDB
- 🔍 **Semantic retrieval** with metadata + distance scoring
- 💬 **RAG chat** with a context-grounded study-assistant prompt
- 🌐 **FastAPI service** (`/chat`, `/upload`, `/documents`, `/health`)
- 🧰 **CLI**: `orerag ingest | chat | serve`
- 🐳 **Dockerfile + compose** for self-hosting
- 🧪 **25 unit + API tests**, all run offline

---

## 🏗️ Architecture

```text
PDF / text
   │
   ▼  ingestion/         extract_pages() / extract_pdf_text()
chunks
   │
   ▼  chunking/          create_chunks() / chunk_pages()
embeddings
   │
   ▼  embedding/         get_embeddings()   ← Ollama (nomic-embed-text)
vector store
   │
   ▼  storage/           add_chunks() / search()    ← ChromaDB (persistent)
retrieval
   │
   ▼  retrieval/         retrieve() / retrieve_with_meta()
answer
   │
   ▼  pipeline/chat.py   ask_question()  ← Ollama LLM
HTTP
   │
   ▼  api/app.py         FastAPI (or CLI via orerag)
```

---

## 📦 Project layout

```text
ai-rag/
├── src/orerag/                 # the installable package
│   ├── __init__.py
│   ├── config.py               # env-driven Settings dataclass
│   ├── cli.py                  # `orerag` console-script entrypoint
│   │
│   ├── ingestion/              # PDF → text
│   │   └── pdf_processor.py
│   ├── chunking/               # text → chunks
│   │   └── chunker.py
│   ├── embedding/              # text → vectors (Ollama)
│   │   └── embedder.py
│   ├── storage/                # vectors → ChromaDB
│   │   └── vector_store.py
│   ├── retrieval/              # question → top-k chunks
│   │   └── retriever.py
│   ├── prompts/                # system prompts
│   │   └── __init__.py
│   ├── pipeline/               # end-to-end orchestrators
│   │   ├── ingest.py           # ingest_document / ingest_documents
│   │   └── chat.py             # ask_question
│   └── api/                    # FastAPI service
│       └── app.py
│
├── tests/                      # pytest suite (25 tests, no Ollama needed)
│   ├── conftest.py
│   ├── data/sample.pdf
│   ├── test_ingestion.py
│   ├── test_chunking.py
│   ├── test_storage.py
│   ├── test_pipeline.py
│   ├── test_api.py
│   └── test_prompts.py
│
├── docker/                     # self-hosting assets
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── pyproject.toml              # packaging + tooling config
├── Makefile                    # install / test / lint / run-*
├── .env.example                # env template
├── .gitignore
├── requirements.txt            # mirror of pyproject deps (no install required)
└── README.md
```

---

## 🚀 Quick start

### 1. Prerequisites

- **Python ≥ 3.9**
- **Ollama** running locally: <https://ollama.com/download>
- Models pulled:

  ```bash
  ollama pull nomic-embed-text
  ollama pull gemma4:31b-cloud     # or any chat model you like
  ```

### 2. Install

```bash
git clone https://github.com/kajuopensource/ore
cd ore/ai-rag
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
```

### 3. Ingest

```bash
cp path/to/your.pdf documents/
orerag ingest                    # ingests everything in documents/
```

### 4. Talk to it

```bash
# REPL
orerag chat

# Or HTTP API
orerag serve                     # → http://localhost:8000
curl -X POST http://localhost:8000/chat \
     -H 'content-type: application/json' \
     -d '{"question":"What is Naive RAG?"}'
```

### 5. Docker (self-host)

```bash
cd docker
docker compose up --build
```

---

## ⚙️ Configuration

All settings come from environment variables (or `.env`). See `.env.example`:

| Variable                  | Default              | Purpose                          |
|---------------------------|----------------------|----------------------------------|
| `ORERAG_CHROMA_PATH`      | `./chroma_db`        | ChromaDB persistent directory    |
| `ORERAG_CHROMA_COLLECTION`| `documents`          | ChromaDB collection name         |
| `ORERAG_DOCUMENTS_DIR`    | `./documents`        | Default folder for `orerag ingest` |
| `ORERAG_EMBED_MODEL`      | `nomic-embed-text`   | Ollama embedding model           |
| `ORERAG_LLM_MODEL`        | `gemma4:31b-cloud`   | Ollama chat model                |
| `ORERAG_CHUNK_SIZE`       | `1000`               | Chunk size (chars)               |
| `ORERAG_CHUNK_OVERLAP`    | `200`                | Overlap between chunks           |
| `ORERAG_N_RESULTS`        | `4`                  | Top-k chunks per query           |
| `ORERAG_API_HOST`         | `0.0.0.0`            | FastAPI host                     |
| `ORERAG_API_PORT`         | `8000`               | FastAPI port                     |

---

## 🧪 Development

```bash
make install         # pip install -e ".[dev]"
make test            # run the full pytest suite
make test-cov        # with coverage
make lint            # ruff check src tests
make run-api         # start FastAPI with reload
make run-chat        # interactive RAG REPL
make clean-db        # nuke ./chroma_db
```

The test suite is **fully offline** — `tests/conftest.py` monkeypatches
Ollama so you don't need a running daemon to run `pytest`.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the contributor guide and
[`ARCHITECTURE.md`](ARCHITECTURE.md) for module-level design notes.

---

## 📚 Relation to Kaju Open Source

> `rag_playground/` is the experimental sandbox where this code first lived.
> `ai-rag/` is the production-grade package that ships with ORE.

Kaju's long-term goal is to transform academic resources into a shared,
searchable, AI-powered knowledge repository for students. This module is
the AI core that powers that vision inside ORE.

---

## 📄 License

MIT © Kaju Open Source. See [LICENSE](LICENSE).
