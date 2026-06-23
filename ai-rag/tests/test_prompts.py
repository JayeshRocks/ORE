"""Tests for orerag.prompts."""
from orerag.prompts import (
    STUDY_ASSISTANT_SYSTEM,
    build_system_prompt,
    render_study_assistant_system,
)


def test_render_includes_context():
    out = render_study_assistant_system("CTX-123")
    assert "CTX-123" in out
    assert "study assistant" in out.lower()


def test_build_system_prompt_alias():
    assert build_system_prompt is render_study_assistant_system


def test_study_assistant_system_uses_template_variable():
    assert "$context" in STUDY_ASSISTANT_SYSTEM
