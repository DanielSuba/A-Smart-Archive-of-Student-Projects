"""
Technology Extractor Service
Wykrywa technologie na podstawie:
1. GitHub API (statystyki języków)
2. Analizy plików projektu (package.json, requirements.txt, pom.xml, itp.)
3. Analizy tekstu PDF
"""
import httpx
import re
import json
import os
import base64
from typing import List, Dict, Tuple
from pathlib import Path
from dotenv import load_dotenv
from urllib.parse import quote

_BACKEND_DIR = Path(__file__).resolve().parents[1]
load_dotenv(_BACKEND_DIR.parent / ".env")
load_dotenv(_BACKEND_DIR / ".env")


TECH_KEYWORDS = {
    "React": {"category": "Frontend", "keywords": ["react", "jsx", "react-dom", "react-router"]},
    "Vue.js": {"category": "Frontend", "keywords": ["vue", "vuex", "vue-router", "nuxt"]},
    "Angular": {"category": "Frontend", "keywords": ["angular", "@angular/core", "ngmodule"]},
    "TypeScript": {"category": "Language", "keywords": ["typescript", "tsconfig", ".ts", "ts-node"]},
    "JavaScript": {"category": "Language", "keywords": ["javascript", "node_modules", "npm", "yarn"]},
    "HTML": {"category": "Frontend", "keywords": ["html", ".html"]},
    "CSS": {"category": "Frontend", "keywords": ["css", ".css", "scss", ".scss"]},
    "Python": {"category": "Language", "keywords": ["python", "pip", "django", "flask", "fastapi", "pytest"]},
    "Java": {"category": "Language", "keywords": ["java", "maven", "gradle", "spring", "pom.xml"]},
    "Kotlin": {"category": "Language", "keywords": ["kotlin", ".kt", "kotlinx"]},
    "Go": {"category": "Language", "keywords": ["golang", "go.mod", "goroutine"]},
    "Rust": {"category": "Language", "keywords": ["rust", "cargo", "tokio"]},
    "C#": {"category": "Language", "keywords": ["csharp", "dotnet", ".cs", "nuget", "asp.net"]},
    "PHP": {"category": "Language", "keywords": ["php", "laravel", "symfony", "composer.json"]},
    "Swift": {"category": "Language", "keywords": ["swift", "xcode", "swiftui"]},
    "Docker": {"category": "DevOps", "keywords": ["docker", "dockerfile", "docker-compose", "container"]},
    "Kubernetes": {"category": "DevOps", "keywords": ["kubernetes", "kubectl", "k8s", "helm", "pod"]},
    "PostgreSQL": {"category": "Database", "keywords": ["postgresql", "postgres", "pg", "psycopg"]},
    "MongoDB": {"category": "Database", "keywords": ["mongodb", "mongoose", "pymongo", "atlas"]},
    "Redis": {"category": "Database", "keywords": ["redis", "jedis", "ioredis"]},
    "MySQL": {"category": "Database", "keywords": ["mysql", "mariadb", "sequelize"]},
    "FastAPI": {"category": "Backend", "keywords": ["fastapi", "uvicorn", "starlette"]},
    "Django": {"category": "Backend", "keywords": ["django", "djangorestframework", "drf"]},
    "Flask": {"category": "Backend", "keywords": ["flask", "flask-restful", "werkzeug"]},
    "Node.js": {"category": "Backend", "keywords": ["nodejs", "express", "koa", "nestjs"]},
    "Spring Boot": {"category": "Backend", "keywords": ["spring-boot", "spring.io", "springboot"]},
    "GraphQL": {"category": "API", "keywords": ["graphql", "apollo", "hasura", "schema.graphql"]},
    "REST API": {"category": "API", "keywords": ["rest api", "openapi", "swagger", "endpoint"]},
    "TailwindCSS": {"category": "Frontend", "keywords": ["tailwind", "tailwindcss"]},
    "AWS": {"category": "Cloud", "keywords": ["aws", "amazon web services", "ec2", "s3", "lambda"]},
    "Azure": {"category": "Cloud", "keywords": ["azure", "microsoft azure"]},
    "GCP": {"category": "Cloud", "keywords": ["gcp", "google cloud", "bigquery"]},
    "TensorFlow": {"category": "AI/ML", "keywords": ["tensorflow", "keras", "tf2"]},
    "PyTorch": {"category": "AI/ML", "keywords": ["pytorch", "torch", "torchvision"]},
    "scikit-learn": {"category": "AI/ML", "keywords": ["sklearn", "scikit-learn", "machine learning"]},
    "Flutter": {"category": "Mobile", "keywords": ["flutter", "dart", "pubspec.yaml"]},
    "React Native": {"category": "Mobile", "keywords": ["react-native", "expo", "metro"]},
    "Git": {"category": "Tools", "keywords": ["git", "github", "gitlab", "bitbucket"]},
    "CI/CD": {"category": "DevOps", "keywords": ["github actions", "jenkins", "circleci", "travis", "gitlab-ci"]},
    "Nginx": {"category": "Infrastructure", "keywords": ["nginx", "reverse proxy"]},
    "Elasticsearch": {"category": "Database", "keywords": ["elasticsearch", "kibana", "logstash", "elk"]},
}

