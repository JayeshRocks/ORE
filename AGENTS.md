# AGENTS.md — project context for future assistants and contributors

> **Read this first** when you (or an AI assistant) come back to this
> repo. It captures the *current state* and *every gotcha* so you don't
> have to rediscover them.

---

## 1. What this project is

**ORE** (Kaju Open Source) — a self-hostable AI-powered knowledge
repository for academic documents. Three independent teams build it:

| Team        | Folder      | What they ship                              |
|-------------|-------------|---------------------------------------------|
| 🤖 AI       | `ai-rag/`   | Python package: PDFs → embeddings           |
| 🧠 Backend  | `backend/`  | FastAPI HTTP API wrapping the AI package    |
| 🎨 Frontend | `frontend/` | Next.js 16 + React 19 + Tailwind v4 + TS    |

**Current state (early alpha, June 2026):**

- ✅ AI team has shipped 3 modules: `ingestion`, `chunking`, `embedding`
- ✅ 10 offline pytest tests passing; 3 marked `@pytest.mark.network` (need Ollama)
- 🟡 Backend has a scaffold (FastAPI app + 1 smoke test) — not connected to AI yet
- 🟡 Frontend is the default `create-next-app` boilerplate — not customized yet

---

## 2. Exact file layout (don't reorganize)

```
ore/                                          ← repo root
│
├── README.md                    38 lines    ← top-level orientation
├── CONTRIBUTING.md              81 lines    ← team rules
├── COMMANDS.md                 ~186 lines   ← every shell command + troubleshooting
├── AGENTS.md                   ← this file
├── LICENSE
├── .env.example                           ← ONE env var: ORERAG_EMBED_MODEL
├── .gitignore
│
├── docs/
│   ├── GETTING-STARTED.md       57 lines
│   └── architecture.png
│
├── ai-rag/                      🤖 AI team's home
│   ├── ingestion.py             📄 PDF → text (PyMuPDF)
│   ├── chunking.py              ✂️  text → chunks (LangChain RecursiveCharacterTextSplitter)
│   ├── embedding.py             🧠 text → vectors (Ollama)
│   ├── pyproject.toml           name = "orerag", pythonpath = ["."], ruff config
│   ├── README.md                50 lines  (TL;DR + per-team specifics)
│   ├── CONTRIBUTING.md          3 lines   (redirect to root)
│   ├── .gitignore
│   ├── tests/                            ← ALL tests live here
│   │   ├── conftest.py
│   │   ├── data/sample.pdf              ← offline test fixture
│   │   ├── test_ingestion.py
│   │   ├── test_chunking.py
│   │   └── test_embedding.py            (3 tests marked @pytest.mark.network)
│   └── documents/                        (empty placeholder for user uploads)
│
├── backend/                     🧠 Backend team's home
│   ├── app/main.py                       ← FastAPI app (scaffold: /, /health)
│   ├── tests/test_smoke.py               ← one passing test
│   ├── pyproject.toml                    name = "orerag-backend"
│   ├── README.md                18 lines
│   └── .gitignore
│
└── frontend/                    🎨 Frontend team's home
    ├── app/  (page.tsx, layout.tsx, globals.css, favicon.ico)
    ├── public/  (5 default Next.js SVGs)
    ├── package.json / package-lock.json / tsconfig.json / …
    ├── README.md                15 lines
    └── .gitignore
```

---

## 3. Conventions — non-negotiable

### Python (ai-rag, backend)

- **Flat at the top.** Each package is a few `.py` files at the project
  root, NOT inside `src/`, NOT inside a sub-package, NO `__init__.py`.
- **One file per concern.** Don't make `embedding/` a folder unless
  `embedding.py` grows past ~150 lines.
- **Tests go in `tests/`** at the package root. New test file?
  `tests/test_<thing>.py`. Same flat shape.
- **No docstrings.** Module-level: none. Function-level: none.
- **No `from __future__ import annotations`.**
- **No `from typing import …`.** Use built-in generics (`list[float]`,
  `dict[str, int]`) — they're available in Python 3.9+.
- **Type hints only on public APIs.** Private helpers can be untyped.
- **No `make`.** Use plain bash commands (see `COMMANDS.md`).
- **No `make`-style aliases in docs.** Say "run `pytest -q`", not
  "run `make test`".

### Naming & versioning

- Package name: `orerag` (do NOT rename — Backend depends on it).
- Version: in `ai-rag/pyproject.toml`, semver. Bump on every public-API
  change and call it out in the PR title (`feat(ai): … · v0.5`).
