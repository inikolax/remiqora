"""A song's default name from its lyrics: the hook, the way frontend/src/utils/songTitle.ts hookTitle does it.

Used where the backend learns the lyrics itself (ACE-Step's "describe the music" mode writes them), so such a take
is named by its chorus and not by the user's description.
"""
from __future__ import annotations

import re

_CHORUS = re.compile(r"chorus|hook|refrain|припев|estribillo|ritornello|refrän|kehrvers", re.I)
_EDGE_CHARS = " \t\"'`“”«»‘’()[]{}<>,.;:!?…-–—*_~/\\|"
_DANGLING = re.compile(
    r"^(?:a|an|the|in|on|at|of|to|for|with|and|or|but|from|by|as|into|over|about|that|which|"
    r"в|на|с|со|и|а|но|к|о|об|от|по|за|из|для|у|что|как)$", re.I)
_REPEAT = re.compile(r"\s*[\[(]\s*(?:x\s*\d+|\d+\s*x|repeat)[^\])]*[\])]\s*$", re.I)


def _edge(s: str) -> str:
    return s.strip(_EDGE_CHARS)


def _squash(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def _cut_words(text: str, max_words: int = 5) -> str:
    clean = _edge(_squash(text))
    if len(clean.split()) <= max_words:
        return clean
    phrases = [p for p in (_edge(x) for x in re.split(r"\s*[,;:–—]\s*|\s+-\s+", clean)) if p]
    out = ""
    for phrase in phrases:
        nxt = f"{out}, {phrase}" if out else phrase
        if len(nxt.split()) > max_words:
            break
        out = nxt
    if not out:
        words = (phrases[0] if phrases else clean).split()[:max_words]
        while len(words) > 2 and _DANGLING.match(_edge(words[-1])):
            words.pop()
        out = " ".join(words)
    return _edge(out)


def hook_title(lyrics: str, max_words: int = 5) -> str:
    """The most repeated line of the chorus, else the most repeated line, else the chorus' or the first sung line;
    about five words, capitalised. Empty when there is no sung line."""
    lines: list[tuple[str, str, str]] = []  # text, key, section
    section = ""
    for raw in (lyrics or "").splitlines():
        line = raw.strip()
        if not line:
            continue
        if re.fullmatch(r"[\[(].*[\])]", line):
            section = _edge(line)
            continue
        text = _edge(_REPEAT.sub("", line))
        key = _squash(re.sub(r"[^\w\s]", "", text.lower()))
        if key:
            lines.append((text, key, section))
    if not lines:
        return ""
    count: dict[str, int] = {}
    for _, key, _ in lines:
        count[key] = count.get(key, 0) + 1

    def best(pool):
        top = None
        for item in pool:
            if count[item[1]] > (count[top[1]] if top else 1):
                top = item
        return top

    chorus = [x for x in lines if _CHORUS.search(x[2])]
    pick = best(chorus) or best(lines) or (chorus[0] if chorus else lines[0])
    title = _cut_words(pick[0], max_words)
    return title[:1].upper() + title[1:]
