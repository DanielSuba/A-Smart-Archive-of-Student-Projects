import os
from typing import Any

import httpx


AI_URL = os.getenv("AI_PORTFOLIO_GENERATOR_URL", "http://127.0.0.1:1234/v1/chat/completions")
AI_MODEL = os.getenv("AI_PORTFOLIO_GENERATOR_MODEL", "local-model")

SYSTEM_PROMPT = """
Jesteś profesjonalnym copywriterem IT. Tworzysz angażujące, naturalne i technicznie poprawne opisy projektów do portfolio programisty, które przyciągają uwagę rekruterów.
Cała odpowiedź musi być napisana wyłącznie po polsku. Nie używaj angielskich zdań, nagłówków ani rekomendacji. Angielskie nazwy technologii, frameworków i bibliotek zostaw w oryginale, ale każdy opis, komentarz i rekomendację pisz po polsku.
Korzystaj tylko z danych przekazanych przez aplikację i nie dopowiadaj faktów, których nie ma w opisie projektów.
Podkreśl 3 najlepsze projekty, mocne strony autora oraz krótkie rekomendacje chwalące jego pracę. Format odpowiedzi: zwykły tekst Markdown, bez JSON.
Punktacja projektu oznacza złożoność projektu, a nie ocenę jakości. Projekt powyżej 30 punktów traktuj jako projekt o średniej złożoności, a projekt powyżej 50 punktów jako projekt skomplikowany.
""".strip()


# Funkcja służy do generowania opisu portfolio na podstawie najlepszych projektów.
async def generate_portfolio_description(author_name: str, projects: list[dict[str, Any]]) -> str | None:
    if not projects:
        return None

    payload = {
        "model": AI_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_portfolio_prompt(author_name, projects)},
        ],
        "temperature": 0.75,
        "top_p": 0.9,
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(AI_URL, json=payload)
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
    except Exception:
        return None

    cleaned = content.strip()
    return cleaned if cleaned else None


# Funkcja służy do budowania stateless promptu dla generatora opisu portfolio.
def build_portfolio_prompt(author_name: str, projects: list[dict[str, Any]]) -> str:
    project_blocks = []
    for index, project in enumerate(projects, start=1):
        technologies = ", ".join(project.get("technologies") or []) or "brak danych"
        description = (project.get("description") or "").strip() or "brak opisu"
        role = (project.get("role") or "").strip() or "brak danych"
        score = project.get("difficulty_score")
        score_text = f"{score:.0f}/100" if isinstance(score, (int, float)) else "brak danych"
        project_blocks.append(
            "\n".join([
                f"Projekt {index}: {project.get('title') or 'Bez tytułu'}",
                f"Rola autora: {role}",
                f"Punktacja projektu: {score_text}",
                f"Poziom trudności: {project.get('difficulty_level') or 'brak danych'}",
                f"Technologie: {technologies}",
                f"Opis: {description}",
            ])
        )

    return f"""
Autor portfolio: {author_name or "Student"}

Na podstawie poniższych 3 najlepszych projektów przygotuj krótki opis do początku portfolio.
Wymagania:
- 2-3 krótkie akapity lub lista Markdown.
- Cały tekst wynikowy napisz po polsku. Nie przechodź na język angielski.
- Punktacja projektu oznacza złożoność: powyżej 30 punktów to średnia złożoność, a powyżej 50 punktów to projekt skomplikowany.
- Chwal pracę autora konkretnie, odnosząc się do projektów, technologii i poziomu trudności.
- Dodaj rekomendacyjny ton przydatny dla rekrutera, ale bez przesady i bez wymyślania faktów.
- Nie pisz nagłówka "Opis" ani metakomentarzy o tym, że jesteś AI.

Projekty:
{chr(10).join(project_blocks)}
""".strip()


# Funkcja służy do tworzenia awaryjnego opisu portfolio, gdy lokalne AI jest niedostępne.
def build_fallback_portfolio_description(author_name: str, projects: list[dict[str, Any]]) -> str:
    titles = [project.get("title") or "projekt bez tytułu" for project in projects[:3]]
    if not titles:
        return ""
    listed = ", ".join(titles)
    return (
        f"{author_name or 'Autor'} prezentuje najmocniejsze projekty w portfolio: {listed}. "
        "Wybrane prace pokazują praktyczne podejście do rozwiązywania problemów, konsekwencję w realizacji "
        "oraz gotowość do rozwijania projektów o wyższym poziomie złożoności.\n\n"
        "Rekomendacja: autor wyróżnia się umiejętnością łączenia technologii z celem projektu i potrafi "
        "przedstawić swój dorobek w sposób przydatny dla zespołu technicznego oraz rekrutera."
    )
