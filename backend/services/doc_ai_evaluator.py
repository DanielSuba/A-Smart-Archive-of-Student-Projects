import json
import os
import re
from pathlib import Path
from typing import Any

import httpx
from PyPDF2 import PdfReader


AI_URL = os.getenv("AI_DOC_EVALUATOR_URL", "http://127.0.0.1:1234/v1/chat/completions")
AI_MODEL = os.getenv("AI_DOC_EVALUATOR_MODEL", "local-model")
MAX_CHARS = 12000

DOCUMENTATION_PROMPT = """
Jesteś recenzentem dokumentacji projektów studenckich. Oceń wyłącznie tekst dokumentacji podany poniżej.
Nie dopowiadaj faktów, których nie ma w tekście. Jeśli czegoś brakuje, zaznacz to w polu notes.

Zwróć wyłącznie poprawny obiekt JSON i nic innego. Nie dodawaj markdown, komentarzy ani tekstu poza JSONem.
Format odpowiedzi:
{
  "completeness_score": {
    "score": 0,
    "notes": "Czy dokumentacja zawiera wymagania, instrukcję instalacji, opis architektury i zrzuty ekranu."
  },
  "readability_structure": {
    "score": 0,
    "notes": "Czy język jest zrozumiały i czy użyto nagłówków, list lub tabel."
  },
  "business_context": {
    "score": 0,
    "notes": "Czy wyjaśniono problem biznesowy/użytkowy rozwiązywany przez aplikację."
  },
  "tech_stack_rationale": {
    "score": 0,
    "notes": "Czy autor uzasadnił wybór technologii, a nie tylko je wymienił."
  },
  "libraries_used": ["nazwa biblioteki lub technologii"],
  "summary": "Krótka ocena dokumentacji w 1-2 zdaniach."
}

Skala score: liczba całkowita od 0 do 100.

Tekst dokumentacji:
---
__DOCUMENTATION_TEXT__
---
""".strip()


def build_documentation_prompt(documentation_text: str) -> str:
    return DOCUMENTATION_PROMPT.replace("__DOCUMENTATION_TEXT__", documentation_text)


def extract_documentation_excerpt(file_path: str) -> str | None:
    path = Path(file_path)
    if not path.exists():
        return None

    suffix = path.suffix.lower()
    if suffix == ".pdf":
        return _extract_pdf_excerpt(path)
    if suffix in {".txt", ".md", ".json"}:
        return path.read_text(encoding="utf-8", errors="ignore")[:MAX_CHARS]
    return None


def _extract_pdf_excerpt(path: Path) -> str | None:
    try:
        reader = PdfReader(str(path))
    except Exception:
        return None

    selected_pages = set(range(min(3, len(reader.pages))))
    toc_patterns = ("spis treści", "spis tresci", "table of contents", "contents")

    for index, page in enumerate(reader.pages[:10]):
        try:
            text = page.extract_text() or ""
        except Exception:
            continue
        text_lower = text.lower()
        if any(pattern in text_lower for pattern in toc_patterns):
            selected_pages.add(index)

    chunks = []
    for index in sorted(selected_pages):
        try:
            text = reader.pages[index].extract_text() or ""
        except Exception:
            text = ""
        if text.strip():
            chunks.append(f"[Strona {index + 1}]\n{text.strip()}")

    excerpt = "\n\n".join(chunks).strip()
    return excerpt[:MAX_CHARS] if excerpt else None


async def evaluate_documentation(file_path: str) -> tuple[str, dict[str, Any] | None]:
    excerpt = extract_documentation_excerpt(file_path)
    if not excerpt:
        return "unavailable", None

    payload = {
        "model": AI_MODEL,
        "messages": [{"role": "user", "content": build_documentation_prompt(excerpt)}],
        "temperature": 0.1,
        "top_p": 0.1,
    }

    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            response = await client.post(AI_URL, json=payload)
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
    except Exception:
        return "unavailable", None

    parsed = _parse_json_object(content)
    if not parsed:
        return "unavailable", None
    return "ready", parsed


def _parse_json_object(content: str) -> dict[str, Any] | None:
    content = content.strip()
    if content.startswith("```"):
        content = re.sub(r"^```(?:json)?", "", content).strip()
        content = re.sub(r"```$", "", content).strip()
    try:
        value = json.loads(content)
        return value if isinstance(value, dict) else None
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", content, re.DOTALL)
        if not match:
            return None
        try:
            value = json.loads(match.group(0))
            return value if isinstance(value, dict) else None
        except json.JSONDecodeError:
            return None
