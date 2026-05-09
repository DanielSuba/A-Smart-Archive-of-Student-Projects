"""
Automatyczne testy jednostkowe i integracyjne.
Uruchomienie: pytest tests/ -v
"""
import pytest
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

os.environ["DATABASE_URL"] = "sqlite:///./test_archiwum.db"

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

TEST_DB_URL = "sqlite:///./test_archiwum.db"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

from database import Base, get_db
Base.metadata.create_all(bind=test_engine)

# Funkcja służy do podmieniania sesji bazy danych na testową.
def override_get_db():
    db = TestSession()
    try:
        yield db
    finally:
        db.close()

from main import app
app.dependency_overrides[get_db] = override_get_db

from fastapi.testclient import TestClient


# Funkcja służy do tworzenia klienta testowego aplikacji.
@pytest.fixture(scope="module")
def client():
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c


# Funkcja służy do przygotowania nagłówków autoryzacji dla testów.
@pytest.fixture(scope="module")
def auth_headers(client):
    client.post("/api/auth/register", json={
        "email": "test@test.pl", "name": "Test Student",
        "password": "test123", "role": "STUDENT"
    })
    resp = client.post("/api/auth/login", json={"email": "test@test.pl", "password": "test123"})
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# Funkcja służy do testowania zapisu projektu z krótkim opisem.
def test_short_description_saves_successfully(client, auth_headers):
    resp = client.post("/api/projects", data={
        "title": "Test projekt", "description": "Jeden zdanie.",
        "role": "Developer",
        "repo_url": "https://github.com/test/repo",
    }, headers=auth_headers)
    assert resp.status_code == 200


# Funkcja służy do testowania blokady zapisu bez repozytorium.
def test_missing_repo_blocks_save(client, auth_headers):
    resp = client.post("/api/projects", data={
        "title": "Projekt bez źródła",
        "description": "Pierwsze zdanie jest tutaj. Drugie zdanie opisuje projekt. Trzecie zdanie to koniec.",
        "role": "Developer",
    }, headers=auth_headers)
    assert resp.status_code == 400


# Funkcja służy do testowania poprawnego zapisu projektu.
def test_valid_project_saves_successfully(client, auth_headers):
    resp = client.post("/api/projects", data={
        "title": "Poprawny projekt testowy",
        "description": "Pierwsza część opisu projektu. Projekt realizuje ważne cele edukacyjne. Backend oparty jest na FastAPI z bazą PostgreSQL.",
        "role": "Fullstack Developer",
        "repo_url": "https://github.com/test/valid",
    }, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["difficulty_score"] >= 0


# Funkcja służy do testowania wykrywania technologii z tekstu.
def test_technology_extractor_detects_correctly():
    from services.tech_extractor import extract_from_text
    result = extract_from_text("React frontend Docker containerization FastAPI backend PostgreSQL database.")
    assert len(result["technologies"]) >= 1
    for t in result["technologies"]:
        assert 0 <= t["confidence"] <= 100


# Funkcja służy do testowania zmiany oceny trudności zależnie od parametrów.
def test_difficulty_scoring_changes_with_params():
    from services.difficulty_scorer import calculate_difficulty
    simple = calculate_difficulty([], "Prosty projekt.", False, None)
    complex_r = calculate_difficulty(
        [{"name": "Docker", "confidence": 80}, {"name": "Kubernetes", "confidence": 70}],
        "Architektura mikroserwisów z bazą danych i testami jednostkowymi.", True,
        "https://github.com/test/complex",
    )
    assert complex_r["score"] > simple["score"]


# Funkcja służy do testowania aktualizacji profilu kompetencji po dodaniu projektu.
def test_skill_profile_updates_after_project(client, auth_headers):
    client.post("/api/projects", data={
        "title": "Projekt Spring Boot",
        "description": "Aplikacja enterprise w Java. Architektura MVC z testami JUnit. Wdrożenie na serwerze.",
        "role": "Backend Developer",
        "repo_url": "https://github.com/test/java",
    }, headers=auth_headers)
    resp = client.get("/api/profile", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["total_projects"] >= 1


# Funkcja służy do testowania tworzenia portfolio.
def test_portfolio_generator_creates_portfolio(client, auth_headers):
    p_resp = client.get("/api/projects/my", headers=auth_headers)
    projects = p_resp.json()["items"]
    if not projects:
        pytest.skip("Brak projektów")
    resp = client.post("/api/portfolios", json={
        "title": "Test Portfolio", "description": "Opis",
        "project_ids": [projects[0]["id"]]
    }, headers=auth_headers)
    assert resp.status_code == 200
    assert "public_slug" in resp.json()


# Funkcja służy do testowania limitu liczby projektów na stronie.
def test_pagination_returns_max_10(client):
    resp = client.get("/api/projects?page=1&per_page=10")
    assert resp.status_code == 200
    assert len(resp.json()["items"]) <= 10


# Funkcja służy do testowania dostępności endpointu zdrowia aplikacji.
def test_health_endpoint_available(client):
    assert client.get("/api/health").json()["status"] == "ok"


# Funkcja służy do testowania wymagania autoryzacji JWT.
def test_auth_jwt_required(client):
    assert client.get("/api/profile").status_code == 401
    assert client.get("/api/projects/my").status_code == 401


# Funkcja służy do testowania wykrywania technologii z package.json.
def test_extract_from_package_json():
    from services.tech_extractor import extract_from_package_json
    pkg = '{"dependencies": {"react": "^18.0.0", "typescript": "^5.0.0"}}'
    names = [t["name"] for t in extract_from_package_json(pkg)["technologies"]]
    assert any(n in names for n in ["React", "TypeScript"])


# Funkcja służy do testowania parsowania linków GitHub.
def test_github_url_parsing():
    from services.tech_extractor import parse_github_url
    assert parse_github_url("https://github.com/microsoft/vscode") == ("microsoft", "vscode")
    assert parse_github_url("https://github.com/user/repo.git")[1] == "repo"
    assert parse_github_url("https://gitlab.com/user/repo") is None
