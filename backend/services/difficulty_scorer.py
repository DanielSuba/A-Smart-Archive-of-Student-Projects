"""
Difficulty Score Calculator
Heurystyczna ocena trudnosci projektu na podstawie repozytorium GitHub,
wykrytych technologii, CI/CD, struktury plikow i testow.
"""
from math import ceil, floor
from typing import Dict, List


ADVANCED_TECH = {
    "Kubernetes", "TensorFlow", "PyTorch", "Elasticsearch", "GraphQL",
    "React Native", "Flutter", "Rust", "Go", "Scala", "Spring Boot",
    "AWS", "Azure", "GCP", "Docker", "scikit-learn"
}

INTERMEDIATE_TECH = {
    "React", "Vue.js", "Angular", "FastAPI", "Django", "Node.js",
    "PostgreSQL", "MongoDB", "Redis", "TypeScript", "Docker", "GraphQL",
    "Python"
}

TEST_LIBRARIES = {
    "pytest", "jest", "mocha", "junit", "vitest", "playwright", "cypress",
    "unittest", "selenium", "phpunit", "rspec"
}


# Funkcja sluzy do obliczania poziomu trudnosci projektu na podstawie danych z repozytorium.
def calculate_difficulty(
    technologies: List[Dict],
    description: str,
    has_cicd: bool,
    repo_url: str | None = None,
    repo_analysis: Dict | None = None,
) -> Dict:
    """
    Returns uncapped difficulty_score and difficulty_level label.
    """
    repo_analysis = repo_analysis or {}

    base_bonus = 5
    readme_bonus = 5 if repo_analysis.get("readme_exists") else 0

    gitignore_bonus = 4 if repo_analysis.get("gitignore_exists") else 0
    extended_readme_bonus = 4 if (repo_analysis.get("readme_size") or 0) > 300 else 0
    license_contributing_bonus = 3 if (
        repo_analysis.get("license_exists") or repo_analysis.get("contributing_exists")
    ) else 0
    docker_bonus = 2 if repo_analysis.get("docker_exists") else 0

    usage_bonus = _score_usage_distribution(technologies)
    low_usage_bonus = sum(3 for tech in technologies if _confidence(tech) > 5)
    advanced_bonus = _score_advanced_technologies(technologies)
    intermediate_bonus = _score_intermediate_technologies(technologies)

    cicd_bonus = 10 if has_cicd else 0
    file_count_bonus = min(ceil((repo_analysis.get("file_count") or 0) / 10), 6)
    contributor_bonus = min((repo_analysis.get("contributors_count") or 0) * 2, 6)
    testing_bonus = _score_testing(repo_analysis)

    raw_score = (
        base_bonus
        + readme_bonus
        + gitignore_bonus
        + extended_readme_bonus
        + license_contributing_bonus
        + docker_bonus
        + usage_bonus
        + low_usage_bonus
        + advanced_bonus
        + intermediate_bonus
        + cicd_bonus
        + file_count_bonus
        + contributor_bonus
        + testing_bonus
    )
    score = raw_score

    if score < 30:
        level = "Początkujący"
    elif score < 50:
        level = "Średni"
    elif score < 75:
        level = "Zaawansowany"
    elif score < 100:
        level = "Ekspert"
    elif score < 125:
        level = "Master"
    else:
        level = "Legenda"

    return {
        "score": round(score, 1),
        "level": level,
        "breakdown": {
            "base_bonus": base_bonus,
            "readme_bonus": readme_bonus,
            "gitignore_bonus": gitignore_bonus,
            "extended_readme_bonus": extended_readme_bonus,
            "license_contributing_bonus": license_contributing_bonus,
            "docker_bonus": docker_bonus,
            "usage_bonus": usage_bonus,
            "low_usage_bonus": low_usage_bonus,
            "advanced_tech_bonus": advanced_bonus,
            "intermediate_tech_bonus": intermediate_bonus,
            "cicd_bonus": cicd_bonus,
            "file_count_bonus": file_count_bonus,
            "contributor_bonus": contributor_bonus,
            "testing_bonus": testing_bonus,
            "raw_score": round(raw_score, 1),
            "capped_at_100": False,
            "repo_url_used": bool(repo_url),
        }
    }


# Funkcja sluzy do punktowania technologii z udzialem wiekszym niz 20%.
def _score_usage_distribution(technologies: List[Dict]) -> int:
    score = 0
    for tech in technologies:
        confidence = _confidence(tech)
        if confidence > 20:
            extra_twenty_chunks = max(0, floor((confidence - 20) / 20))
            if confidence >= 80:
                extra_twenty_chunks += 1
            score += max(0, 8 - extra_twenty_chunks)
    return min(score, 10)


# Funkcja sluzy do punktowania technologii zaawansowanych z malejacym bonusem.
def _score_advanced_technologies(technologies: List[Dict]) -> int:
    matches = [tech for tech in technologies if tech.get("name") in ADVANCED_TECH]
    score = 0
    for index, _tech in enumerate(matches):
        if index < 2:
            score += 6
        elif index < 4:
            score += 4
        else:
            score += 2
    return score


# Funkcja sluzy do punktowania technologii sredniozaawansowanych i technologii spoza list.
def _score_intermediate_technologies(technologies: List[Dict]) -> int:
    score = 0
    intermediate_count = 0
    for tech in technologies:
        name = tech.get("name")
        if name in ADVANCED_TECH:
            continue
        if name in INTERMEDIATE_TECH:
            intermediate_count += 1
            score += 3 if intermediate_count <= 3 else 1
        else:
            score += 1
    return score


# Funkcja sluzy do punktowania katalogow i bibliotek testowych.
def _score_testing(repo_analysis: Dict) -> int:
    dependency_text = (repo_analysis.get("dependency_text") or "").lower()
    has_test_library = any(library in dependency_text for library in TEST_LIBRARIES)
    return (5 if repo_analysis.get("has_tests_dir") else 0) + (5 if has_test_library else 0)


# Funkcja sluzy do bezpiecznego pobierania pewnosci wykrycia technologii.
def _confidence(tech: Dict) -> float:
    try:
        return float(tech.get("confidence", 0) or 0)
    except (TypeError, ValueError):
        return 0.0
