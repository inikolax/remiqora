"""Album covers for tracks: one square image per track, made locally by the cover engine (stable-diffusion.cpp's
sd-server with Z-Image-Turbo, MODELS["cover"]) through the generation queue (gen_queue.GenQueue._run_cover).

Files: DATA_DIR/files/covers/<track id>.png (1024x1024 as generated) and <track id>.thumb.jpg (256 px, made with
ffmpeg; without ffmpeg there is no thumbnail and the thumbnail URL serves the PNG). The track row's cover_path points
at the PNG. The whole feature is behind the app setting `covers_enabled` (unset: on when the cover engine is installed, see enabled()).
"""
from __future__ import annotations

import json
import logging
import os
import time
import re
import subprocess
from pathlib import Path
from typing import Any, Mapping, Optional

from . import db

log = logging.getLogger("covers")

SETTING_KEY = "covers_enabled"
SIZE = 1024
STEPS = 8
THUMB_SIZE = 256
PROMPT_MAX = 600

# Z-Image-Turbo renders text well and is distilled (cfg 1.0, negative prompts do nothing). Measured on the dev box
# (2026-11-18, same seeds): "Album cover art, <genres>, ... no text, no letters, no typography" lettered the genre
# names across the top on every image, a poster with "110 bpm" on another; the same style asked for as a photograph,
# a scene or a painting, with no mention of a cover and no "no text" clause, came out with no letters at all.
# So: ask for a picture, never for a cover, and never name text, even to forbid it. At 1024 px a long list of style
# tags still came back as a caption ("Electro tango, nu tango… 110pm"); without the pieces that describe the sound
# rather than a picture (tempo, the lyrics' language, vocals, mixing) nine of nine 1024 px tries had no letters.
PROMPT_HEAD = "Cinematic film still, shallow depth of field. The scene feels like this music:"
# style pieces that say nothing a picture can show, and that the model would letter as a caption
_NOT_VISUAL = re.compile(
    r"\b(?:\d+\s*bpm|bpm|tempo|vocals?|voice|singer|sung|singing|rap|rapper|verses?|chorus|hook|lyrics|diction|"
    r"mix(?:ed|ing)?|master(?:ed|ing)?|production|produced|radio|kick|four on the floor|"
    r"english|russian|ukrainian|kazakh|spanish|german|french|italian|japanese|korean|chinese|arabic|hindi|portuguese|"
    r"polish|turkish|vietnamese|indonesian|hebrew|persian|instrumental)\b", re.I)
_MAX_PIECES = 10
_MAX_PIECE_WORDS = 7
_ARTICLE = re.compile(r"^(?:a|an|the)\s+", re.I)
_SONG_WORDS = re.compile(r"\b(?:track|song)\b", re.I)
# a long piece is tried in its parts: "dreamy lo-fi hip hop with dusty drums" -> "dreamy lo-fi hip hop", "dusty drums"
_JOINERS = re.compile(r"\s+(?:and|with|over|featuring|built on|driven by)\s+", re.I)
# what an assistant or a user may still write: removed from given descriptions
_COVER_WORDS = re.compile(r"\b(?:album|record|vinyl|cd|single)\s+(?:cover|sleeve|art(?:work)?)(?:\s+art(?:work)?)?\b", re.I)
_NO_TEXT_WORDS = re.compile(r"(?:,\s*)?\b(?:no|without)\s+(?:any\s+)?(?:text|letters?|words?|typography|lettering|title|captions?|logos?|watermarks?)\b", re.I)


def enabled() -> bool:
    """Covers are on when switched on in the settings; before anyone has touched the switch, they are on exactly when
    the cover engine is installed (the installer's "Album covers" or the setup scripts), so picking covers at install
    is enough. A switch turned off stays off."""
    value = db.get_setting(SETTING_KEY, "")
    if value:
        return value == "true"
    from . import features

    return features.has_cover()


def set_enabled(on: bool) -> None:
    db.set_setting(SETTING_KEY, "true" if on else "false")


def auto_available() -> bool:
    """Whether a generation can ask for a cover after it (make_cover): covers are on and the cover engine is installed."""
    from . import features

    return enabled() and features.has_cover()


