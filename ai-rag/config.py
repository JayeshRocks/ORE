import os
from dataclasses import dataclass, field
from pathlib import Path


def _project_path(*parts):
    return Path(__file__).resolve().parent.joinpath(*parts)


@dataclass(frozen=True)
class Settings:
    ollama_host: str = field(
        default_factory=lambda: os.environ.get("ORERAG_OLLAMA_HOST", "http://127.0.0.1:11434")
    )
    embed_model: str = field(
        default_factory=lambda: os.environ.get("ORERAG_EMBED_MODEL", "nomic-embed-text")
    )
    chunk_size: int = field(
        default_factory=lambda: int(os.environ.get("ORERAG_CHUNK_SIZE", "1000"))
    )
    chunk_overlap: int = field(
        default_factory=lambda: int(os.environ.get("ORERAG_CHUNK_OVERLAP", "200"))
    )
    documents_dir: Path = field(
        default_factory=lambda: Path(
            os.environ.get("ORERAG_DOCUMENTS_DIR", str(_project_path("documents")))
        )
    )


def get_settings():
    return Settings()
