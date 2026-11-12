"""What the assistant can write, one function per task, each returning the fields the engine takes.

- sa3: tags for Stable Audio 3 in its own style, with its own instructions (sa3_prompts.py): a classifier picks
  music / instrument / one-shot / sound unless the caller says which, the reply is checked for the artifacts
  Stable Audio's own reprompt rejects, and the closing "BPM: N. Length: N seconds" is read into bpm and duration.
- yue2-song: YuE2's style tags and lyrics with section labels.
- ace-song / ace-instrumental: ACE-Step's caption, lyrics, BPM, key and length, for when its own language model
  (/v1/create_sample) is not running.
- ace-part: the description of one part (or of a section) for the editor's AI arranger, from words in any language.
Replies in JSON are parsed leniently (a small model sometimes leaves a string or a brace open) and asked again once.
"""
from __future__ import annotations

import json
import re
from typing import Any, Callable

from .sa3_prompts import SYSTEM_PROMPTS, TRACK_TYPE_PREFIXES

Generate = Callable[[str, str, int, float, "int | None"], "tuple[str, int]"]

# Every vocal language the app offers (frontend/src/utils/vocalLanguages.ts); a code missing here is ignored.
LANGUAGES = {
    "en": "English", "ru": "Russian", "zh": "Chinese", "ja": "Japanese", "ko": "Korean", "es": "Spanish",
    "fr": "French", "de": "German", "it": "Italian", "pt": "Portuguese", "nl": "Dutch", "pl": "Polish",
    "uk": "Ukrainian", "cs": "Czech", "sk": "Slovak", "ro": "Romanian", "hu": "Hungarian", "bg": "Bulgarian",
    "sr": "Serbian", "hr": "Croatian", "sv": "Swedish", "no": "Norwegian", "da": "Danish", "fi": "Finnish",
    "is": "Icelandic", "el": "Greek", "tr": "Turkish", "he": "Hebrew", "ar": "Arabic", "fa": "Persian",
    "ur": "Urdu", "hi": "Hindi", "bn": "Bengali", "pa": "Punjabi", "ta": "Tamil", "te": "Telugu",
    "ne": "Nepali", "sa": "Sanskrit", "th": "Thai", "vi": "Vietnamese", "id": "Indonesian", "ms": "Malay",
    "tl": "Tagalog", "sw": "Swahili", "az": "Azerbaijani", "lt": "Lithuanian", "ca": "Catalan",
    "ht": "Haitian Creole", "la": "Latin", "yue": "Cantonese", "kk": "Kazakh",
}


class TaskError(Exception):
    pass


def language_name(code: str | None, idea: str) -> str:
    if code and code in LANGUAGES:
        return LANGUAGES[code]
    # The model answers in English when told "the language of the idea": say it outright.
    return "Russian" if re.search(r"[а-яё]", idea, re.IGNORECASE) else "English"


def clean_lyrics(text: str) -> str:
    """A small model sometimes escapes its line breaks twice: they arrive as a backslash and an n."""
    text = text.replace("\\r\\n", "\n").replace("\\n", "\n").replace("\r\n", "\n")
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def parse_json(reply: str) -> dict[str, Any]:
    """The first JSON object in the reply; an unterminated string or object is closed before giving up."""
    start = reply.find("{")
    if start < 0:
        raise TaskError("no JSON in the reply")
    body = reply[start:]
    end = body.rfind("}")
    candidates = [body[: end + 1]] if end >= 0 else []
    # a reply cut short: close the string if a quote is open, then the object
    repaired = body.rstrip().rstrip(",")
    if repaired.count('"') % 2 == 1:
        repaired += '"'
    repaired += "}" * max(1, repaired.count("{") - repaired.count("}"))
    candidates.append(repaired)
    for text in candidates:
        try:
            data = json.loads(text)
            if isinstance(data, dict):
                return data
        except ValueError:
            continue
    raise TaskError("the reply is not valid JSON")


# ---------------------------------------------------------------- Stable Audio 3

SA3_KINDS = {"music": "Music", "instrument": "Instrument", "one_shot": "One-shot", "sfx": "SFX"}
_ARTIFACT_RE = re.compile(r"[\[\]*#]")
_VOCAL_RE = re.compile(r"\b(vocals?|singing|singer|female|male|voice|voices|chorus|rap|rapper|chant(ing)?|lyrics?)\b", re.I)
_LENGTH_RE = re.compile(r"\.?\s*Length:\s*(\d+)\s*seconds\.?\s*$", re.I)
_BPM_RE = re.compile(r"\bBPM:\s*(\d+(?:\.\d+)?)", re.I)


def _sa3_has_artifacts(text: str) -> bool:
    # Stable Audio's own reprompt rejects these: markup, vocals (it makes instrumentals), no length, too long.
    return bool(_ARTIFACT_RE.search(text)) or bool(_VOCAL_RE.search(text)) or not _LENGTH_RE.search(text) or len(text.split()) > 45


