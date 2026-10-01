"""Audio tags for downloaded tracks: ID3v2 for MP3, Vorbis comments for FLAC, RIFF INFO for WAV.

The stored file is never touched. A tagged copy is made on demand with ffmpeg (already a
dependency of the app), stream-copied, so it costs no re-encode. That also keeps the app free of
a tagging library: the usual one, mutagen, is GPL, while Remiqora is MIT.
"""
from __future__ import annotations

import asyncio
import os
import re
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Any, Mapping, Optional

from .config import MODELS
from .api.routes_yue2_upload import get_ffmpeg_bin

TITLE_MAX = 64

# Which kinds of track are AI output. "upload" is the user's own file and "editor" is a mix made
# in the app, so neither is labelled as AI-generated.
AI_MODELS = {"ace_step", "yue2"}

YUE2_LICENSE_NOTE = "YuE2-3B weights are CC BY-NC 4.0: non-commercial use, credit the model when sharing."


def short_title(title: str) -> str:
    """The track title is often the whole style prompt; a tag wants something a player can show."""
    text = " ".join((title or "").split())
    if len(text) <= TITLE_MAX:
        return text or "Untitled"
    cut = text[:TITLE_MAX].rsplit(" ", 1)[0].rstrip(",;:-")
    return (cut or text[:TITLE_MAX]) + "…"


# Genre names a player can sort by, with the spellings a style prompt tends to use for them
# (matched on whole words, case-insensitively, hyphens as spaces). Longer phrases win, so "deep
# house" is Deep House and not House, and "synth pop" is Synth-pop and not Pop.
GENRE_SYNONYMS: dict[str, tuple[str, ...]] = {
    "Trance": ("trance", "eurotrance", "euro trance", "goa", "uplifting trance", "progressive trance"),
    "Psytrance": ("psytrance", "psy trance", "psychedelic trance", "full on"),
    "Eurodance": ("eurodance", "euro dance", "euro house", "eurohouse"),
    "Techno": ("techno", "hard techno", "minimal techno", "acid techno"),
    "House": ("house", "progressive house", "electro house", "funky house", "french house", "disco house"),
    "Deep House": ("deep house",),
    "Tech House": ("tech house",),
    "Drum & Bass": ("drum and bass", "drum n bass", "dnb", "d&b", "liquid funk", "neurofunk"),
    "Jungle": ("jungle",),
    "Dubstep": ("dubstep", "brostep"),
    "Breakbeat": ("breakbeat", "breaks", "big beat"),
    "Hardstyle": ("hardstyle", "hard dance", "hardcore techno", "gabber", "happy hardcore"),
    "Synthwave": ("synthwave", "retrowave", "outrun", "darksynth"),
    "Vaporwave": ("vaporwave",),
    "Synth-pop": ("synth pop", "synthpop", "electropop", "electro pop"),
    "Electro": ("electro", "electro funk"),
    "Electronic": ("electronic", "electronica", "edm", "idm"),
    "Ambient": ("ambient", "drone", "dark ambient"),
    "Chillout": ("chillout", "chill out", "chillwave", "downtempo", "lounge"),
    "Trip Hop": ("trip hop", "triphop"),
    "Future Bass": ("future bass",),
    "Trap": ("trap",),
    "Lo-Fi Hip Hop": ("lofi hip hop", "lo fi hip hop", "lofi", "lo fi"),
    "Hip-Hop": ("hip hop", "hiphop", "rap", "boom bap", "drill"),
    "R&B": ("r&b", "rnb", "r and b", "contemporary r&b"),
    "Disco": ("disco", "nu disco", "italo disco", "eurodisco"),
    "Funk": ("funk", "g funk"),
    "Soul": ("soul", "neo soul", "motown"),
    "Garage": ("uk garage", "garage", "2 step"),
    "Dance": ("dance", "dance pop", "club"),
    "Pop": ("pop", "dream pop", "indie pop", "k pop", "j pop", "city pop", "art pop", "power pop"),
    "Indie": ("indie", "indie rock", "indie folk", "bedroom pop"),
    "Rock": ("rock", "hard rock", "classic rock", "soft rock", "garage rock", "progressive rock", "prog rock", "psychedelic rock", "rock and roll", "post rock"),
    "Alternative": ("alternative", "alt rock", "grunge", "shoegaze", "emo", "post punk"),
    "Punk": ("punk", "pop punk", "hardcore punk"),
    "Metal": ("metal", "heavy metal", "thrash metal", "death metal", "black metal", "power metal", "metalcore", "doom metal"),
    "Folk": ("folk", "acoustic folk", "celtic", "singer songwriter"),
    "Country": ("country", "bluegrass", "americana", "western"),
    "Blues": ("blues", "delta blues"),
    "Jazz": ("jazz", "smooth jazz", "swing", "bebop", "acid jazz", "jazz fusion"),
    "Reggae": ("reggae", "dub", "dancehall", "ska", "reggaeton"),
    "Latin": ("latin", "salsa", "bossa nova", "bachata", "cumbia", "tango", "flamenco"),
    "Classical": ("classical", "baroque", "chamber", "piano sonata", "symphony", "opera"),
    "Soundtrack": ("soundtrack", "cinematic", "orchestral", "film score", "epic orchestral", "game music"),
    "Chiptune": ("chiptune", "8 bit", "8bit", "bitpop", "video game music"),
    "Gospel": ("gospel", "worship"),
    "World": ("world music", "afrobeat", "afrobeats", "balkan", "klezmer"),
    "Children's Music": ("lullaby", "nursery rhyme", "children"),
}