- Env vars: prefix `ORERAG_`. Today only one exists:
  `ORERAG_EMBED_MODEL` (default: `nomic-embed-text`).

### Imports (from inside `ai-rag/`)

```python
from ingestion import extract_pdf_text, extract_pages
from chunking  import create_chunks, chunk_pages
from embedding import get_embedding, get_embeddings, DEFAULT_EMBED_MODEL
```

That's the whole public API today. Add to the bottom of `embedding.py`'s
list as you grow it.

### Imports (from inside `backend/`, after `pip install -e ../ai-rag`)

```python
from ingestion import extract_pdf_text
from chunking  import create_chunks
from embedding import get_embeddings
```

Same names, same shape.

---

## 4. The pytest sys.path trick (DON'T REMOVE)

`ai-rag/pyproject.toml` has:

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["."]      # ← critical, do not delete
markers = [
    "network: needs a running Ollama daemon (skip with: pytest -m 'not network')",
]
```

**Why:** the four `.py` modules live flat at the top of `ai-rag/` (no
`__init__.py`, no `src/`). Without `pythonpath = ["."]`, pytest inserts
`tests/` at the front of `sys.path`, which shadows the cwd, and you get:

```
ModuleNotFoundError: No module named 'chunking'
```

This is the #1 contributor footgun. If a contributor reports this
error, the fix is either (a) `cd ai-rag` first, or (b) keep
`pythonpath = ["."]` (already there).

**If you ever switch to a `src/` layout, you can remove the
`pythonpath` line.** Until then, leave it.

---

## 5. Common pitfalls — and their one-line fixes

| Symptom                                                       | Cause                                          | Fix                                                              |
|---------------------------------------------------------------|------------------------------------------------|------------------------------------------------------------------|
| `ModuleNotFoundError: No module named 'fitz'`                  | `pymupdf` not installed                         | `pip install pymupdf`                                            |
| `ModuleNotFoundError: No module named 'ollama'`               | Python client not installed                     | `pip install ollama` (NOT the daemon)                            |
| `ModuleNotFoundError: No module named 'chunking'` at pytest   | `pythonpath` missing OR ran from wrong dir      | Verify `pythonpath = ["."]` in `ai-rag/pyproject.toml`; `cd ai-rag` |
| `ConnectionError: Failed to connect to Ollama`                | Daemon not running                              | `ollama serve` in another terminal                               |
| `model 'nomic-embed-text' not found`                          | Model not pulled                                | `ollama pull nomic-embed-text`                                   |
| `pytest: command not found`                                   | Venv not activated                              | `source .venv/bin/activate` (or `.venv\Scripts\activate` on Windows) |
| `python: can't open file 'ingestion.py'`                      | Ran from outside `ai-rag/`                     | `cd ai-rag` first                                                |
| `ModuleNotFoundError: No module named 'fastapi'` (backend)    | Backend venv missing deps                       | `cd backend && pip install -e ".[dev]"`                          |
| `port 8000 already in use`                                    | Old uvicorn process                             | `lsof -ti:8000 | xargs kill -9`                                  |

See `COMMANDS.md` § "🛟 Troubleshooting" for the full table.

---

## 6. How to wire Backend → AI (the exact 3 steps)

When the Backend team is ready to consume the AI package:

```bash
# In backend/, add orerag as a local editable dep:
cd backend
pip install -e ../ai-rag
```

Then in `backend/app/main.py`:

```python
from embedding import get_embeddings
```

That's it. No `conftest.py` changes, no path tricks — `pip install -e`
adds `ai-rag/` to `sys.path` automatically.

To deploy the AI service from Backend over HTTP, the typical pattern is:

```python
# backend/app/main.py
from fastapi import FastAPI
from pydantic import BaseModel
from embedding import get_embeddings

app = FastAPI()

class EmbedRequest(BaseModel):
    texts: list[str]

@app.post("/embed")
def embed(req: EmbedRequest):
    vecs = get_embeddings(req.texts)
    return {"count": len(vecs), "dim": len(vecs[0]) if vecs else 0}
```

Run with:

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

---

## 7. When to add new files vs. new folders

**Add a file** (at the top of `ai-rag/`) when:

- You're introducing a new concern (storage, retrieval, pipeline, prompts).
- A single existing file is still under ~150 lines.

**Add a folder** (split one `.py` into a sub-package) when:

- One file grows past ~150 lines AND
- The two halves clearly belong to different concerns AND
- You've added at least 2 functions to each half.

**Anti-patterns to avoid:**