def _sa3_classify(generate: Generate, idea: str) -> str:
    label, _ = generate(SYSTEM_PROMPTS["Classifier"], f"Input: {idea}\nOutput: ", 16, 0.1, None)
    label = label.strip().lower()
    if "music_genre" in label:
        return "music"
    if "one_shot" in label:
        return "one_shot"
    if "instrument" in label:
        return "instrument"
    return "sfx"


def sa3(generate: Generate, idea: str, kind: str | None = None, seed: int | None = None) -> dict[str, Any]:
    category = kind if kind in SA3_KINDS else _sa3_classify(generate, idea)
    reply = ""
    for attempt in range(3):
        reply, _ = generate(SYSTEM_PROMPTS[SA3_KINDS[category]], f"Input: {idea}\nOutput: ", 128, 1.11,
                            None if seed is None else seed + attempt)
        if not _sa3_has_artifacts(reply):
            break
    text = reply.strip()
    if text.startswith("- "):
        text = text[2:]
    text = text[:1].upper() + text[1:] if text else text
    bpm = _BPM_RE.search(text)
    length = _LENGTH_RE.search(text)
    prefix = TRACK_TYPE_PREFIXES.get("instrument" if category == "one_shot" else category, "")
    return {
        "category": category,
        "prompt": prefix + text,
        "bpm": float(bpm.group(1)) if bpm else None,
        "duration": int(length.group(1)) if length else None,
    }


# ---------------------------------------------------------------- YuE2

YUE2_SONG = """You write songs for YuE2, a model that sings full songs. Answer with one JSON object and nothing else:
{"style": "<5 to 9 comma separated tags in English>",
 "lyrics": "<the song in {lang}>"}
The style tags, in this order: genre, mood, vocal (female vocal / male vocal / duet / rap verses), one or two vocal
techniques if they fit (breathy vocal, belting, whisper vocal), main instruments, era or production (80s, lo-fi,
modern hi-fi mix), tempo (like 92 bpm or slow ballad tempo). Short tags, no sentences, no tags that contradict each other.
Example: "acoustic folk ballad, nostalgic, male vocal, breathy vocal, fingerpicked guitar, minimalist, slow tempo"
The lyrics: each section starts with its label on its own line: [Verse], [Chorus], [Verse], [Chorus], [Bridge],
[Chorus], [Outro]. Four to six short, singable lines per section that rhyme; the chorus repeats word for word.
The lyrics must be in {lang}; only the tags are in English."""


def yue2_song(generate: Generate, idea: str, language: str | None = None, seed: int | None = None) -> dict[str, Any]:
    lang = language_name(language, idea)
    last: Exception | None = None
    for attempt in range(3):
        reply, _ = generate(YUE2_SONG.replace("{lang}", lang), idea, 900, 0.8, None if seed is None else seed + attempt)
        try:
            data = parse_json(reply)
            style, lyrics = str(data.get("style", "")).strip(), clean_lyrics(str(data.get("lyrics", "")))
            if style and "[" in lyrics:
                return {"style": style, "lyrics": lyrics, "language": lang}
            last = TaskError("the reply has no style or no sectioned lyrics")
        except TaskError as exc:
            last = exc
    raise TaskError(str(last))


# ---------------------------------------------------------------- ACE-Step (when its own LM is not running)

ACE = """You write prompts for ACE-Step, a music generation model. Answer with one JSON object and nothing else:
{"caption": "<genre, mood, instruments, production, vocal type; one comma separated line in English>",
 "lyrics": "<{lyrics_rule}>",
 "bpm": <integer 60-180>, "keyscale": "<like A minor>", "duration": <seconds, 60-240>}"""
ACE_SONG_LYRICS = "the song in {lang} with section labels on their own lines: [Verse], [Chorus], [Bridge], [Outro]; short rhyming lines"
ACE_INSTRUMENTAL_LYRICS = "[Instrumental]"
ACE_INSTRUMENTAL_NOTE = "\nThis is an instrumental: the caption names no voice or vocals and ends with \"instrumental\"."
# without it a small model writes the caption in the language of the lyrics too
ACE_SONG_NOTE = "\nThe lyrics must be in {lang}; only the caption is in English."


