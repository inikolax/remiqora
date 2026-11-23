"""What the assistant can write, one function per task, each returning the fields the engine takes.

- sa3: tags for Stable Audio 3 in its own style, with its own instructions (sa3_prompts.py): a classifier picks
  music / instrument / one-shot / sound unless the caller says which, the reply is checked for the artifacts
  Stable Audio's own reprompt rejects, and the closing "BPM: N. Length: N seconds" is read into bpm and duration.
- yue2-song: YuE2's style tags and lyrics with section labels.
- ace-song / ace-instrumental: ACE-Step's caption, lyrics, BPM, key and length, for when its own language model
  (/v1/create_sample) is not running.
- ace-part: the description of one part (or of a section) for the editor's AI arranger, from words in any language.
- translate: a description of music or a sound, into English and nothing else (Stable Audio 3 reads only English).
- title: a track's name (one to five words, in the lyrics' or the UI's language) and an English album-cover scene, from
  a "Lyrics: / Style: / Idea:" text and an optional last "Avoid: A | B" line (names not to give again).
- cover: the picture for a track's album cover as an English visual scene for the image model (Z-Image-Turbo), from a
  "Lyrics: / Style: / Idea: / Title:" text and an optional "Wish:" (the user's own description, in any language).
Replies in JSON are parsed leniently (a small model sometimes leaves a string or a brace open) and asked again once.
"""
from __future__ import annotations

import json
import re
import unicodedata
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
# Stable Audio reads English: a word of another script (a small model slips one in, like "joint摩擦") is an artifact
_FOREIGN_RE = re.compile(r"[^\x00-\x7FÀ-ɏ‐-‧]+")


def _sa3_has_artifacts(text: str) -> bool:
    # Stable Audio's own reprompt rejects these: markup, vocals (it makes instrumentals), no length, too long.
    return bool(_ARTIFACT_RE.search(text)) or bool(_VOCAL_RE.search(text)) or not _LENGTH_RE.search(text) or len(text.split()) > 45 \
        or bool(_FOREIGN_RE.search(text))


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
    # three tries still with a foreign word: drop it rather than send it to Stable Audio
    text = re.sub(r"[ \t]{2,}", " ", _FOREIGN_RE.sub(" ", reply)).strip()
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


# ---------------------------------------------------------------- translation to English

TRANSLATE = """You translate text into English. The text describes music or a sound for a text-to-audio model.
Translate it faithfully: no additions, no explanations, no comments, no quotes. Keep numbers, BPM, durations and
units as they are. Keep genre, instrument and artist names in their usual English form. Keep the line breaks.
Answer with the English text and nothing else.
Input: энергичный дип-хаус, тёплый бас, 122 BPM
Output: energetic deep house, warm bass, 122 BPM
Input: un portazo fuerte en un pasillo de piedra, con mucha reverberación
Output: a loud door slam in a stone hallway, with a lot of reverb"""
# the service tag Stable Audio's prompts open with ("TrackType: Music, VocalType: Instrumental, "), kept as written
_TAG_RE = re.compile(r"^\s*(?:(?:TrackType|VocalType|Genre|Mood|Instrument|Tempo)\s*:[^,.\n]*[,.]\s*)+", re.I)


def _clean_translation(reply: str) -> str:
    text = reply.strip()
    text = re.sub(r"^(output|translation|english|answer)\s*:\s*", "", text, flags=re.I).strip()
    if len(text) > 1 and text[0] in "\"'`“«" and text[-1] in "\"'`”»":
        text = text[1:-1].strip()
    return text


def translate(generate: Generate, text: str, seed: int | None = None) -> dict[str, Any]:
    tag_match = _TAG_RE.match(text)
    tag = tag_match.group(0) if tag_match else ""
    body = text[len(tag):].strip()
    if _latin(body):
        return {"text": text}
    tokens = min(400, max(48, len(body.split()) * 3))
    result = ""
    for attempt in range(2):
        reply, _ = generate(TRANSLATE, f"Input: {body}\nOutput: ", tokens, 0.2, None if seed is None else seed + attempt)
        result = _clean_translation(reply)
        if result and _latin(result):
            break
    if not result:
        raise TaskError("the translation is empty")
    return {"text": tag + result}


# ---------------------------------------------------------------- a title and a cover for a finished track

