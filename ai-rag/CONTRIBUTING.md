# Contributing to orerag

Thanks for your interest in contributing to the ORE AI-RAG pipeline! 🎉

This guide will get you productive in a few minutes.

---

## 📦 Setup

```bash
git clone https://github.com/kajuopensource/ore
cd ore/ai-rag
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
```

You don't need Ollama running for development — the test suite uses a
fake embedder / chat. To exercise the real pipeline locally, install
Ollama and pull:

```bash
ollama pull nomic-embed-text
ollama pull gemma4:31b-cloud
```

---

## 🧱 Project layout (where to put code)

Everything that ships in the package lives under `src/orerag/`. Each
subpackage has a single responsibility:

| Subpackage        | Responsibility                                  | Key API                                      |
|-------------------|-------------------------------------------------|----------------------------------------------|
| `ingestion`       | Load documents (PDF → text)                     | `extract_pages`, `extract_pdf_text`          |
| `chunking`        | Split text into chunks                          | `create_chunks`, `chunk_pages`               |
| `embedding`       | Text → vectors via Ollama                       | `get_embedding`, `get_embeddings`            |
| `storage`         | Persistent vector store (ChromaDB)              | `add_chunk`, `add_chunks`, `search`, `query` |
| `retrieval`       | Hide embedding + DB plumbing from callers       | `retrieve`, `retrieve_with_meta`             |
| `prompts`         | System prompt templates                         | `build_system_prompt`                        |
| `pipeline`        | End-to-end orchestrators                        | `ingest_document`, `ask_question`            |
| `api`             | FastAPI HTTP surface                            | `create_app`, `app`                          |

If you're adding a new feature, prefer extending an existing module over
adding a new top-level one.

---

## 🧪 Tests

We use **pytest**. Tests live in `tests/`, mirroring the package layout
(`test_<module>.py`). Most tests use the shared fixtures in
`tests/conftest.py`:

- `tmp_chroma_dir` — isolated ChromaDB on disk
- `tmp_documents_dir` — isolated uploads folder
- `fake_embedder` — deterministic stand-in for Ollama embeddings
- `fake_chat` — canned LLM response

Run them:

```bash
make test            # quick
make test-cov        # with coverage
```

Mark tests that **need** a real Ollama/ChromaDB with `@pytest.mark.network`.

---

## ✨ Coding style

- **Formatter**: `ruff format` (the same as the `lint` target).
- **Linter**: `make lint` runs `ruff check src tests`. No warnings tolerated.
- **Type hints**: required on all new public functions.
- **Docstrings**: NumPy-style, one-line summary + (optional) extended description.
- **Imports**: absolute, sorted by `ruff` (isort rules).
- **No top-level side effects** in `__init__.py` other than re-exports.

---

## 🔁 Pull-request workflow

1. Fork & branch from `main`.
2. Make your change. Include tests for new behavior.
3. `make test && make lint` — both must pass.
4. Update `README.md` / `.env.example` if you changed config or public API.
5. Open a PR describing **what** and **why**. Screenshots welcome for UI work.

---

## 🐛 Reporting bugs

Open an issue at <https://github.com/kajuopensource/ore/issues> with:

- a minimal repro,
- the ORERAG / Python / Ollama versions,
- relevant logs (`ORERAG_*` env vars included).

---

## 💡 Feature requests

We love them. Open an issue with the **use case** first — if it fits the
roadmap, we'll discuss the API shape before any code is written.

---

## 📜 License

By contributing you agree your work is MIT-licensed, same as the project.
