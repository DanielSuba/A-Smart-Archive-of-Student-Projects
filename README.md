# A Smart Archive of Student Projects

Inteligentne archiwum projektow studenckich to aplikacja webowa do gromadzenia, analizowania i prezentowania projektow programistycznych. System pozwala dodawac projekty z repozytoriow GitHub, automatycznie wykrywac technologie, obliczac zlozonosc projektu, oceniac dokumentacje z uzyciem lokalnego AI oraz generowac publiczne portfolio autora.

Projekt sklada sie z backendu w FastAPI oraz frontendu w React + TypeScript.

## Najwazniejsze funkcje

- Rejestracja i logowanie uzytkownikow.
- Dodawanie projektow z obowiazkowym linkiem do repozytorium GitHub.
- Opcjonalne dodawanie dokumentacji projektu.
- Automatyczne pobieranie informacji z GitHub API:
  - jezyki programowania,
  - data utworzenia repozytorium,
  - data ostatniego commita,
  - liczba gwiazdek,
  - liczba plikow w repozytorium,
  - wykrycie CI/CD.
- Automatyczne wykrywanie technologii i bibliotek.
- Heurystyczne obliczanie zlozonosci projektu bez gornego limitu punktow.
- Ocena dokumentacji przez lokalny model AI.
- Generowanie publicznego portfolio z opisem najlepszych projektow.
- Eksport portfolio do PDF przez funkcje drukowania przegladarki.
- Profil kompetencji uzytkownika z analiza technologii.
- Wielojezyczny interfejs: polski, angielski i litewski.

## Jak dziala system oceniania

Ocena projektu nie oznacza jakosci kodu, tylko jego zlozonosc techniczna. Program wykorzystuje zestaw regul punktowych:

- `+5` punktow bazowych za istnienie projektu.
- `+5` punktow za obecny README.
- `+4` punkty za `.gitignore`.
- `+4` punkty za rozbudowane README powyzej `300` znakow.
- `+3` punkty za `LICENSE` lub `CONTRIBUTING.md`.
- `+2` punkty za plik Dockera.
- Do `+10` punktow za technologie powyzej `20%` uzycia: `+8` za technologie i `-1` za kolejne progi dominacji tej technologii.
- `+3` punkty za kazda technologie powyzej `5%` uzycia.
- `+6` punktow za kazda z pierwszych dwoch technologii zaawansowanych, `+4` za kazda z kolejnych dwoch i `+2` za kazda nastepna, np. Kubernetes, TensorFlow, PyTorch, AWS, Rust.
- `+3` punkty za pierwsze trzy technologie sredniozaawansowane i `+1` za kazda kolejna, np. React, FastAPI, PostgreSQL, TypeScript, Python.
- `+1` punkt za technologie spoza listy zaawansowanych i sredniozaawansowanych.
- `+10` punktow za wykryte CI/CD.
- Do `+6` punktow za liczbe plikow w repozytorium, liczona progami co `10` plikow.
- Do `+6` punktow za contributorow, po `+2` punkty za osobe.
- Do `+10` punktow za architekture testowa: `+5` za katalog testow i `+5` za biblioteke testowa w zaleznosciach.

Wynik koncowy nie ma gornego limitu i jest mapowany na poziom trudnosci:

- `0-29`: Poczatkujacy
- `30-49`: Sredni
- `50-74`: Zaawansowany
- `75-99`: Ekspert
- `100-124`: Master
- `125+`: Legenda

## Integracja AI

Aplikacja wspiera lokalny model AI zgodny z API OpenAI/LM Studio. Domyslny endpoint:

```text
http://127.0.0.1:1234/v1/chat/completions
```

AI jest wykorzystywane w dwoch miejscach:

- `backend/services/doc_ai_evaluator.py` ocenia dokumentacje projektu. Model zwraca JSON z ocenami kompletności, czytelnosci, kontekstu biznesowego i uzasadnienia technologii.
- `backend/services/doc_ai_evaluator2.py` generuje opis portfolio po polsku na podstawie trzech najlepszych projektow.

Jesli lokalne AI nie jest dostepne, aplikacja nadal dziala. Ocena dokumentacji zostanie oznaczona jako niedostepna, a portfolio moze uzyc prostszego opisu awaryjnego.

Zmienne srodowiskowe dla AI:

```env
AI_DOC_EVALUATOR_URL=http://127.0.0.1:1234/v1/chat/completions
AI_DOC_EVALUATOR_MODEL=local-model
AI_PORTFOLIO_GENERATOR_URL=http://127.0.0.1:1234/v1/chat/completions
AI_PORTFOLIO_GENERATOR_MODEL=local-model
```

## Technologie

Backend:

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn
- python-jose
- passlib
- httpx
- PyPDF2
- python-multipart

Frontend:

- React
- TypeScript
- Vite
- React Router
- Axios
- Recharts
- React Hot Toast
- Lucide React

Baza danych:

- Domyslnie SQLite
- Opcjonalnie PostgreSQL przez `docker-compose.yml`

## Struktura projektu