TITLE = """You name music tracks like a streaming service does and describe a picture for each. The input has up to three
blocks: "Lyrics:", "Style:" and "Idea:"; any of them may be missing. Answer with one JSON object and nothing else:
{"title": "<the track's name: one to five words, in {lang}>",
 "cover": "<a picture for the track as a visual scene in English: 20 to 40 words, subject, setting, light, colours, mood, art style>"}
The title is a catchy name, not a description: for a song take its hook, its central image or feeling (not the genre, not
the instruments); for an instrumental or a sound take the mood or the picture it paints. No quotes, no brackets, no
trailing punctuation, no "Untitled", no genre as the whole title.
The cover describes only what is seen: never the words "album", "cover", "poster", "title", "text", "letters" or the
genre and instrument names as words (the image model would letter them onto the picture), not even to forbid them; no
signs, books or screens; no people's faces unless the song is about a person.
Input: Lyrics: [Chorus]
We are the fire in the dark tonight
Style: anthemic rock, male vocals
Output: {"title": "Fire in the Dark", "cover": "A single bonfire burning on a black cliff above a stormy sea, sparks rising into a night sky full of stars, deep orange glow against indigo clouds, dramatic wide angle, painterly cinematic illustration"}"""
_TITLE_BAD = {"untitled", "instrumental", "music", "song", "track", "new song", "unnamed"}
_BLOCK_RE = re.compile(r"^(Lyrics|Style|Idea)\s*:", re.I | re.M)
_SCRIPTS = (
    (r"[぀-ヿ]", "Japanese"), (r"[가-힯]", "Korean"), (r"[一-鿿]", "Chinese"),
    (r"[؀-ۿ]", "Arabic"), (r"[֐-׿]", "Hebrew"), (r"[Ͱ-Ͽ]", "Greek"),
    (r"[฀-๿]", "Thai"), (r"[ऀ-ॿ]", "Hindi"),
)


def _block(text: str, name: str) -> str:
    """The text of one "Name:" block of a title request, up to the next block."""
    marks = [(m.start(), m.end(), m.group(1).lower()) for m in _BLOCK_RE.finditer(text)]
    for i, (_, end, label) in enumerate(marks):
        if label == name.lower():
            return text[end:marks[i + 1][0] if i + 1 < len(marks) else len(text)].strip()
    return ""


def _title_language(code: str | None, lyrics: str) -> str:
    """The title's language: the one asked for, else the lyrics' (by script; a Latin script is left to the model)."""
    if code and code in LANGUAGES:
        return LANGUAGES[code]
    if re.search(r"[іїєґ]", lyrics, re.I):
        return "Ukrainian"
    if re.search(r"[әғқңөұүһ]", lyrics, re.I):
        return "Kazakh"
    if re.search(r"[а-яё]", lyrics, re.I):
        return "Russian"
    for pattern, name in _SCRIPTS:
        if re.search(pattern, lyrics):
            return name
    return "the language of the lyrics" if lyrics.strip() else "English"


def _clean_title(raw: Any, style: str) -> str | None:
    title = re.sub(r"[\"'`“”«»‘’()\[\]{}<>]", "", str(raw or ""))
    title = re.sub(r"\s+", " ", title).strip().rstrip(".,;:!?…-–— ").lstrip("-–— ")
    if not title or len(title) > 60 or len(title.split()) > 6 or title.lower() in _TITLE_BAD:
        return None
    # the genre alone is no name: the title equals the style or one of its tags
    tags = {t.strip().lower() for t in re.split(r"[,;\n]", style) if t.strip()}
    if title.lower() in tags or title.lower() == style.strip().lower():
        return None
    return title


def _clean_cover(raw: Any) -> str | None:
    cover = re.sub(r"\s+", " ", str(raw or "")).strip()
    if not 6 <= len(cover.split()) <= 70 or not _latin(cover):
        return None
    return cover


# "Avoid: A | B" as the request's last line: the names the track already has or was offered ("Another one")
_AVOID_RE = re.compile(r"(?:^|\n)Avoid\s*:\s*([^\n]*)\s*\Z", re.I)


def _title_key(name: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^\w\s]", "", name.lower())).strip()


def _split_avoid(idea: str) -> tuple[str, list[str]]:
    """The request without its "Avoid:" line, and the names on that line."""
    m = _AVOID_RE.search(idea)
    if not m:
        return idea, []
    names = [n.strip() for n in m.group(1).split("|") if n.strip()]
    return idea[:m.start()].rstrip(), names[:20]