- ❌ Creating `ai-rag/src/` "because that's what Python projects do" — we
  already proved that flat works fine. Don't add complexity.
- ❌ Adding `__init__.py` files because the editor complains — pytest
  doesn't need them, and the modules are imported by name not as a
  package.
- ❌ Adding `from __future__ import annotations` "for forward compat" —
  we target Python 3.9+ explicitly; built-in generics work today.
- ❌ Wrapping functions in classes "for organization" — flat functions
  are simpler and just as testable.

---

## 8. Roadmap (rough order, not dates)

1. **Add `storage.py`** (ChromaDB persistent client) — needed before
   retrieval makes sense.
2. **Add `retrieval.py`** — `retrieve(question, n_results=4)`.
3. **Add `prompts.py`** — system prompt template.
4. **Add `pipeline.py`** — `ingest_document(path)` and
   `ask_question(question)` end-to-end.
5. **Wire Backend** — `POST /ingest`, `POST /chat`, `POST /upload`.
6. **Replace Frontend `app/page.tsx`** — drop the `create-next-app`
   boilerplate, build the actual ORE chat UI.
7. **`docs/API.md`** — Backend ↔ Frontend HTTP contract.
8. **First real e2e test** — Frontend talks to Backend which talks to
   the AI pipeline which talks to Ollama.

The flat layout is designed to absorb 1–5 with zero restructuring.
Only at step 6+ does folder structure start to matter, and even then,
`packages/ai/` is unlikely to need sub-folders for a while.

---

## 9. Open questions / known TODOs

- [ ] Decide on the actual chunking strategy for production (currently
      `RecursiveCharacterTextSplitter` defaults).
- [ ] Decide on embedding model size (nomic-embed-text is 768-dim;
      bge-large is 1024-dim and stronger).
- [ ] Decide whether to keep `documents/` empty placeholder (currently
      gitignored via `*.pdf` pattern; the `.gitkeep` was removed).
- [ ] Replace `frontend/app/page.tsx` with real ORE UI (currently
      create-next-app boilerplate).
- [ ] Decide on persistence: ChromaDB on disk vs. a hosted vector DB.
- [ ] Add a `docs/API.md` once Backend has more than `/` + `/health`.
- [ ] Add CI (GitHub Actions) — `.github/workflows/` doesn't exist yet.

---

## 10. Things contributors get wrong most often

1. **Running `pytest` from the wrong directory.** → `cd ai-rag` first.
2. **Forgetting to activate the venv.** → `source .venv/bin/activate`.
3. **Adding `__init__.py` "to make imports work".** → Don't, our flat
   layout doesn't need them.
4. **Installing dependencies without `-e`** — fine for one-off testing,
   but `pip install -e ".[dev]"` is what `COMMANDS.md` documents.
5. **Editing `backend/app/main.py` to add a new dep without bumping
   `backend/pyproject.toml`** — both files must stay in sync.
6. **Adding a top-level folder to `ai-rag/` for "organization".** →
   Add a flat `.py` file instead. See § 7.

---

## 11. Quick verification checklist

When in doubt, the project is "healthy" when all of these pass:

```bash
# From the repo root:
cd ai-rag && ruff check . && pytest -q -m "not network"
# Expected: All checks passed! + 10 passed, 3 deselected

cd ../backend && ruff check . && pytest -q
# Expected: All checks passed! + 1 passed (or whatever the count is)

cd ../frontend && npm run lint
# Expected: no errors

# Final sanity: a one-liner Python smoke test:
cd ../ai-rag && python -c "
from ingestion import extract_pdf_text
from chunking  import create_chunks
text = extract_pdf_text('tests/data/sample.pdf')
chunks = create_chunks(text)
print(f'{len(text)} chars -> {len(chunks)} chunks')
"
# Expected: 109738 chars -> 143 chunks
```

If all four pass, the project is in a shippable state.

---

## 12. One-paragraph summary (for someone who has 30 seconds)

ORE is a three-folder monorepo (`ai-rag/`, `backend/`, `frontend/`) with
one team per folder. The AI folder ships a flat Python package
(`ingestion.py`, `chunking.py`, `embedding.py` at the top, no
sub-packages, no `__init__.py`, tests in `tests/`) that the Backend
folder consumes via `pip install -e ../ai-rag`. Run everything with
plain bash — no `make`, no build tools. Pytest needs `pythonpath = ["."]`
in `pyproject.toml` (don't delete it). Ollama runs locally for
embeddings. Frontend is Next.js boilerplate, not yet customized. See
`COMMANDS.md` for every command and `CONTRIBUTING.md` for team rules.