# Words that are also everyday English ("a house on a hill", "dance floor", "country road"). They only
# count as a genre when a whole style tag is exactly that word, e.g. the tag "house".
AMBIGUOUS_PHRASES = {
    "house", "club", "dance", "country", "soul", "western", "drone", "breaks", "goa", "swing", "dub",
    "garage", "trap", "jungle", "lounge", "chamber", "opera", "rap", "children", "folk", "worship",
    "electro", "emo", "punk", "metal", "blues", "latin", "world",
}

_GENRE_PATTERNS: list[tuple[int, "re.Pattern[str]", str, str]] = sorted(
    (
        (len(phrase), re.compile(r"(?<![a-z0-9&])" + re.escape(phrase) + r"(?![a-z0-9&])"), genre, phrase)
        for genre, phrases in GENRE_SYNONYMS.items()
        for phrase in phrases
    ),
    key=lambda item: -item[0],
)


def _normalise(text: str) -> str:
    return " ".join(re.sub(r"[-_/]+", " ", str(text).lower()).split())


def _genre_in(text: str) -> Optional[str]:
    """The genre named by the longest matching phrase in `text`, or None."""
    norm = _normalise(text)
    for _, pattern, genre, phrase in _GENRE_PATTERNS:
        if phrase in AMBIGUOUS_PHRASES and norm != phrase:
            continue
        if pattern.search(norm):
            return genre
    return None


def guess_genre(params: Mapping[str, Any], title: str = "") -> Optional[str]:
    """A real genre for the tag, or None. An explicit `genre` param wins; otherwise the style tags
    are read left to right (the genre usually comes first) and the first one that names a genre
    decides; a prompt written as plain prose is searched as a whole as a last resort."""
    explicit = str(params.get("genre") or "").strip()
    if explicit:
        return _genre_in(explicit) or explicit[:40]
    for key in ("style", "prompt", "caption", "sample_query"):
        raw = str(params.get(key) or "")
        for tag in raw.split(","):
            found = _genre_in(tag)
            if found:
                return found
    for key in ("style", "prompt", "caption", "sample_query"):
        found = _genre_in(str(params.get(key) or ""))
        if found:
            return found
    return _genre_in(title)


