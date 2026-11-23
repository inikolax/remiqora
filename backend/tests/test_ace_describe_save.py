"""ACE-Step's "describe the music" takes: the hook title and the cover prompt (2026-11-19 engine test findings).

The app is imported inside the tests, not at collection: the other test files point the data folder at their own
temporary one before they import it and check that they did, so this file must not import it first.
"""
from __future__ import annotations

import importlib


def test_hook_title_prefers_the_repeated_chorus_line():
    song_title = importlib.import_module("app.song_title")
    lyrics = "[Verse]\nМы идём вдоль реки\n[Chorus]\nЛетний вечер, тёплый ветер\nЛетний вечер, тёплый ветер\nДо утра"
    assert song_title.hook_title(lyrics) == "Летний вечер, тёплый ветер"


def test_hook_title_cuts_a_long_line_and_skips_markup():
    song_title = importlib.import_module("app.song_title")
    assert song_title.hook_title("[verse]\nWalking down the road with you tonight under the stars") == "Walking down the road"
    assert song_title.hook_title("[instrumental]\n\n") == ""


def test_cover_prompt_drops_the_requested_length_line():
    covers = importlib.import_module("app.covers")
    params = {"sample_query": "тёплый фанк с духовыми\nRequested: about 30 seconds long."}
    assert "30 seconds" not in covers.build_prompt({}, params)


def test_cover_prompt_uses_the_style_ace_step_wrote():
    covers = importlib.import_module("app.covers")
    params = {"sample_query": "тёплый фанк\nRequested: about 30 seconds long.",
              "prompt": "Funk, brass section, female vocals, sunset, warm summer evening"}
    prompt = covers.build_prompt({}, params)
    assert "brass section" in prompt and "female vocals" not in prompt and "30 seconds" not in prompt
