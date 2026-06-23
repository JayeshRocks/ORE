"""
orerag.config - central configuration.

All paths and tunables are read from environment variables once at import
time, so the rest of the codebase never touches `os.environ` directly.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

# Repo root: <repo>/ai-rag/src/orerag/config.py -> <repo>/ai-rag
PACKAGE_ROOT: Path = Path(__file__).resolve().parent
AI_RAG_ROOT: Path = PACKAGE_ROOT.parent.parent  # <repo>/ai-rag
REPO_ROOT: Path = AI_RAG_ROOT.parent             # <repo>

# In a real install (pip install -e .), the package lives in site-packages,
# so the fallbacks below are what contributors actually use day-to-day.
_PROJECT_ROOT: Path = AI_RAG_ROOT if (AI_RAG_ROOT / "src").exists() else REPO_ROOT


def _project_path(*parts: str) -> Path:
    return _PROJECT_ROOT.joinpath(*parts)


@dataclass(frozen=True)
class Settings:
    """Runtime configuration for the ORERAG pipeline."""

    # Storage
    chroma_path: Path = field(
        default_factory=lambda: Path(
            os.environ.get("ORERAG_CHROMA_PATH", str(_project_path("chroma_db")))
        )
    )
    chroma_collection: str = field(
        default_factory=lambda: os.environ.get("ORERAG_CHROMA_COLLECTION", "documents")
    )

    # Documents
    documents_dir: Path = field(
        default_factory=lambda: Path(
            os.environ.get("ORERAG_DOCUMENTS_DIR", str(_project_path("documents")))
        )
    )

    # Models (Ollama)
    embed_model: str = field(
        default_factory=lambda: os.environ.get("ORERAG_EMBED_MODEL", "nomic-embed-text")
    )
    llm_model: str = field(
        default_factory=lambda: os.environ.get("ORERAG_LLM_MODEL", "gemma4:31b-cloud")
    )

    # Chunking
    chunk_size: int = field(
        default_factory=lambda: int(os.environ.get("ORERAG_CHUNK_SIZE", "1000"))
    )
    chunk_overlap: int = field(
        default_factory=lambda: int(os.environ.get("ORERAG_CHUNK_OVERLAP", "200"))
    )

    # Retrieval
    n_results: int = field(
        default_factory=lambda: int(os.environ.get("ORERAG_N_RESULTS", "4"))
    )

    # Server
    api_host: str = field(
        default_factory=lambda: os.environ.get("ORERAG_API_HOST", "0.0.0.0")
    )
    api_port: int = field(
        default_factory=lambda: int(os.environ.get("ORERAG_API_PORT", "8000"))
    )


def get_settings() -> Settings:
    """Return a fresh Settings instance (re-reads env)."""
    return Settings()