def created_date(created_at: str) -> str:
    """The day the track was made as YYYY-MM-DD, in the computer's own time zone (the database keeps UTC,
    so a track made at 1 a.m. local time would otherwise carry yesterday's date). ffmpeg turns this into
    TYER + TDAT for MP3 (ID3v2.3) and keeps it whole for FLAC and WAV."""
    text = str(created_at or "")
    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00")).astimezone().date().isoformat()
    except ValueError:
        return text[:10] if re.match(r"\d{4}-\d{2}-\d{2}", text) else ""


def build_tags(row: Mapping[str, Any], params: Mapping[str, Any], artist: str, album: Optional[str] = None, track_no: Optional[int] = None) -> dict[str, str]:
    """ffmpeg -metadata keys for a track row. Empty values are left out."""
    model = row["model"]
    title = short_title(row["title"])
    tags: dict[str, str] = {
        "title": title,
        "artist": artist.strip(),
        "album": (album or title).strip(),
        "date": created_date(row["created_at"]),
        "encoded_by": "Remiqora",
    }
    if track_no:
        tags["track"] = str(track_no)
    genre = guess_genre(params, row["title"])
    if genre:
        tags["genre"] = genre
    bpm = params.get("bpm")
    if isinstance(bpm, (int, float)) and bpm > 0:
        tags["TBPM"] = str(int(round(bpm)))
    key = params.get("key_scale") or params.get("keyscale")
    if key:
        tags["TKEY"] = str(key)
    lyrics = (row["lyrics"] or "").strip()
    if lyrics:
        tags["lyrics"] = lyrics
    if model in AI_MODELS:
        label = MODELS[model].label if model in MODELS else model
        tags["AI_GENERATED"] = "true"
        tags["GENERATOR"] = label
        if row["seed"] is not None:
            tags["SEED"] = str(row["seed"])
        note = f"Generated with Remiqora ({label})."
        if model == "yue2":
            note += " " + YUE2_LICENSE_NOTE
        tags["comment"] = note
    elif model == "editor":
        tags["comment"] = "Mixed in the Remiqora editor."
    return {k: v for k, v in tags.items() if v}


def download_name(tags: Mapping[str, str], ext: str) -> str:
    base = f"{tags.get('artist', '')} - {tags.get('title', 'track')}".strip(" -")
    base = re.sub(r'[\\/:*?"<>|\r\n]+', "_", base)[:120].strip(" .") or "track"
    return f"{base}.{ext}"


async def write_tagged_copy(src: Path, tags: Mapping[str, str], cover: Optional[Path] = None) -> Optional[Path]:
    """A tagged copy of `src` in a temp file (the caller deletes it), or None when ffmpeg is missing
    or fails - the caller then serves the original."""
    ffmpeg_bin = get_ffmpeg_bin()
    if not ffmpeg_bin:
        return None
    ext = src.suffix.lower().lstrip(".")
    with_cover = cover is not None and cover.is_file() and ext in {"mp3", "flac"}
    cmd = [ffmpeg_bin, "-hide_banner", "-loglevel", "error", "-y", "-i", str(src)]
    if with_cover:
        cmd += ["-i", str(cover), "-map", "0:a", "-map", "1:v", "-disposition:v", "attached_pic",
                "-metadata:s:v", "title=Album cover", "-metadata:s:v", "comment=Cover (front)"]
    else:
        cmd += ["-map", "0:a"]
    cmd += ["-c", "copy", "-map_metadata", "-1"]
    if ext == "mp3":
        cmd += ["-id3v2_version", "3"]
    for key, value in tags.items():
        cmd += ["-metadata", f"{key}={value}"]
    fd, out = tempfile.mkstemp(suffix=f".{ext}")
    os.close(fd)
    cmd.append(out)
    proc = await asyncio.create_subprocess_exec(*cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
    _, _ = await proc.communicate()
    if proc.returncode != 0 or not Path(out).stat().st_size:
        try:
            os.unlink(out)
        except OSError:
            pass
        return None
    return Path(out)
