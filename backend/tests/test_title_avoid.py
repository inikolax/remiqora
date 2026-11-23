"""The prompt assistant's "title" task told which names it already gave ("Another one" in the library): the names go
into its instructions, and a repeat is asked again and kept only when nothing new comes.

The task lives in external/prompt-assistant (its own environment); tasks.py needs only the standard library.
"""
from __future__ import annotations

import importlib
import json
import sys
from pathlib import Path

_PA = Path(__file__).resolve().parents[2] / "external" / "prompt-assistant"


def _tasks():
    if str(_PA) not in sys.path:
        sys.path.insert(0, str(_PA))
    return importlib.import_module("prompt_assistant.tasks")


COVER = "A single bonfire burning on a black cliff above a stormy sea, sparks rising into a night sky, painterly illustration"
IDEA = "Lyrics: [Chorus]\nWe are the fire in the dark tonight\nStyle: anthemic rock"


def _fake(titles):
    calls = []

    def generate(system, user, max_tokens, temperature, seed):
        calls.append((system, user))
        return json.dumps({"title": titles[min(len(calls) - 1, len(titles) - 1)], "cover": COVER}), 10

    return generate, calls


def test_avoid_line_goes_into_the_instructions_not_the_input():
    tasks = _tasks()
    generate, calls = _fake(["Night Sparks"])
    out = tasks.title(generate, IDEA + "\nAvoid: Fire in the Dark | Burning Tonight")
    assert out["title"] == "Night Sparks"
    system, user = calls[0]
    assert "Fire in the Dark; Burning Tonight" in system
    assert "Avoid" not in user


def test_a_repeated_name_is_asked_again():
    tasks = _tasks()
    generate, calls = _fake(["fire in the dark!", "Night Sparks"])
    out = tasks.title(generate, IDEA + "\nAvoid: Fire in the Dark")
    assert out["title"] == "Night Sparks"
    assert len(calls) == 2


def test_only_repeats_returns_the_repeat():
    tasks = _tasks()
    generate, calls = _fake(["Fire in the Dark"])
    out = tasks.title(generate, IDEA + "\nAvoid: Fire in the Dark")
    assert out["title"] == "Fire in the Dark"
    assert len(calls) == 3


def test_without_avoid_line_the_prompt_is_unchanged():
    tasks = _tasks()
    generate, calls = _fake(["Fire in the Dark"])
    out = tasks.title(generate, IDEA)
    assert out["title"] == "Fire in the Dark"
    assert calls[0][0] == tasks.TITLE.replace("{lang}", "the language of the lyrics")
