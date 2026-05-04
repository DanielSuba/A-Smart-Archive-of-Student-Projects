"""
Difficulty Score Calculator
Heurystyczna ocena trudności projektu na podstawie:
- liczby wykrytych technologii
- obecności CI/CD
- słów kluczowych w opisie
- liczby technologii wysokiej pewności
"""
from typing import List, Dict


COMPLEXITY_KEYWORDS = [
    "architektura mikroserwisów", "microservices", "kubernetes", "k8s",
    "baza danych", "database", "testy jednostkowe", "unit tests",
    "ci/cd", "deployment", "docker", "containerization",
    "api restful", "rest api", "graphql", "oauth", "jwt",
    "machine learning", "deep learning", "neural network",
    "websocket", "real-time", "distributed", "scalable",
    "testy integracyjne", "e2e tests", "end-to-end",
    "wzorce projektowe", "design patterns", "solid",
    "cache", "redis", "elasticsearch", "message queue",
    "algorytm", "algorithm", "optymalizacja", "optimization",
]

ADVANCED_TECH = {
    "Kubernetes", "TensorFlow", "PyTorch", "Elasticsearch", "GraphQL",
    "React Native", "Flutter", "Rust", "Go", "Scala", "Spring Boot",
    "AWS", "Azure", "GCP", "Docker", "scikit-learn"
}

INTERMEDIATE_TECH = {
    "React", "Vue.js", "Angular", "FastAPI", "Django", "Node.js",
    "PostgreSQL", "MongoDB", "Redis", "TypeScript", "Docker", "GraphQL"
}


def calculate_difficulty(
    technologies: List[Dict],
    description: str,
    has_cicd: bool,
    repo_url: str | None = None
) -> Dict:
    """
    Returns difficulty_score (0-100) and difficulty_level label.
    
    Scoring heuristic:
    +10  base score for having a project
    +5   per technology with confidence > 20%
    +8   per advanced technology
    +4   per intermediate technology
    +15  if CI/CD is present
    +5   per complexity keyword found in description
    +10  if repo_url provided
    max capped at 100
    """
    score = 10  # Base

    if repo_url:
        score += 10

    desc_lower = description.lower()
    keyword_hits = 0
    for kw in COMPLEXITY_KEYWORDS:
        if kw in desc_lower:
            keyword_hits += 1
    score += min(keyword_hits * 5, 20)

    if has_cicd:
        score += 15

    high_conf_techs = [t for t in technologies if t.get("confidence", 0) > 20]
    score += len(high_conf_techs) * 5

    tech_names = {t.get("name", "") for t in technologies}
    advanced_count = len(tech_names & ADVANCED_TECH)
    intermediate_count = len(tech_names & INTERMEDIATE_TECH)
    score += advanced_count * 8
    score += intermediate_count * 4

    score = min(score, 100)

    if score < 25:
        level = "Początkujący"
    elif score < 50:
        level = "Średni"
    elif score < 75:
        level = "Zaawansowany"
    else:
        level = "Ekspert"

    return {
        "score": round(score, 1),
        "level": level,
        "breakdown": {
            "base": 10,
            "repo_bonus": 10 if repo_url else 0,
            "keyword_bonus": min(keyword_hits * 5, 20),
            "cicd_bonus": 15 if has_cicd else 0,
            "tech_count_bonus": len(high_conf_techs) * 5,
            "advanced_tech_bonus": advanced_count * 8,
            "intermediate_tech_bonus": intermediate_count * 4,
        }
    }
