"""
main.py

ORE AI-RAG Pipeline - CLI entry point (rag_playground/main.py port).

Interactive Q&A loop against an already-ingested ChromaDB collection.

Usage:
    python main.py
"""

from __future__ import annotations

import time

from ollama import chat

from ingestion.pdf_processor import extract_pdf_text
from prompts import build_system_prompt
from rag_chat import ask_question


def main() -> None:
    """
    Mirrors rag_playground/main.py:
        1. Time the PDF extraction.
        2. Print a few stats about the PDF.
        3. Loop forever: read a question, ask the LLM (context = full PDF),
           print the answer.

    Note: this command uses the FULL PDF as context (no RAG). For RAG,
    use `python main.py --rag` or import ask_question() directly.
    """
    import sys

    use_rag = "--rag" in sys.argv
    pdf_path = "documents/sample.pdf"

    # ---- PDF extraction ----
    t0 = time.perf_counter()
    pdf_text = extract_pdf_text(pdf_path)
    pdf_time = time.perf_counter() - t0

    print(f"PDF Extraction: {pdf_time:.2f}s")
    print(f"Characters: {len(pdf_text)}")
    print(f"Words: {len(pdf_text.split())}")

    # ---- Q&A loop ----
    while True:
        question = input("\nAsk a question (or 'quit'): ").strip()
        if not question or question.lower() in {"quit", "exit", "q"}:
            break

        if use_rag:
            result = ask_question(question)
            print("\n" + result["answer"])
        else:
            # Raw LLM with the whole PDF stuffed into the system prompt.
            response = chat(
                model="gemma4:31b-cloud",
                messages=[
                    {
                        "role": "system",
                        "content": build_system_prompt(pdf_text),
                    },
                    {"role": "user", "content": question},
                ],
            )
            print("\n" + response["message"]["content"])


if __name__ == "__main__":
    main()
