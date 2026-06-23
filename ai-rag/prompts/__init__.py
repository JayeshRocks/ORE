"""
prompts/__init__.py

Reusable prompt templates for the ORE AI-RAG Pipeline.
Mirrors the system prompt used in rag_playground/rag_chat.py.
"""

from __future__ import annotations

from string import Template
from typing import Final


# ---------------------------------------------------------------------------
# Study-assistant system prompt (rag_playground/rag_chat.py compatible)
# ---------------------------------------------------------------------------

STUDY_ASSISTANT_SYSTEM: Final[str] = """
You are a study assistant.

Answer ONLY using the provided context.

If the answer is not present in the context, say:

"I could not find that information in the document."

CONTEXT:

$context
"""


# ---------------------------------------------------------------------------
# Templating helpers
# ---------------------------------------------------------------------------

def render_study_assistant_system(context: str) -> str:
    """
    Render the study-assistant system prompt with a context block injected.

    Matches rag_playground's exact wording so behavior is identical when
    swapping that code path out for this one.
    """
    return Template(STUDY_ASSISTANT_SYSTEM).safe_substitute(context=context)


# Convenience aliases so callers don't have to remember the long name.
SYSTEM_PROMPT = STUDY_ASSISTANT_SYSTEM
build_system_prompt = render_study_assistant_system