```text
.
├── backend/
│   ├── main.py                  # Start aplikacji FastAPI
│   ├── database.py              # Modele SQLAlchemy i polaczenie z baza
│   ├── auth.py                  # Autoryzacja, JWT i hasla
│   ├── schemas.py               # Schematy Pydantic
│   ├── routers/                 # Endpointy API
│   ├── services/                # Logika analizy, scoringu i AI
│   ├── tests/                   # Testy backendu
│   └── uploads/                 # Wgrane dokumentacje projektow
├── frontend-src/
│   ├── src/
│   │   ├── pages/               # Strony aplikacji
│   │   ├── components/          # Komponenty UI
│   │   ├── contexts/            # Auth i jezyki
│   │   ├── services/            # Komunikacja z API
│   │   ├── locales/             # Tlumaczenia
│   │   └── types/               # Typy TypeScript
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml           # Opcjonalny PostgreSQL
└── README.md
```

## Baza danych

Domyslna baza danych to SQLite:

```text
backend/archiwum.db
```

Adres bazy jest ustawiany w `backend/database.py`. Jesli zmienna `DATABASE_URL` nie zostanie podana, aplikacja automatycznie uzywa lokalnego pliku SQLite.

Przy starcie backendu program tworzy brakujace tabele i kolumny. Pusta baza pozostaje pusta do momentu dodania uzytkownikow, projektow i portfolio przez aplikacje.

## Uruchomienie projektu

### Uruchomienie przez Docker

Najprostszy sposob uruchomienia calego systemu jako serwera:

```bash
docker compose up --build
```

Po starcie kontenerow aplikacja bedzie dostepna pod adresem:

```text
http://localhost:8080
```

Backend bedzie dostepny bezposrednio pod adresem:

```text
http://localhost:8000
```

Docker uruchamia trzy uslugi:

- `frontend` - zbudowany React serwowany przez Nginx.
- `backend` - API FastAPI.
- `postgres` - baza PostgreSQL 16.

Wgrane dokumentacje projektow sa przechowywane w wolumenie `backend_uploads`, a dane PostgreSQL w wolumenie `postgres_data`.

Jesli lokalne AI dziala w LM Studio na komputerze hosta, kontener backendu laczy sie z nim przez:

```text
http://host.docker.internal:1234/v1/chat/completions
```

Zatrzymanie kontenerow:

```bash
docker compose down
```

Zatrzymanie kontenerow razem z usunieciem danych bazy:

```bash
docker compose down -v
```

### 1. Backend

Przejdz do katalogu backendu:

```bash
cd backend
```

Utworz i aktywuj srodowisko wirtualne:

```bash
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

Linux/macOS:

```bash
source .venv/bin/activate
```

Zainstaluj zaleznosci:

```bash
pip install -r requirements.txt
```

Uruchom backend:

```bash
python main.py
```

API bedzie dostepne pod adresem:

```text
http://localhost:8000
```

Status API:

```text
http://localhost:8000/api/health
```

### 2. Frontend

W drugim terminalu przejdz do katalogu frontendu:

```bash
cd frontend-src
```

Zainstaluj zaleznosci:

```bash
npm install
```

Uruchom frontend:

```bash
npm run dev
```

Aplikacja bedzie dostepna pod adresem:

```text
http://localhost:5173
```

### 3. Opcjonalnie PostgreSQL

Repozytorium zawiera `docker-compose.yml` z usluga PostgreSQL:

```bash
docker compose up -d
```

Aby aplikacja uzyla PostgreSQL zamiast SQLite, trzeba ustawic odpowiedni `DATABASE_URL`.

Przyklad:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/archiwum
```

## Testy

Testy backendu mozna uruchomic z katalogu `backend`:

```bash
pytest
```

Build frontendu:

```bash
cd frontend-src
npm run build
```

## Glowne endpointy API

- `POST /api/auth/register` - rejestracja
- `POST /api/auth/login` - logowanie
- `GET /api/auth/me` - aktualny uzytkownik
- `GET /api/projects` - lista projektow
- `POST /api/projects` - dodanie projektu
- `GET /api/projects/{id}` - szczegoly projektu
- `POST /api/projects/{id}/analyze` - ponowna analiza projektu
- `GET /api/profile` - profil kompetencji
- `POST /api/portfolios` - generowanie portfolio
- `GET /api/portfolios/{slug}` - publiczne portfolio
- `GET /api/technologies` - lista technologii

## Autorzy i przeznaczenie

Projekt powstal jako system wspierajacy archiwizacje i prezentacje projektow studenckich. Jego celem jest pokazanie, ze prace studentow mozna nie tylko przechowywac, ale tez automatycznie analizowac, oceniac pod katem zlozonosci i prezentowac w formie profesjonalnego portfolio.

## Mozliwe kierunki rozwoju

- Dokladniejsza analiza struktury repozytorium.
- Rozbudowanie systemu oceniania o testy, architekture i jakosc dokumentacji.
- Pelna migracja produkcyjna na PostgreSQL.
- Lepsza obsluga prywatnych repozytoriow GitHub.
- Generowanie bardziej zaawansowanych raportow PDF.
- Panel administracyjny z dodatkowymi statystykami.
