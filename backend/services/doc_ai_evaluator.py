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
Jesteś ekspertem ds. inżynierii oprogramowania oraz analitykiem biznesowym. Twoim zadaniem jest ocena dokumentacji technicznej dostarczonej przez użytkownika.

Przeanalizuj dokumentację według poniższych kryteriów i przyznaj punkty w skali od 0 do 10 dla każdej kategorii. Nie dopowiadaj faktów, których nie ma w tekście. Pamiętaj, że nie widzisz obrazów ani zrzutów ekranu, więc całkowicie je zignoruj w swojej ocenie.

KRYTERIA OCENY:

Completeness Score (Kompletność) [0-10]:
Czy dokumentacja zawiera kluczowe sekcje, takie jak Wymagania, Instrukcja instalacji oraz Opis architektury? Zignoruj brak zrzutów ekranu i obrazków.

Readability & Structure (Czytelność) [0-10]:
Czy język jest zrozumiały? Czy autor odpowiednio użył formatowania, takiego jak nagłówki, listy i tabele, aby ułatwić czytanie?

Business Context (Kontekst biznesowy) [0-10]:
Przyznaj punkty bazowe, np. 5, jeśli dokumentacja w ogóle opisuje problem, który rozwiązuje. Resztę punktów przyznaj za to, jak dobrze i zrozumiale wyjaśniono, dlaczego to rozwiązanie jest korzystne dla biznesu.

Tech Stack (Technologie i ich uzasadnienie) [0-10]:
Oceń razem dwie rzeczy: czy dokumentacja jasno wymienia użyte technologie oraz czy autor uzasadnił, dlaczego wybrał dane narzędzia, np. dlaczego użyto PostgreSQL zamiast innej bazy. Przyznaj mniej punktów, jeśli technologie są tylko wymienione bez uzasadnienia albo jeśli uzasadnienie jest ogólne.

Summary (Podsumowanie):
Na końcu odpowiedzi podaj krótkie podsumowanie po polsku w 1-2 zdaniach. Nie oceniaj go punktowo.

WYMAGANY FORMAT WYJŚCIOWY:
Musisz odpowiedzieć WYŁĄCZNIE w formacie poprawnym, zminimalizowanym JSON, bez żadnego dodatkowego tekstu na początku ani na końcu. Klucze JSON muszą pozostać po angielsku, ale wszystkie wartości tekstowe, w szczególności pola "justification" oraz "summary", wpisz po polsku. Nie wypisuj osobnego spisu bibliotek ani technologii. Nie używaj języka angielskiego w uzasadnieniach. Użyj dokładnie poniższej struktury:

{"evaluations":{"completeness":{"score":0,"justification":"Krótkie uzasadnienie oceny po polsku"},"readability":{"score":0,"justification":"Krótkie uzasadnienie oceny po polsku"},"business_context":{"score":0,"justification":"Krótkie uzasadnienie oceny po polsku"},"tech_stack":{"score":0,"justification":"Krótkie uzasadnienie oceny po polsku"}},"summary":"Krótkie podsumowanie oceny dokumentacji po polsku"}

Dokumentacja do oceny:
__DOCUMENTATION_TEXT__
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
