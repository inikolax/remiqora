"""Built-in Hungarian/any-language -> English translator (NLLB-200-distilled-600M).

Runs fully offline on CPU inside the backend process — no Ollama, no GPU, no
VRAM usage, so it can never clash with the music engines. The model weights
(~2.4GB) live under DATA_DIR/nllb and are downloaded once via
huggingface_hub (see the download helper below / setup docs).

NLLB translates faithfully but does NOT expand style descriptions the way an
LLM does; the /api/prompt/prepare contract stays identical so the frontend
needs no logic changes — only the engine label differs.
"""
from __future__ import annotations

import re
import threading
from pathlib import Path
from .config import DATA_DIR

NLLB_DIR = DATA_DIR / "nllb"
DST_EN = "eng_Latn"

# ISO code -> (NLLB language code, self-name for the UI dropdown).
SUPPORTED_LANGS: dict[str, tuple[str, str]] = {
    "hu": ("hun_Latn", "Magyar"),
    "es": ("spa_Latn", "Español"),
    "de": ("deu_Latn", "Deutsch"),
    "fr": ("fra_Latn", "Français"),
    "it": ("ita_Latn", "Italiano"),
    "pt": ("por_Latn", "Português"),
    "ru": ("rus_Cyrl", "Русский"),
    "uk": ("ukr_Cyrl", "Українська"),
    "pl": ("pol_Latn", "Polski"),
    "ro": ("ron_Latn", "Română"),
    "nl": ("nld_Latn", "Nederlands"),
    "cs": ("ces_Latn", "Čeština"),
    "tr": ("tur_Latn", "Türkçe"),
    "en": ("eng_Latn", "English"),
}

_HU_CHARS = frozenset("áéíóöőúüűÁÉÍÓÖŐÚÜŰ")

# Distinctive stopwords (deliberately no 1-letter words: 'a' collides with English).
_HU_STOP = frozenset(
    "egy az és hogy nem van vagy mint már csak meg azt ezt akkor amikor ahol "
    "nagyon sem nincs voltak lesz kell lehet nagy indiai zenekar dallam dal lassú "
    "szomorú gyors hangos halk sötét világos régi új magyar".split()
)
_EN_STOP = frozenset(
    "the and with about from song love night light heart home dark eyes rain "
    "wait beneath you your lonely".split()
)

_lock = threading.Lock()
_tokenizer = None
_model = None


def weights_present() -> bool:
    return (NLLB_DIR / "config.json").is_file() and any(NLLB_DIR.glob("*.safetensors")) or (NLLB_DIR / "pytorch_model.bin").is_file()


# Frequent unaccented -> accented fixes: many users type without accents and NLLB
# mistranslates those words (e.g. "betetekkel"). Applied case-insensitively to
# whole words only; unknown words pass through untouched.
_ACCENT_MAP = {
    "szomoru": "szomorú", "lassu": "lassú", "gyors": "gyors", "sotet": "sötét",
    "vilagos": "világos", "dallam": "dallam", "dallamvilag": "dallamvilág",
    "zenekar": "zenekar", "hangszerek": "hangszerek", "hangszereles": "hangszerelés",
    "betetekkel": "betétekkel", "betetek": "betétek", "epikus": "epikus",
    "regi": "régi", "uj": "új", "magyar": "magyar", "gyerekrol": "gyerekről",
    "gyerekekrol": "gyerekekről", "eszak": "észak", "tuz": "tűz", "viz": "víz",
    "fold": "föld", "hold": "hold", "nap": "nap", "ejjel": "éjjel", "ejjel-nappal": "éjjel-nappal",
    "sziv": "szív", "almok": "álmok", "alom": "álom", "elet": "élet",
    "halal": "halál", "szerelem": "szerelem", "fajdalom": "fájdalom",
    "orom": "öröm", "banat": "bánat", "remeny": "remény", "emlek": "emlék",
    "mult": "múlt", "jovo": "jövő", "tavasz": "tavasz", "osz": "ősz",
    "tel": "tél", "nyar": "nyár", "eso": "eső", "ho": "hó", "szel": "szél",
    "tenger": "tenger", "hegyek": "hegyek", "volgy": "völgy", "ut": "út",
    "hazafele": "hazafelé", "egyedul": "egyedül", "orokke": "örökké",
    "neha": "néha", "mar": "már", "meg": "meg", "hogy": "hogy",
    "eros": "erős", "lagy": "lágy", "kemeny": "kemény", "csendes": "csendes",
    "hangos": "hangos",
    "noi": "női", "ferfi": "férfi", "enek": "ének", "enekel": "énekel",
    "enekes": "énekes", "enekesno": "énekesnő", "korus": "kórus",
    "gitar": "gitár", "zongora": "zongora", "hegedu": "hegedű",
    "dob": "dob", "dobok": "dobok", "fuvola": "fuvola", "trombita": "trombita",
    "vonos": "vonós", "vonosok": "vonósok", "hurok": "húrok",
    "tempo": "tempó", "ritmus": "ritmus", "rock": "rock", "metal": "metal",
    "ballada": "ballada", "keringo": "keringő", "indulo": "induló",
}