def ace(generate: Generate, idea: str, instrumental: bool, language: str | None = None, seed: int | None = None) -> dict[str, Any]:
    lang = language_name(language, idea)
    rule = ACE_INSTRUMENTAL_LYRICS if instrumental else ACE_SONG_LYRICS.replace("{lang}", lang)
    last: Exception | None = None
    for attempt in range(3):
        system = ACE.replace("{lyrics_rule}", rule) + (
            ACE_INSTRUMENTAL_NOTE if instrumental else ACE_SONG_NOTE.replace("{lang}", lang))
        reply, _ = generate(system, idea, 120 if instrumental else 900, 0.8,
                            None if seed is None else seed + attempt)
        try:
            data = parse_json(reply)
            caption = str(data.get("caption", "")).strip()
            if not caption:
                raise TaskError("the reply has no caption")
            if attempt == 0 and not _latin(caption):
                last = TaskError("the caption is not in English")
                continue
            return {
                "caption": caption,
                "lyrics": "[Instrumental]" if instrumental else clean_lyrics(str(data.get("lyrics", ""))),
                "bpm": _int(data.get("bpm")),
                "keyscale": str(data.get("keyscale") or "").strip() or None,
                "duration": _int(data.get("duration")),
                "language": None if instrumental else lang,
            }
        except TaskError as exc:
            last = exc
    raise TaskError(str(last))


# ---------------------------------------------------------------- ACE-Step: one part for the AI arranger

# The part classes of ACE-Step's lego task (acestep/constants.py TRACK_NAMES), as the model is told about them.
ACE_PART_TRACKS = {
    "drums": "drums", "bass": "bass", "guitar": "guitar", "keyboard": "keyboard (piano, electric piano, organ)",
    "synth": "synthesizer", "strings": "strings", "brass": "brass", "woodwinds": "woodwinds",
    "percussion": "percussion", "fx": "sound effects and textures", "vocals": "lead vocals",
    "backing_vocals": "backing vocals",
}
ACE_PART = """You write the description of ONE instrument part for ACE-Step, a music model that adds a part to a track.
The user describes the part in any language. Answer with one line in English and nothing else: 3 to 5 short comma
separated phrases, at most 20 words, that say how this part plays and sounds: pattern and playing style, tone,
genre feel.
The part is: {track}. Start with the instrument and what it plays. Describe only this part: no other instruments,
no tempo or key, no artist or song names, no sentences, no quotes. Keep to what the user asked for: add detail
about playing and tone, but no genre or mood the user did not name.
Input: тёплый катящийся бас как в дип-хаусе
Output: warm rolling deep house bassline, round sub bass, groovy syncopated pattern
Input: cuerdas suaves que crecen lentamente
Output: soft legato string section, slow swells, cinematic and warm
Input: прямая бочка с хэтами
Output: four-on-the-floor drums, punchy kick, crisp offbeat hi-hats, clap on two and four"""
ACE_SECTION = """You write the description of a piece of music for ACE-Step, a music generation model.
The user describes it in any language. Answer with one line in English and nothing else: 4 to 7 short comma
separated phrases, at most 28 words: genre, mood, main instruments, production. No tempo or key, no artist or
song names, no sentences, no quotes.
Input: мелодичный дип-хаус с родесом и тёплым басом
Output: melodic deep house, warm Rhodes chords, rolling bassline, soft four-on-the-floor drums, late-night mood
Input: rock épico con guitarras pesadas
Output: epic rock, heavy distorted guitars, driving drums, powerful bass, anthemic and intense"""


def ace_part(generate: Generate, idea: str, kind: str | None = None, seed: int | None = None) -> dict[str, Any]:
    """`kind` is a part class of ACE_PART_TRACKS; anything else asks for a description of the whole section."""
    part = kind in ACE_PART_TRACKS
    system = ACE_PART.replace("{track}", ACE_PART_TRACKS[kind]) if part else ACE_SECTION
    limit = 24 if part else 32
    last = "the reply is empty"
    for attempt in range(3):
        reply, _ = generate(system, f"Input: {idea}\nOutput: ", 64, 0.6, None if seed is None else seed + attempt)
        text = reply.strip().splitlines()[0].strip() if reply.strip() else ""
        text = re.sub(r"^(output|answer)\s*:\s*", "", text, flags=re.I).strip(" \"'`.-")
        if not text:
            continue
        if not _latin(text):
            last = "the description is not in English"
        elif len(text.split()) > limit:
            last = "the description is too long"
        else:
            return {"caption": text}
    raise TaskError(last)


def _latin(text: str) -> bool:
    """No letters beyond plain a-z: a caption the model wrote in the lyrics' language has some (gitár, гитара)."""
    return not re.search(r"[^\W\d_a-zA-Z]", text)


def _int(v: Any) -> int | None:
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return None


TASKS = ("sa3", "yue2-song", "ace-song", "ace-instrumental", "ace-part")


def run(task: str, generate: Generate, idea: str, *, language: str | None = None, kind: str | None = None,
        seed: int | None = None) -> dict[str, Any]:
    idea = idea.strip()
    if not idea:
        raise TaskError("the idea is empty")
    if task == "sa3":
        return sa3(generate, idea, kind, seed)
    if task == "yue2-song":
        return yue2_song(generate, idea, language, seed)
    if task in ("ace-song", "ace-instrumental"):
        return ace(generate, idea, task == "ace-instrumental", language, seed)
    if task == "ace-part":
        return ace_part(generate, idea, kind, seed)
    raise TaskError(f"unknown task '{task}', one of {TASKS}")
