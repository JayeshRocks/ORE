"""
prompts - reusable prompt templates for the ORE AI-RAG Pipeline.

The default study-assistant system prompt refuses to answer outside the
provided context, which is the whole point of RAG.
"""

from __future__ import annotations

from string import Template
from typing import Final

# ---------------------------------------------------------------------------
# System prompts
# ---------------------------------------------------------------------------

STUDY_ASSISTANT_SYSTEM: Final[str] = """
You are a study assistant.

Answer ONLY using the provided context.

If the answer is not present in the context, say:

"I could not find that information in the document."

CONTEXT:

$context
""".strip("\n")


# Backwards-compatible alias.
SYSTEM_PROMPT = STUDY_ASSISTANT_SYSTEM


def render_study_assistant_system(context: str) -> str:
    """Render the study-assistant prompt with a context block injected."""
    return Template(STUDY_ASSISTANT_SYSTEM).safe_substitute(context=context)


# Short alias.
build_system_prompt = render_study_assistant_system


__all__ = [
    "STUDY_ASSISTANT_SYSTEM",
    "SYSTEM_PROMPT",
    "render_study_assistant_system",
    "build_system_prompt",
]
