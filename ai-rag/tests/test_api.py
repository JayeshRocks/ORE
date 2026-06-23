"""FastAPI endpoint tests using TestClient."""
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from orerag.api import create_app
from orerag.storage import clear

DATA = Path(__file__).resolve().parent / "data" / "sample.pdf"


@pytest.fixture()
def client(tmp_chroma_dir, tmp_documents_dir) -> TestClient:
    clear()
    return TestClient(create_app())


def test_root_returns_online(client):
    r = client.get("/")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "online"


def test_health_returns_ok_after_ingest(client, fake_embedder):
    from orerag.pipeline import ingest_document

    ingest_document(DATA)
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"
    assert r.json()["documents_indexed"] > 0


def test_documents_list(client):
    r = client.get("/documents")
    assert r.status_code == 200
    assert r.json() == {"documents": []}


def test_chat_endpoint(client, fake_embedder, fake_chat):
    from orerag.pipeline import ingest_document

    ingest_document(DATA)
    r = client.post("/chat", json={"question": "What is Naive RAG?"})
    assert r.status_code == 200
    body = r.json()
    assert body["answer"] == "stub-answer"
    assert body["sources"] >= 1


def test_upload_rejects_non_pdf(client):
    r = client.post(
        "/upload",
        files={"file": ("notes.txt", b"hello", "text/plain")},
    )
    assert r.status_code == 200
    assert r.json()["status"] == "error"


def test_upload_ingests_pdf(client, fake_embedder):
    with open(DATA, "rb") as f:
        r = client.post(
            "/upload",
            files={"file": ("sample.pdf", f, "application/pdf")},
        )
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "success"
    assert body["chunks"] > 0
