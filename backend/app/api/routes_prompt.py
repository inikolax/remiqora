"""Hungarian (or any non-English) prompt preprocessing via a local Ollama LLM.

The music engines expect English style tags; the vocal_language field already
supports 'hu', so singing in Hungarian works — only the style description needs
translating/structuring. This route does NOT generate music, it only rewrites
text, so it never touches the GPU orchestrator and can run in parallel with
generation (Ollama itself should run on CPU: CUDA_VISIBLE_DEVICES=-1).

POST /api/prompt/prepare { text, target, model? } -> { style_en, lyrics, simple, vocal_language }
GET  /api/prompt/status -> { reachable, model, model_present, models[] }
"""
from __future__ import annotations

import json
import os
import re

import httpx
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/prompt", tags=["prompt"])

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")
# Translator backend: "auto" (built-in NLLB when its weights are present,
# otherwise Ollama), "local" (NLLB only), "ollama" (Ollama only).
TRANSLATOR = os.getenv("TRANSLATOR", "auto").strip().lower() or "auto"

SYSTEM_PROMPT = (
    "You are a music prompt translator for an AI music studio. "
    "Input is a free-form track description, in Hungarian or any other language. "
    "Output STRICT JSON only, no markdown, no commentary, with keys: "
    '{"style_en": "...", "lyrics": "...", "simple": "...", "vocal_language": "..."}. '
    "Rules for style_en (MOST IMPORTANT): a DETAILED comma-separated list of ENGLISH "
    "tags, 8-15 items, never Hungarian. Expand every input word into concrete musical "
    "detail: tempo feel (e.g. 'slow tempo 70bpm', 'driving mid-tempo'), instruments "
    "with character (e.g. 'distorted electric guitars', 'warm acoustic guitar', "
    "'orchestral strings', 'deep sub bass', 'punchy drums'), vocal character "
    "(e.g. 'emotional female vocal', 'whispered male vocal', 'choir backing'), mood "
    "nuances (e.g. 'melancholic', 'dark', 'hopeful lift in chorus'), era/production "
    "(e.g. '80s', 'modern polished production', 'lo-fi'). Do NOT collapse distinct "
    "details into one generic word: 'lassu rock orchestral betetekkel' must become "
    "separate tags like 'slow tempo rock, orchestral strings interlude, ...', not just "
    "'rock, orchestral'. "
    "lyrics = the song lyrics in their ORIGINAL language; if the input is only a "
    "description with NO lyric lines, lyrics MUST be an empty string — do NOT invent "
    "or write new lyrics, ever. If lyrics lack structure, "
    "add [Verse]/[Chorus] section headers where sensible. "
    "simple = two English sentences describing the whole track with its details "
    "(for simple mode). "
    'vocal_language = ISO code guessed from lyrics ("hu" for Hungarian, "en" for '
    'English, "" when instrumental/empty). Keep style_en under 600 chars. '
    "Preserve EVERY attribute from the input (mood, tempo, instruments, vocal gender, "
    "theme) — never drop details. Example: input 'szomoru dal, lassu rock, orchestral "
    "betetekkel, epikus' -> {\"style_en\": \"sad, slow tempo rock, distorted electric "
    "guitars, orchestral strings interlude, epic cinematic drums, melancholic, dark "
    "atmosphere, emotional build-up\", \"lyrics\": \"\", \"simple\": \"A sad slow "
    "rock song with epic orchestral string interludes and cinematic drums.\", "
    "\"vocal_language\": \"\"}."
)


class PrepareIn(BaseModel):
    text: str = Field(min_length=1, max_length=4000)
    target: str = Field(default="ace_custom", max_length=32)
    model: str = Field(default="", max_length=64)
    # Source language ISO code (hu/es/de/... — see nllb.SUPPORTED_LANGS) or
    # "auto" (default): Hungarian-vs-English heuristic.
    src_lang: str = Field(default="auto", max_length=16)