DEPENDENCY_FILES = {
    "package.json",
    "requirements.txt",
    "pyproject.toml",
    "pom.xml",
    "build.gradle",
    "build.gradle.kts",
    "composer.json",
    "go.mod",
    "Cargo.toml",
    "pubspec.yaml",
}

GITHUB_API_LANG_MAP = {
    "TypeScript": "TypeScript",
    "JavaScript": "JavaScript",
    "Python": "Python",
    "Java": "Java",
    "Kotlin": "Kotlin",
    "Go": "Go",
    "Rust": "Rust",
    "C#": "C#",
    "PHP": "PHP",
    "Swift": "Swift",
    "Dart": "Flutter",
    "Ruby": "Ruby",
    "Scala": "Scala",
    "HTML": "HTML",
    "CSS": "CSS",
    "SCSS": "CSS",
    "Shell": "Shell",
    "Dockerfile": "Docker",
}


# Funkcja służy do odczytywania właściciela i nazwy repozytorium z linku GitHub.
def github_headers() -> Dict[str, str]:
    headers = {"Accept": "application/vnd.github+json"}
    token = os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
        headers["X-GitHub-Api-Version"] = "2022-11-28"
    return headers


def parse_github_url(url: str) -> Tuple[str, str] | None:
    """Extract owner and repo from GitHub URL."""
    patterns = [
        r'github\.com[/:]([^/]+)/([^/\s\.]+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            owner = match.group(1)
            repo = match.group(2).replace('.git', '')
            return owner, repo
    return None


# Funkcja służy do pobierania technologii i metadanych projektu z GitHub API.
async def extract_from_github(repo_url: str) -> Dict:
    """Call GitHub API to get language statistics."""
    parsed = parse_github_url(repo_url)
    if not parsed:
        return {"technologies": [], "source": "github_parse_error", "has_cicd": False, "github": {}}

    owner, repo = parsed
    technologies = []
    has_cicd = False
    github = {
        "repo_created_at": None,
        "last_commit_at": None,
        "stars": None,
        "file_count": None,
        "analysis": {},
    }
    repo_analysis = {
        "readme_exists": False,
        "readme_size": 0,
        "gitignore_exists": False,
        "license_exists": False,
        "contributing_exists": False,
        "docker_exists": False,
        "file_count": 0,
        "contributors_count": 0,
        "has_tests_dir": False,
        "dependency_text": "",
    }
    default_branch = "main"
    headers = github_headers()

    async with httpx.AsyncClient(timeout=10.0) as client:
        # Get language bytes
        try:
            resp = await client.get(
                f"https://api.github.com/repos/{owner}/{repo}/languages",
                headers=headers
            )
            if resp.status_code == 200:
                lang_data = resp.json()
                total_bytes = sum(lang_data.values()) or 1
                for lang, bytes_count in lang_data.items():
                    tech_name = GITHUB_API_LANG_MAP.get(lang, lang)
                    confidence = round((bytes_count / total_bytes) * 100, 1)
                    if confidence > 1:
                        technologies.append({
                            "name": tech_name,
                            "confidence": confidence,
                            "bytes": bytes_count,
                            "category": get_category(tech_name)
                        })
        except Exception:
            pass

        # Check for CI/CD files
        try:
            resp = await client.get(
                f"https://api.github.com/repos/{owner}/{repo}/contents/.github/workflows",
                headers=headers
            )
            if resp.status_code == 200:
                has_cicd = True
        except Exception:
            pass

        # Get repo info for additional context
        try:
            resp = await client.get(
                f"https://api.github.com/repos/{owner}/{repo}",
                headers=headers
            )
            if resp.status_code == 200:
                repo_data = resp.json()
                github["stars"] = repo_data.get("stargazers_count")
                github["repo_created_at"] = repo_data.get("created_at")
                default_branch = repo_data.get("default_branch") or default_branch
                topics = repo_data.get("topics", [])
                for topic in topics:
                    for tech_name, tech_info in TECH_KEYWORDS.items():
                        if any(kw in topic.lower() for kw in tech_info["keywords"]):
                            if not any(t["name"] == tech_name for t in technologies):
                                technologies.append({
                                    "name": tech_name,
                                    "confidence": 60.0,
                                    "bytes": 0,
                                    "category": tech_info["category"]
                                })
        except Exception:
            pass

        # Last commit date
        try:
            resp = await client.get(
                f"https://api.github.com/repos/{owner}/{repo}/commits",
                params={"per_page": 1},
                headers=headers
            )
            if resp.status_code == 200:
                commits = resp.json()
                if commits:
                    github["last_commit_at"] = commits[0].get("commit", {}).get("committer", {}).get("date")
        except Exception:
            pass

        # Repository file count. Store exact count up to 50 and 51 as "50+" marker.
        try:
            resp = await client.get(
                f"https://api.github.com/repos/{owner}/{repo}/git/trees/{default_branch}",
                params={"recursive": "1"},
                headers=headers
            )
            if resp.status_code == 200:
                tree = resp.json().get("tree", [])
                file_count = sum(1 for item in tree if item.get("type") == "blob")
                github["file_count"] = 51 if file_count > 50 else file_count
                repo_analysis.update(_analyze_repository_tree(tree))
        except Exception:
            pass

        await _enrich_repository_analysis(client, owner, repo, default_branch, headers, repo_analysis, technologies)

    github["analysis"] = repo_analysis
    technologies.sort(key=lambda x: x["confidence"], reverse=True)
    return {"technologies": technologies, "source": "github_api", "has_cicd": has_cicd, "github": github}


# Funkcja sluzy do analizowania listy plikow repozytorium potrzebnej dla scoringu.
def _analyze_repository_tree(tree: List[Dict]) -> Dict:
    paths = [item.get("path", "") for item in tree if item.get("path")]
    lower_paths = [path.lower() for path in paths]
    root_or_nested_parts = {part for path in lower_paths for part in path.split("/")}
    file_names = {Path(path).name.lower() for path in lower_paths}
    dependency_paths = [path for path in paths if Path(path).name in DEPENDENCY_FILES]

    file_count = sum(1 for item in tree if item.get("type") == "blob")
    return {
        "readme_exists": any(name in {"readme.md", "readme.markdown", "readme.txt"} for name in file_names),
        "gitignore_exists": ".gitignore" in file_names,
        "license_exists": any(name in {"license", "license.md", "license.txt"} for name in file_names),
        "contributing_exists": any(name in {"contributing.md", "contributing.txt"} for name in file_names),
        "docker_exists": any(
            name == "dockerfile"
            or name.endswith(".dockerfile")
            or name in {"docker-compose.yml", "docker-compose.yaml", "compose.yml", "compose.yaml"}
            for name in file_names
        ),
        "file_count": file_count,
        "has_tests_dir": bool(root_or_nested_parts & {"tests", "__tests__", "spec", "test"}),
        "dependency_paths": dependency_paths,
    }


# Funkcja sluzy do doczytywania README, zaleznosci i liczby contributorow z GitHub API.
async def _enrich_repository_analysis(
    client: httpx.AsyncClient,
    owner: str,
    repo: str,
    branch: str,
    headers: Dict[str, str],
    repo_analysis: Dict,
    technologies: List[Dict],
):
    dependency_parts = []
    for path in repo_analysis.get("dependency_paths", [])[:20]:
        content = await _fetch_github_file(client, owner, repo, branch, path, headers)
        if content:
            dependency_parts.append(content[:20000])
            _merge_detected_technologies(technologies, extract_from_text(content).get("technologies", []))

    readme_text = ""
    for readme_name in ("README.md", "readme.md", "README.markdown", "README.txt"):
        readme_text = await _fetch_github_file(client, owner, repo, branch, readme_name, headers)
        if readme_text:
            break

    repo_analysis["readme_exists"] = repo_analysis.get("readme_exists") or bool(readme_text)
    repo_analysis["readme_size"] = len(readme_text)
    repo_analysis["dependency_text"] = " ".join(dependency_parts).lower()
    repo_analysis["contributors_count"] = await _get_contributors_count(client, owner, repo, headers)


# Funkcja sluzy do pobierania pliku z GitHub API jako tekst.
async def _fetch_github_file(
    client: httpx.AsyncClient,
    owner: str,
    repo: str,
    branch: str,
    path: str,
    headers: Dict[str, str],
) -> str:
    try:
        resp = await client.get(
            f"https://api.github.com/repos/{owner}/{repo}/contents/{quote(path, safe='/')}",
            params={"ref": branch},
            headers=headers,
        )
        if resp.status_code != 200:
            return ""
        data = resp.json()
        if isinstance(data, dict) and data.get("encoding") == "base64" and data.get("content"):
            return base64.b64decode(data["content"]).decode("utf-8", errors="ignore")
        if isinstance(data, dict) and data.get("download_url"):
            raw_resp = await client.get(data["download_url"], headers=headers)
            if raw_resp.status_code == 200:
                return raw_resp.text
    except Exception:
        return ""
    return ""


# Funkcja sluzy do pobierania liczby contributorow repozytorium.
async def _get_contributors_count(client: httpx.AsyncClient, owner: str, repo: str, headers: Dict[str, str]) -> int:
    try:
        resp = await client.get(
            f"https://api.github.com/repos/{owner}/{repo}/contributors",
            params={"per_page": 100, "anon": "true"},
            headers=headers,
        )
        if resp.status_code == 200:
            data = resp.json()
            return len(data) if isinstance(data, list) else 0
    except Exception:
        return 0
    return 0


# Funkcja sluzy do laczenia technologii wykrytych z plikow zaleznosci z lista technologii projektu.
def _merge_detected_technologies(technologies: List[Dict], detected: List[Dict]):
    known = {item.get("name") for item in technologies}
    for item in detected:
        if item.get("name") not in known:
            technologies.append(item)
            known.add(item.get("name"))


# Funkcja służy do wykrywania technologii na podstawie tekstu.
def extract_from_text(text: str) -> Dict:
    """Scan text for technology keywords and compute confidence."""
    text_lower = text.lower()
    found = []
    has_cicd = any(kw in text_lower for kw in ["github actions", "jenkins", "circleci", "gitlab-ci", ".github/workflows"])

    for tech_name, tech_info in TECH_KEYWORDS.items():
        hits = sum(text_lower.count(kw) for kw in tech_info["keywords"])
        if hits > 0:
            # Confidence based on frequency: 1 hit = 40%, 2+ = 70%, 5+ = 90%
            if hits >= 5:
                confidence = 90.0
            elif hits >= 2:
                confidence = 70.0
            else:
                confidence = 40.0
            found.append({
                "name": tech_name,
                "confidence": confidence,
                "bytes": 0,
                "category": tech_info["category"]
            })

    found.sort(key=lambda x: x["confidence"], reverse=True)
    return {"technologies": found[:15], "source": "text_analysis", "has_cicd": has_cicd}


# Funkcja służy do wykrywania technologii na podstawie zawartości pliku package.json.
def extract_from_package_json(content: str) -> Dict:
    """Parse package.json for framework detection."""
    try:
        data = json.loads(content)
        deps = {}
        deps.update(data.get("dependencies", {}))
        deps.update(data.get("devDependencies", {}))
        deps_str = " ".join(deps.keys()).lower()

        found = []
        for tech_name, tech_info in TECH_KEYWORDS.items():
            hits = sum(deps_str.count(kw) for kw in tech_info["keywords"])
            if hits > 0:
                confidence = min(100.0, 60.0 + hits * 10)
                found.append({
                    "name": tech_name,
                    "confidence": confidence,
                    "bytes": 0,
                    "category": tech_info["category"]
                })
        return {"technologies": found, "source": "package_json", "has_cicd": False}
    except Exception:
        return {"technologies": [], "source": "package_json_error", "has_cicd": False}


# Funkcja służy do zwracania kategorii dla podanej technologii.
def get_category(tech_name: str) -> str:
    return TECH_KEYWORDS.get(tech_name, {}).get("category", "Other")


# Funkcja służy do wybierania najlepszego sposobu wykrywania technologii projektu.
async def extract_technologies(
    repo_url: str | None = None,
    file_content: str | None = None,
    file_type: str | None = None,
    description: str | None = None
) -> Dict:
    """Main extraction entry point."""
    if repo_url and "github.com" in repo_url:
        result = await extract_from_github(repo_url)
        github_meta = result.get("github", {})
        if result["technologies"] or any(value is not None for value in github_meta.values()):
            return result

    if file_content:
        if file_type == "package.json":
            return extract_from_package_json(file_content)
        else:
            return extract_from_text(file_content)

    if description:
        return extract_from_text(description)

    return {"technologies": [], "source": "none", "has_cicd": False}