# ---------------------------------------------------------------- files

def covers_dir() -> Path:
    return db.FILES_DIR / "covers"


def cover_file(track_id: int) -> Path:
    return covers_dir() / f"{track_id}.png"


def thumb_file(track_id: int) -> Path:
    return covers_dir() / f"{track_id}.thumb.jpg"


def cover_path(row: Mapping[str, Any]) -> Optional[Path]:
    """The track's cover PNG when it has one on disk."""
    raw = row["cover_path"] if "cover_path" in row.keys() else None
    if not raw:
        return None
    p = Path(raw)
    return p if p.is_file() else None


def captioned_file(track_id: int) -> Path:
    """The cover with the caption baked in by the browser (1024 px JPEG), next to the clean one."""
    return covers_dir() / f"{track_id}_captioned.jpg"


def captioned_path(row: Mapping[str, Any]) -> Optional[Path]:
    """The baked captioned cover when it exists and is not older than the clean cover (a newer clean cover makes
    it stale), else None."""
    clean = cover_path(row)
    if clean is None:
        return None
    p = captioned_file(row["id"])
    try:
        if p.is_file() and p.stat().st_mtime_ns >= clean.stat().st_mtime_ns:
            return p
    except OSError:
        pass
    return None


def captioned_url(row: Mapping[str, Any]) -> Optional[str]:
    """/api/tracks/<id>/cover/captioned?v=<mtime>, None when covers are off or there is no fresh baked file."""
    if not enabled():
        return None
    p = captioned_path(row)
    if p is None:
        return None
    try:
        v = p.stat().st_mtime_ns // 1_000_000
    except OSError:
        return None
    return f"/api/tracks/{row['id']}/cover/captioned?v={v}"


def jpeg_size(data: bytes) -> Optional[tuple[int, int]]:
    """(width, height) read from a JPEG's SOFn header, None when the bytes are not a JPEG with one (no Pillow needed)."""
    if data[:3] != b"\xff\xd8\xff":
        return None
    i, n = 2, len(data)
    while i + 4 <= n:
        if data[i] != 0xFF:
            return None
        m = data[i + 1]
        if m == 0xFF:
            i += 1
            continue
        if m in (0x01, 0xD8) or 0xD0 <= m <= 0xD7:
            i += 2
            continue
        if m == 0xD9 or m == 0xDA:
            return None
        seglen = int.from_bytes(data[i + 2:i + 4], "big")
        if seglen < 2:
            return None
        if 0xC0 <= m <= 0xCF and m not in (0xC4, 0xC8, 0xCC):
            if i + 9 > n:
                return None
            h = int.from_bytes(data[i + 5:i + 7], "big")
            w = int.from_bytes(data[i + 7:i + 9], "big")
            return (w, h) if w and h else None
        i += 2 + seglen
    return None


def caption_of(row: Mapping[str, Any]) -> Optional[dict]:
    raw = row["cover_caption"] if "cover_caption" in row.keys() else None
    if not raw:
        return None
    try:
        val = json.loads(raw)
    except ValueError:
        return None
    return val if isinstance(val, dict) else None


