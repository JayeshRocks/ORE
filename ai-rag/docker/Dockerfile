# ORE AI-RAG Dockerfile - self-hostable image for the ORE platform.
# Usage:
#   docker build -t orerag .
#   docker run -p 8000:8000 -v $PWD/chroma_db:/app/chroma_db -v $PWD/documents:/app/documents orerag

FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    ORERAG_CHROMA_PATH=/app/chroma_db \
    ORERAG_DOCUMENTS_DIR=/app/documents

WORKDIR /app

# System deps for PyMuPDF.
RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential \
 && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml ./
COPY src ./src

RUN pip install --upgrade pip && pip install .

RUN mkdir -p /app/chroma_db /app/documents

EXPOSE 8000

CMD ["uvicorn", "orerag.api.app:app", "--host", "0.0.0.0", "--port", "8000"]
