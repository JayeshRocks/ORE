# Commands

> Plain `bash` commands only — no `make`, no build tool. Copy-paste from
> here into your terminal.

If you don't know what a tool is:
- **python3** — the Python interpreter. You almost certainly have it.
- **pip** — the Python package manager (installed with Python).
- **node** / **npm** — JavaScript runtime + package manager. Install
  from <https://nodejs.org> if you don't have them.
- **ollama** — the local LLM daemon used by `ai-rag/`. Install from
  <https://ollama.com/download>.

> **Tip:** every shell block assumes you've already `cd`'d into your
> team's folder at the top. Each section restates the `cd` for clarity.

---

## 🤖 AI team — `ai-rag/`

**One-time setup**

```bash
cd ai-rag
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt"

# In a second terminal, leave Ollama running:
ollama serve
# And pull the embedding model (one-time, ~270 MB):
ollama pull nomic-embed-text
```

**Run tests (offline only — fast)**

```bash
cd ai-rag
source .venv/bin/activate          # if not already active
pytest -q -m "not network"
```

Expected output:

```
10 passed, 3 deselected in 0.4s
```

The 3 deselected tests need a running Ollama daemon (they have the
`@pytest.mark.network` marker). Run them with `pytest -q` instead.

**Run tests (all 13, including Ollama-dependent ones)**

```bash
# Make sure 'ollama serve' is running in another terminal first.
pytest -q
```

Expected output:

```
13 passed in 2-5s
```

**Run the linter**

```bash
ruff check .
```

**Run the pipeline from Python**

```bash
python -c "
from ingestion import extract_pdf_text
from chunking  import create_chunks
from embedding import get_embeddings

text   = extract_pdf_text('tests/data/sample.pdf')
chunks = create_chunks(text)
vecs   = get_embeddings(chunks)
print(f'PDF: {len(text):,} chars | {len(chunks)} chunks | vectors {len(vecs)}x{len(vecs[0])}')
"
```

Expected output:

```
PDF: 109,738 chars | 143 chunks | vectors 143x768
```

**Run tests with coverage**

```bash
pytest --cov=. --cov-report=term-missing -q
```

**Clean caches**

```bash
rm -rf .pytest_cache .ruff_cache .coverage htmlcov
find . -type d -name __pycache__ -not -path './.venv/*' -exec rm -rf {} +
```

---

## 🧠 Backend team — `backend/`

**One-time setup**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -e ".[dev]"
```

**Run tests**

```bash
cd backend
source .venv/bin/activate
pytest -q
```

**Run the linter**

```bash
ruff check .
```

**Run the dev server**

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Then open <http://localhost:8000>.

---

## 🎨 Frontend team — `frontend/`

**One-time setup**

```bash
cd frontend
npm install
```

**Run the dev server**

```bash
npm run dev
```

Open <http://localhost:3000>.

**Build / serve / lint**

```bash
npm run build       # production build
npm run start       # serve the production build
npm run lint        # eslint
```

---

## 🛟 Troubleshooting

| Error                                                                      | Cause                                              | Fix                                                      |
|----------------------------------------------------------------------------|----------------------------------------------------|----------------------------------------------------------|
| `ModuleNotFoundError: No module named 'fitz'`                               | `pymupdf` not installed                             | `pip install pymupdf`                                    |
| `ModuleNotFoundError: No module named 'ollama'`                            | Python `ollama` client not installed                | `pip install ollama` (different from the daemon)         |
| `ModuleNotFoundError: No module named 'chunking'` (when running `pytest`)  | Tests run from outside `ai-rag/`                    | `cd ai-rag` first, then `pytest`                        |
| `ConnectionError: Failed to connect to Ollama`                             | The Ollama daemon isn't running                     | Start it: `ollama serve` (in another terminal)           |
| `model 'nomic-embed-text' not found`                                        | Model not pulled                                   | `ollama pull nomic-embed-text`                          |
| `pytest: command not found`                                                 | Venv not activated                                  | `source .venv/bin/activate` first                       |
| `No module named pytest` (inside venv)                                     | Dev deps not installed                              | `pip install -e ".[dev]"`                               |
| `python: can't open file 'ingestion.py'`                                    | Ran from outside `ai-rag/`                         | `cd ai-rag` first                                        |
| `port 8000 already in use` (Backend)                                        | Another process is using port 8000                  | `lsof -ti:8000 | xargs kill -9` or pick another port    |

If something else goes wrong, paste the **full error** in your team
channel. Don't try to "fix" random files — usually it's one of the above.