def cover_version(row: Mapping[str, Any]) -> Optional[str]:
    """The `v` of cover_url (the cover file's mtime in ms, as a string); None without a cover."""
    p = cover_path(row)
    if p is None:
        return None
    try:
        return str(p.stat().st_mtime_ns // 1_000_000)
    except OSError:
        return None


def cover_url(row: Mapping[str, Any]) -> Optional[str]:
    """/api/tracks/<id>/cover?v=<mtime>: the version changes when the cover is made again, so a cached image is not
    shown for the new one. Add &size=thumb for the 256 px thumbnail."""
    v = cover_version(row)
    if v is None:
        return None
    return f"/api/tracks/{row['id']}/cover?v={v}"


def _ffmpeg() -> Optional[str]:
    from .api.routes_yue2_upload import get_ffmpeg_bin

    return get_ffmpeg_bin()


def make_thumb(src: Path, dst: Path) -> bool:
    """A THUMB_SIZE JPEG of the cover with ffmpeg; False when ffmpeg is missing or fails (no thumbnail then)."""
    ffmpeg = _ffmpeg()
    if not ffmpeg:
        return False
    tmp = dst.with_name(dst.name + ".tmp.jpg")
    try:
        r = subprocess.run(
            [ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(src),
             "-vf", f"scale={THUMB_SIZE}:{THUMB_SIZE}:flags=lanczos", "-q:v", "3", "-frames:v", "1", str(tmp)],
            stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, timeout=60,
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
        )
        if r.returncode != 0 or not tmp.is_file() or tmp.stat().st_size == 0:
            log.warning("cover thumbnail failed: %s", r.stderr.decode("utf-8", "replace").strip()[-300:])
            tmp.unlink(missing_ok=True)
            return False
        os.replace(tmp, dst)
        return True
    except (OSError, subprocess.SubprocessError) as exc:
        log.warning("cover thumbnail failed: %s", exc)
        tmp.unlink(missing_ok=True)
        return False


REPLACE_TRIES = 5
REPLACE_WAIT_S = 0.2


def _retry(op) -> None:
    """Runs a file operation that Windows can refuse for a moment (the browser or an antivirus scanner has the old
    file open: PermissionError / sharing violation): REPLACE_TRIES attempts, REPLACE_WAIT_S apart."""
    for attempt in range(REPLACE_TRIES):
        try:
            op()
            return
        except PermissionError:
            if attempt == REPLACE_TRIES - 1:
                raise
        except OSError as exc:
            # ERROR_SHARING_VIOLATION (32) / ERROR_LOCK_VIOLATION (33) are retried; anything else is final
            if getattr(exc, "winerror", None) not in (32, 33) or attempt == REPLACE_TRIES - 1:
                raise
        time.sleep(REPLACE_WAIT_S)


def replace_file(tmp: Path, dst: Path) -> None:
    """os.replace(tmp, dst), retried while dst is locked; on failure tmp is removed and an OSError with a readable
    message is raised."""
    try:
        _retry(lambda: os.replace(tmp, dst))
    except OSError as exc:
        try:
            tmp.unlink(missing_ok=True)
        except OSError:
            pass
        raise OSError(f"could not replace {dst.name}: the file is in use by another program ({exc.strerror or exc})") from exc


def unlink_file(path: Path) -> None:
    """path.unlink(missing_ok=True), retried while the file is locked; raises a readable OSError when it stays."""
    try:
        _retry(lambda: path.unlink(missing_ok=True))
    except OSError as exc:
        raise OSError(f"could not remove {path.name}: the file is in use by another program ({exc.strerror or exc})") from exc


def save_cover(track_id: int, png: bytes) -> bool:
    """Writes the PNG (replacing an earlier cover), its thumbnail, and the row's cover_path. False when the track no
    longer exists (deleted while its cover was being made): nothing is left on disk then. Blocking."""
    if not png.startswith(b"\x89PNG"):
        raise ValueError("the cover is not a PNG image")
    d = covers_dir()
    d.mkdir(parents=True, exist_ok=True)
    path, thumb = cover_file(track_id), thumb_file(track_id)
    tmp = path.with_name(path.name + ".tmp")
    try:
        tmp.write_bytes(png)
    except OSError:
        tmp.unlink(missing_ok=True)
        raise
    replace_file(tmp, path)
    unlink_file(thumb)
    unlink_file(captioned_file(track_id))  # baked again for the new picture
    make_thumb(path, thumb)
    if not db.set_track_cover(track_id, path):
        remove_files(track_id)
        return False
    return True


def remove_files(track_id: int) -> None:
    for p in (cover_file(track_id), thumb_file(track_id), captioned_file(track_id)):
        try:
            p.unlink(missing_ok=True)
        except OSError:
            pass


def remove_cover(track_id: int) -> bool:
    """Drops the track's cover (files and cover_path). False when the track does not exist."""
    if not db.set_track_cover(track_id, None):
        return False
    remove_files(track_id)
    return True


# ---------------------------------------------------------------- prompt

# "TrackType: Music, VocalType: Instrumental, ..." (Stable Audio 3's auto tags) and similar service fields.
# A "Field: value" piece: a field ending in "Type" or naming tempo/key/length is dropped, any other keeps its value
# ("Mood: dark" -> "dark").
_FIELD = re.compile(r"^\s*([A-Za-z][A-Za-z _-]{0,30}?)\s*:\s*(.*)$")
_SERVICE_FIELDS = {"requested", "bpm", "tempo", "key", "keyscale", "key scale", "scale", "duration", "length", "time signature", "timesignature", "seed"}
_BRACKETS = re.compile(r"\[[^\]]*\]|<[^>]*>|\{[^}]*\}")
_SPACES = re.compile(r"\s+")
_STYLE_KEYS = ("style", "caption", "prompt", "sample_query", "tags")


def clean_style(text: str) -> str:
    """Style text without service tags ("TrackType: Music"), bracketed markup, quotes and repeated pieces."""
    text = _BRACKETS.sub(" ", str(text or "")).replace("\n", ", ").replace('"', "").replace("“", "").replace("”", "")
    parts: list[str] = []
    seen: set[str] = set()
    for piece in re.split(r"[,;|]", text):
        piece = _SPACES.sub(" ", piece).strip(" .-")
        m = _FIELD.match(piece)
        if m:
            name = m.group(1).strip().lower()
            if name.endswith("type") or name in _SERVICE_FIELDS:
                continue
            piece = m.group(2).strip(" .-")
        if not piece:
            continue
        key = piece.lower()
        if key not in seen:
            seen.add(key)
            parts.append(piece)
    return ", ".join(parts)


def _non_latin(text: str) -> bool:
    """A letter beyond a-z (Cyrillic, CJK, accents)."""
    return any(ch.isalpha() and not ("a" <= ch.lower() <= "z") for ch in text)


def _clip(text: str, limit: int) -> str:
    if len(text) <= limit:
        return text
    cut = text[:limit]
    return cut[: cut.rfind(",")] if "," in cut else cut


def build_prompt(row: Mapping[str, Any], params: Optional[Mapping[str, Any]] = None, text: Optional[str] = None) -> str:
    """The image prompt for a track, without a language model: the given text (with any "album cover" and "no text"
    wording taken out, see PROMPT_HEAD), or PROMPT_HEAD + the visual pieces of <style>, <mood> from the track's
    params. The title is never used: Z-Image would letter it onto the picture."""
    body = ""
    if text and text.strip():
        body = _NO_TEXT_WORDS.sub("", _COVER_WORDS.sub("artwork", text))
        body = _SPACES.sub(" ", body).strip().strip(",. ")
    if not body:
        p = params or {}

        def visual(raw: Any) -> list[str]:
            # Z-Image letters words it can't read as a scene, and any non-Latin text (a Russian idea) comes out as a
            # caption: only Latin pieces that describe something visible
            if not isinstance(raw, str):
                return []
            # Short pieces only: a style written as sentences (ACE-Step's own caption, "A chill, groovy hip-hop
            # track built on a steady drum machine beat and...") got lettered onto 2 of 5 test covers, the same
            # style as short pieces onto none. So sentences are split, "a"/"the" and "track"/"song" dropped, and a
            # piece longer than _MAX_PIECE_WORDS words is left out.
            def tidy(piece: str) -> str:
                piece = _SONG_WORDS.sub(" ", _ARTICLE.sub("", piece.strip()))
                return _SPACES.sub(" ", piece).strip(" .-")

            out = []
            for piece in re.split(r"[,]|\.\s+|\.$", clean_style(raw)):
                piece = tidy(piece)
                parts = [piece] if len(piece.split()) <= _MAX_PIECE_WORDS else [tidy(x) for x in _JOINERS.split(piece)]
                out += [x for x in parts if x and len(x.split()) <= _MAX_PIECE_WORDS and not _NOT_VISUAL.search(x)
                        and not _non_latin(x)]
            return out

        style = next((v for k in _STYLE_KEYS if (v := visual(p.get(k)))), [])
        body = ", ".join((style + visual(p.get("mood")))[:_MAX_PIECES])
        body = f"{PROMPT_HEAD} {body}" if body else "A moody, atmospheric cinematic photograph, soft light, rich colour"
    return _clip(body, PROMPT_MAX)