def _restore_accents(text: str) -> str:
    def fix(word: str) -> str:
        m = re.match(r"^(\W*)(.*?)(\W*)$", word, flags=re.UNICODE)
        if not m:
            return word
        pre, core, post = m.groups()
        key = core.lower()
        if key in _ACCENT_MAP:
            acc = _ACCENT_MAP[key]
            core = acc.capitalize() if core[:1].isupper() else acc
        return f"{pre}{core}{post}"

    return re.sub(r"\S+", lambda m: fix(m.group(0)), text)


def looks_hungarian(text: str) -> bool:
    """Accent-independent heuristic. The bridge exists for Hungarian input, so
    Hungarian wins ties; clear English markers (the/and/song/...) pass through."""
    low = text.lower()
    if any(ch in _HU_CHARS for ch in text):
        return True
    words = set(low.replace(",", " ").split())
    has_hu = bool(words & _HU_STOP)
    has_en = bool(words & (_EN_STOP - _HU_STOP))
    if has_en and not has_hu:
        return False
    return True


def _ensure_loaded() -> None:
    global _tokenizer, _model
    if _model is not None:
        return
    if not weights_present():
        raise RuntimeError(f"NLLB weights missing in {NLLB_DIR}")
    try:
        import torch
        from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
    except ImportError as exc:
        raise RuntimeError(f"NLLB runtime deps missing (torch/transformers): {exc}") from exc
    torch.set_num_threads(max(1, (torch.get_num_threads() or 4)))
    _tokenizer = AutoTokenizer.from_pretrained(str(NLLB_DIR))
    _model = AutoModelForSeq2SeqLM.from_pretrained(str(NLLB_DIR))
    _model.eval()


def translate_to_english(text: str, src: str = "auto") -> tuple[str, str]:
    """Return (english_text, iso_src_lang). 'en' passes through; any other
    supported ISO code translates from that language; 'auto' (default) uses
    the Hungarian-vs-English heuristic below."""
    cleaned = " ".join(text.split())
    if not cleaned:
        return "", ""
    iso = (src or "auto").strip().lower()
    if iso == "auto":
        iso = "hu" if looks_hungarian(cleaned) else "en"
    if iso == "en" or iso not in SUPPORTED_LANGS:
        return cleaned, "en"
    if iso == "hu":
        cleaned = _restore_accents(cleaned)
    nllb_code = SUPPORTED_LANGS[iso][0]
    with _lock:
        _ensure_loaded()
        import torch

        _tokenizer.src_lang = nllb_code
        inputs = _tokenizer(cleaned, return_tensors="pt", truncation=True, max_length=512)
        forced_bos = _tokenizer.convert_tokens_to_ids(DST_EN)
        with torch.no_grad():
            out = _model.generate(
                **inputs,
                forced_bos_token_id=forced_bos,
                max_length=512,
            )
        en = _tokenizer.batch_decode(out, skip_special_tokens=True)[0]
    # NLLB sometimes decorates music-related lines with stray note symbols.
    en = re.sub(r"^[^A-Za-z0-9\u00C0-\u017F]+", "", en.strip())
    en = re.sub(r"[^A-Za-z0-9\u00C0-\u017F).!?\"]+$", "", en.strip())
    return " ".join(en.split()), iso


def local_dir() -> Path:
    return NLLB_DIR
