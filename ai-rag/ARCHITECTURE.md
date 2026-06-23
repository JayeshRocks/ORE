# Architecture

> Module-level design notes for contributors. The high-level overview
> lives in [`README.md`](README.md); this file is the **why**.

## Module dependency graph

```text
           ┌──────────────┐
           │  config.py   │  env-driven Settings
           └──────┬───────┘
                  │ imported by everyone
   ┌──────────────┼───────────────────────────────────────────────┐
   │              │                                               │
   ▼              ▼                                               ▼
ingestion    embedding ─────────────────────────────►  pipeline/chat
   │              │                                       ▲
   ▼              ▼                                       │
chunking    storage ◄──── retrieval ──────────────────────┘
                  ▲
                  │
              pipeline/ingest
                  ▲
                  │
                cli / api
```

Rules of thumb:

- `config.py` is the only module that reads environment variables.
- `ingestion`, `chunking`, `embedding`, `storage`, `retrieval`, `prompts`
  are **leaf modules** — they don't import each other except through
  `pipeline/` or `retrieval/`.
- `pipeline/` orchestrates leaf modules. Adding a new end-to-end flow?
  Add it here, not in a leaf.
- `api/` and `cli/` are thin surfaces; keep business logic in `pipeline/`.

## Settings flow

`orerag.config.get_settings()` returns a fresh `Settings` dataclass each
call by reading environment variables. Modules cache a settings instance
at import time **only** for path-like values (e.g. `chroma_path`).
Runtime overrides (chunk size, n_results, etc.) are read **per call** so
tests can monkeypatch `monkeypatch.setenv("ORERAG_CHUNK_SIZE", "777")`
without re-importing.

## Storage model

Each ChromaDB chunk has metadata:

```python
{"source": "<original filename.pdf>", "chunk_index": <int>}
```

This keeps ingestion idempotent (re-ingesting appends) and gives future
citation-aware responses enough information to point back to the file.

## Test isolation

- `tmp_chroma_dir` — every test that touches ChromaDB gets a fresh on-disk DB.
- `fake_embedder` — replaces `ollama.embed` with a deterministic vector.
- `fake_chat` — replaces the LLM call with a canned response.

This means the full 25-test suite runs in ~2 seconds with **zero
network access**.

## Why `src/` layout?

- Prevents accidental imports from the working directory (a real footgun).
- Forces `pip install -e .` for contributors, which catches packaging bugs early.
- Makes the package boundary explicit.
