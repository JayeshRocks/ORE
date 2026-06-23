"""
cli.py

Console-script entrypoints. Lets `pip install -e .` expose:

    orerag ingest [PATH]
    orerag chat
    orerag serve
"""

from __future__ import annotations

import argparse
import sys
from collections.abc import Sequence
from pathlib import Path

from orerag.config import get_settings


def _cmd_ingest(args: argparse.Namespace) -> int:
    from orerag.pipeline import ingest_document, ingest_documents

    target = Path(args.path) if args.path else None
    if target is None or target.is_dir():
        summary = ingest_documents(target)
        for name, n in summary.items():
            print(f"{name}\t{n} chunks")
        if not summary:
            print("No documents found.", file=sys.stderr)
            return 1
        return 0

    n = ingest_document(target)
    print(f"{target.name}\t{n} chunks")
    return 0


def _cmd_chat(args: argparse.Namespace) -> int:
    from orerag.pipeline import ask_question

    print("ORE RAG chat (Ctrl-D / empty line to exit)\n")
    while True:
        try:
            q = input("> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            return 0
        if not q:
            return 0
        result = ask_question(q)
        print("\n" + result["answer"] + "\n")


def _cmd_serve(args: argparse.Namespace) -> int:
    import uvicorn

    settings = get_settings()
    uvicorn.run(
        "orerag.api.app:app",
        host=args.host or settings.api_host,
        port=args.port or settings.api_port,
        reload=args.reload,
    )
    return 0


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="orerag", description="ORE AI-RAG CLI")
    sub = parser.add_subparsers(dest="command", required=True)

    p_ingest = sub.add_parser("ingest", help="Ingest PDFs into ChromaDB")
    p_ingest.add_argument("path", nargs="?", help="PDF file or directory (default: documents/)")
    p_ingest.set_defaults(func=_cmd_ingest)

    p_chat = sub.add_parser("chat", help="Interactive RAG REPL")
    p_chat.set_defaults(func=_cmd_chat)

    p_serve = sub.add_parser("serve", help="Run the FastAPI server")
    p_serve.add_argument("--host", help="Override ORERAG_API_HOST")
    p_serve.add_argument("--port", type=int, help="Override ORERAG_API_PORT")
    p_serve.add_argument("--reload", action="store_true", help="Enable auto-reload")
    p_serve.set_defaults(func=_cmd_serve)

    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
