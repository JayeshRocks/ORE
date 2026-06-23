"""Tests for orerag.cli argument parsing and dispatch (offline)."""
from orerag.cli import main


def test_help_exits_cleanly():
    # argparse with -h exits SystemExit(0)
    import pytest

    with pytest.raises(SystemExit) as exc:
        main(["--help"])
    assert exc.value.code == 0


def test_unknown_command_exits_nonzero():
    import pytest

    with pytest.raises(SystemExit) as exc:
        main(["wat"])
    assert exc.value.code != 0
