"""End-to-end pipelines: ingest and chat."""

from orerag.pipeline.chat import ask_question
from orerag.pipeline.ingest import ingest_document, ingest_documents

__all__ = ["ask_question", "ingest_document", "ingest_documents"]