async def _ollama_models(client: httpx.AsyncClient) -> list[str]:
    resp = await client.get(f"{OLLAMA_HOST}/api/tags")
    resp.raise_for_status()
    return [m.get("name", "") for m in resp.json().get("models", [])]


class PrepareOut(BaseModel):
    style_en: str = ""
    lyrics: str = ""
    simple: str = ""
    vocal_language: str = ""


def _extract_json(raw: str) -> dict:
    """Tolerate LLMs wrapping JSON in code fences or prose."""
    cleaned = raw.strip()
    fence = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", cleaned, re.S)
    if fence:
        cleaned = fence.group(1)
    else:
        start, end = cleaned.find("{"), cleaned.rfind("}")
        if start != -1 and end != -1 and end > start:
            cleaned = cleaned[start : end + 1]
    try:
        data = json.loads(cleaned)
        return data if isinstance(data, dict) else {}
    except (json.JSONDecodeError, ValueError):
        return {}


async def _run_blocking(fn, *args):
    import asyncio

    return await asyncio.to_thread(fn, *args)


@router.get("/status")
async def prompt_status():
    from .. import nllb

    local_ready = nllb.weights_present()
    engine = "local" if (TRANSLATOR == "local" or (TRANSLATOR == "auto" and local_ready)) else "ollama"
    supported_langs = [{"code": code, "label": label} for code, (_, label) in nllb.SUPPORTED_LANGS.items()]
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            names = await _ollama_models(client)
    except httpx.HTTPError as exc:
        return {"reachable": False, "engine": engine, "local_ready": local_ready, "model": OLLAMA_MODEL, "models": [], "supported_langs": supported_langs, "error": str(exc)[:200]}
    return {"reachable": True, "engine": engine, "local_ready": local_ready, "model": OLLAMA_MODEL, "model_present": OLLAMA_MODEL in names, "models": names, "supported_langs": supported_langs}


def _use_local() -> bool:
    from .. import nllb

    if TRANSLATOR == "local":
        return True
    if TRANSLATOR == "ollama":
        return False
    return nllb.weights_present()


@router.post("/prepare", response_model=PrepareOut)
async def prompt_prepare(body: PrepareIn):
    from fastapi import HTTPException

    text = " ".join(body.text.split())
    if _use_local():
        from .. import nllb

        try:
            en, src = await _run_blocking(nllb.translate_to_english, text, body.src_lang)
        except RuntimeError as exc:
            raise HTTPException(status_code=502, detail=f"Local translator unavailable: {exc}") from exc
        return PrepareOut(
            style_en=en[:600],
            lyrics="",
            simple=en[:600],
            vocal_language=src if src != "en" else "",
        )
    model = (body.model or OLLAMA_MODEL).strip()
    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            names = await _ollama_models(client)
            if model not in names:
                raise HTTPException(status_code=502, detail=f"Ollama model not pulled: {model}")
            resp = await client.post(
                f"{OLLAMA_HOST}/api/chat",
                json={
                    "model": model,
                    "stream": False,
                    "options": {"temperature": 0.5},
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": f"Target: {body.target}\nInput: {text}"},
                    ],
                },
            )
            resp.raise_for_status()
            raw = resp.json().get("message", {}).get("content", "")
    except HTTPException:
        raise
    except httpx.HTTPError as exc:
        # 502 so the frontend can show "Ollama nem elérhető" distinctly.
        raise HTTPException(status_code=502, detail=f"Ollama unreachable: {exc}") from exc

    data = _extract_json(raw)
    out = PrepareOut(
        style_en=str(data.get("style_en", ""))[:600],
        lyrics=str(data.get("lyrics", ""))[:2000],
        simple=str(data.get("simple", ""))[:600],
        vocal_language=str(data.get("vocal_language", ""))[:8],
    )
    # Fallback: if the model returned prose instead of JSON, use it as English prompt.
    if not out.style_en and not out.simple and raw.strip():
        out.simple = raw.strip()[:500]
    return out