def title(generate: Generate, idea: str, language: str | None = None, seed: int | None = None) -> dict[str, Any]:
    idea, avoid = _split_avoid(idea)
    lyrics, style = _block(idea, "Lyrics"), _block(idea, "Style")
    lang = _title_language(language, lyrics)
    system = TITLE.replace("{lang}", lang)
    if avoid:
        system += ("\nThe track already has or was offered these names; give a different one, not one of these and not "
                   "a small change of one: " + "; ".join(avoid))
    taken = {_title_key(n) for n in avoid}
    # a long song adds nothing after its first sections, and the prompt's length is the time it takes
    shown = idea if len(idea) <= 2500 else idea[:2500]
    found: str | None = None
    repeat: dict[str, Any] | None = None
    last: Exception | None = None
    for attempt in range(3):
        reply, _ = generate(system, f"Input: {shown}\nOutput: ", 220, 0.3 + 0.2 * attempt,
                            None if seed is None else seed + attempt)
        try:
            data = parse_json(reply)
        except TaskError as exc:
            last = exc
            continue
        name = _clean_title(data.get("title"), style)
        if not name:
            last = TaskError("the title is empty, too long or only the genre")
            continue
        cover = _clean_cover(data.get("cover"))
        if _title_key(name) in taken:
            # a name given before: asked again, and kept only when nothing new comes
            repeat = repeat or {"title": name, "cover": cover or "", "language": lang}
            last = TaskError("the title repeats one given before")
            continue
        found = found or name
        if cover:
            return {"title": name, "cover": cover, "language": lang}
        last = TaskError("the cover description is missing or not in English")
    if found:
        return {"title": found, "cover": "", "language": lang}
    if repeat:
        return repeat
    raise TaskError(str(last))


# ---------------------------------------------------------------- the picture for a track's cover

COVER = """You describe pictures for an image model that paints album art for music tracks. The input has up to five
blocks: "Lyrics:", "Style:", "Idea:", "Title:" and "Wish:"; any of them may be missing. Answer with one JSON object
and nothing else:
{"prompt": "<one visual scene in plain English: 20 to 40 words; the subject, the setting, the light, the colours, the mood and the art style>"}
When there is a Wish, it is what the person wants to see, written in any language: follow it faithfully, translate it
into English and enrich it visually, keep its subject, its objects and its style; the song only fills in what the
wish leaves open. Without a Wish, paint the song's central image or feeling, not its genre.
The image model letters onto the picture any word that names writing, so describe only what is seen, in plain words:
never the words album, cover, poster, sleeve, title, text, letters, words, typography, logo or sign, not even to
forbid them; no genre names, and no instrument names as a label or a caption (an instrument may be in the scene as an
object); no tempo, no BPM, no quotes, no name of the song; no books, signs or screens. No people's faces unless the
song or the wish is about a person. Only the letters a to z: no accents, no other alphabets.
Input: Lyrics: [Chorus]
We are the fire in the dark tonight
Style: anthemic rock, male vocals
Title: Fire in the Dark
Output: {"prompt": "A single bonfire burning on a black cliff above a stormy sea, sparks rising into a night sky full of stars, deep orange glow against indigo clouds, dramatic wide angle, painterly cinematic illustration"}
Input: Style: lo-fi hip hop, mellow
Title: Rainy Window
Wish: кот спит на подоконнике, за окном дождь, акварель
Output: {"prompt": "A ginger cat asleep on a wooden windowsill, rain streaking the glass, blurred city lights outside, soft grey and amber tones, quiet cosy mood, delicate watercolour painting"}"""
_COVER_BLOCK_RE = re.compile(r"^(Lyrics|Style|Idea|Title|Wish)\s*:", re.I | re.M)
# words the image model would letter onto the picture; never in a cover description
_COVER_BANNED = re.compile(
    r"\b(?:albums?|covers?|posters?|sleeves?|titles?|titled|texts?|letters?|lettering|words?|typography|typographic|"
    r"logos?|signs?|signage|captions?|fonts?|labels?|lyrics|bpm|tempo|beats per minute)\b", re.I)
# genre names that are no everyday words (rock, house, blues, disco and soul are, and may be in a scene)
_COVER_GENRES = re.compile(
    r"\b(?:jazz|hip[\s-]?hop|techno|edm|trance|synthwave|synth[\s-]?pop|electro[\s-]?pop|lo[\s-]?fi|dubstep|"
    r"drum and bass|drum n bass|rnb|k[\s-]?pop|hyperpop|phonk|shoegaze|vaporwave|chillwave|darkwave|reggaeton|"
    r"reggae|bossa nova|punk|grunge|dancehall)\b", re.I)
_WRITING = r"(?:text|letters?|lettering|words?|typography|titles?|captions?|logos?|signs?|watermarks?|labels?|writing)"
_COVER_NO_TEXT = re.compile(
    rf"(?:,\s*)?\b(?:no|without|free of)\s+(?:any\s+)?(?:visible\s+)?{_WRITING}(?:\s*(?:,|or|and)\s*{_WRITING})*\b", re.I)
_COVER_TEMPO = re.compile(r"\b\d+\s*(?:bpm|beats per minute)\b", re.I)
_COVER_QUOTES = re.compile(r"[\"“”«»„`]|(?<!\w)'|'(?!\w)")
_COVER_INPUT_MAX = 2500


def _cover_problem(text: str) -> str | None:
    """Why a cover description cannot be drawn as it is; None when it can."""
    if not text:
        return "the description is empty"
    if not _latin(text):
        return "the description is not in plain English"
    if _COVER_QUOTES.search(text):
        return "the description has quotes"
    if _COVER_BANNED.search(text) or _COVER_TEMPO.search(text):
        return "the description names text, a cover or the tempo"
    if _COVER_GENRES.search(text):
        return "the description names a genre"
    if not 12 <= len(text.split()) <= 60:
        return "the description is too short or too long"
    return None


def _cover_clean(raw: Any) -> str:
    """The description without the wording the image model would letter: "no text" clauses, the banned words, genre
    names, tempo, quotes; accented letters lose their accents and words in other alphabets are dropped."""
    text = re.sub(r"\s+", " ", str(raw or "")).strip()
    text = re.sub(r"^(?:output|prompt|answer)\s*:\s*", "", text, flags=re.I)
    # a short quoted phrase is a name to letter ('a poster titled "Night"'): it goes whole
    text = re.sub(r"[\"“«„][^\"“”«»„]{0,40}[\"”»]", "", text)
    text = _COVER_QUOTES.sub("", text)
    text = "".join(c for c in unicodedata.normalize("NFKD", text) if not unicodedata.combining(c))
    text = re.sub(r"[^\W\d_a-zA-Z]+", "", text)
    text = _COVER_NO_TEXT.sub("", text)
    text = _COVER_TEMPO.sub("", text)
    text = re.sub(r"\b(?:an?|the)?\s*(?:album|record|vinyl)\s+(?:cover|sleeve)s?\s*(?:art(?:work)?)?\s+(?:of|with|showing)\s+", "", text, flags=re.I)
    text = _COVER_BANNED.sub("", text)
    text = _COVER_GENRES.sub("", text)
    # what the removals leave: doubled spaces, empty list items, an article or a preposition before a comma
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\s+([,.;:])", r"\1", text)
    text = re.sub(r"\b(?:an?|the|of|with|and|in)(?=[,.;:]|$)", "", text, flags=re.I)
    text = re.sub(r"\s+([,.;:])", r"\1", text)
    text = re.sub(r"([,;:])(?:\s*[,;:])+", r"\1", text)
    text = re.sub(r"\s+", " ", text).strip(" ,;:-")
    return text[:1].upper() + text[1:] if text else text


def _cover_input(idea: str) -> str:
    """The request as the model reads it: a long song is cut, the wish is always kept whole."""
    if len(idea) <= _COVER_INPUT_MAX:
        return idea
    marks = [(m.start(), m.group(1).lower()) for m in _COVER_BLOCK_RE.finditer(idea)] + [(len(idea), "")]
    wish = ""
    rest = idea
    for i, (start, label) in enumerate(marks[:-1]):
        if label == "wish":
            end = marks[i + 1][0]
            wish, rest = idea[start:end].strip(), idea[:start] + idea[end:]
            break
    return (rest[: max(0, _COVER_INPUT_MAX - len(wish))].rstrip() + "\n" + wish).strip()


def cover(generate: Generate, idea: str, seed: int | None = None) -> dict[str, Any]:
    """The picture for a cover; the input's "Wish:" block, when there is one, leads. Asked up to three times at a rising
    temperature until the description is clean; after that the fullest one has the wording that slipped through taken
    out rather than failing."""
    shown = _cover_input(idea)
    fallback = ""
    last = "the reply is empty"
    for attempt in range(3):
        reply, _ = generate(COVER, f"Input: {shown}\nOutput: ", 160, 0.4 + 0.25 * attempt,
                            None if seed is None else seed + attempt)
        try:
            data = parse_json(reply)
        except TaskError as exc:
            last = str(exc)
            continue
        text = re.sub(r"\s+", " ", str(data.get("prompt") or data.get("cover") or "")).strip()
        problem = _cover_problem(text)
        if problem is None:
            return {"prompt": text}
        last = problem
        cleaned = _cover_clean(text)
        if len(cleaned.split()) > len(fallback.split()):
            fallback = cleaned
    if len(fallback.split()) >= 6:
        return {"prompt": " ".join(fallback.split()[:60])}
    raise TaskError(last)


def _latin(text: str) -> bool:
    """No letters beyond plain a-z: a caption the model wrote in the lyrics' language has some (gitár, гитара)."""
    return not re.search(r"[^\W\d_a-zA-Z]", text)


def _int(v: Any) -> int | None:
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return None


TASKS = ("sa3", "yue2-song", "ace-song", "ace-instrumental", "ace-part", "translate", "title", "cover")


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
    if task == "translate":
        return translate(generate, idea, seed)
    if task == "title":
        return title(generate, idea, language, seed)
    if task == "cover":
        return cover(generate, idea, seed)
    raise TaskError(f"unknown task '{task}', one of {TASKS}")
