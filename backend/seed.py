"""
Seed script: Creates 25 demo projects across multiple students.
Run: python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, Base, engine, User, Project, Technology, ProjectTechnology, Portfolio, PortfolioProject, UserRole
from auth import get_password_hash
import random

Base.metadata.create_all(bind=engine)

DEMO_USERS = [
    {"email": "anna.kowalska@student.pl", "name": "Anna Kowalska", "password": "demo123", "role": "STUDENT"},
    {"email": "piotr.nowak@student.pl", "name": "Piotr Nowak", "password": "demo123", "role": "STUDENT"},
    {"email": "marta.wisniewska@student.pl", "name": "Marta Wiśniewska", "password": "demo123", "role": "STUDENT"},
    {"email": "admin@archiwum.pl", "name": "Administrator", "password": "admin123", "role": "ADMIN"},
]

DEMO_PROJECTS = [
    {
        "title": "System zarządzania biblioteką",
        "description": "Aplikacja webowa do zarządzania zasobami biblioteki akademickiej. System umożliwia wypożyczanie, zwrot i rezerwację książek przez studentów. Backend oparty na FastAPI z bazą PostgreSQL zapewnia niezawodność i wydajność.",
        "year": 2023, "role": "Fullstack Developer",
        "repo_url": "https://github.com/demo/library-system",
        "techs": [("Python", "Language", 85.0), ("FastAPI", "Backend", 75.0), ("PostgreSQL", "Database", 70.0), ("React", "Frontend", 60.0)],
        "difficulty": 52.0, "level": "Średni", "has_cicd": True,
    },
    {
        "title": "E-commerce sklep z elektroniką",
        "description": "Platforma sprzedażowa z pełną obsługą płatności i koszyka zakupowego. Projekt zawiera zaawansowany system filtrowania produktów oraz panel administracyjny. Wdrożono mikrousługi do obsługi zamówień i płatności.",
        "year": 2024, "role": "Backend Developer",
        "repo_url": "https://github.com/demo/ecommerce-shop",
        "techs": [("Node.js", "Backend", 80.0), ("TypeScript", "Language", 75.0), ("React", "Frontend", 70.0), ("PostgreSQL", "Database", 65.0), ("Redis", "Database", 50.0), ("Docker", "DevOps", 60.0)],
        "difficulty": 72.0, "level": "Zaawansowany", "has_cicd": True,
    },
    {
        "title": "Aplikacja do śledzenia fitness",
        "description": "Mobilna aplikacja Flutter do monitorowania aktywności fizycznej i diety użytkownika. Integracja z Google Fit API pozwala na synchronizację danych z urządzeń wearable. System powiadomień push motywuje użytkowników do regularnych treningów.",
        "year": 2024, "role": "Mobile Developer",
        "repo_url": "https://github.com/demo/fitness-tracker",
        "techs": [("Flutter", "Mobile", 90.0), ("Dart", "Language", 85.0), ("REST API", "API", 60.0), ("PostgreSQL", "Database", 45.0)],
        "difficulty": 58.0, "level": "Zaawansowany", "has_cicd": False,
    },
    {
        "title": "Analizator sentymentu recenzji filmowych",
        "description": "System NLP do automatycznej analizy sentymentu recenzji filmowych ze stron IMDb i Filmweb. Model oparty na bibliotece BERT osiąga dokładność 92% na zbiorze testowym. Wyniki wizualizowane są w interaktywnym dashboardzie.",
        "year": 2023, "role": "Data Scientist",
        "repo_url": "https://github.com/demo/sentiment-analyzer",
        "techs": [("Python", "Language", 90.0), ("TensorFlow", "AI/ML", 75.0), ("scikit-learn", "AI/ML", 70.0), ("Flask", "Backend", 45.0), ("Docker", "DevOps", 40.0)],
        "difficulty": 78.0, "level": "Zaawansowany", "has_cicd": True,
    },
    {
        "title": "Platforma edukacyjna online",
        "description": "Kompleksowa platforma e-learningowa z systemem kursów wideo, quizów i certyfikatów. Architektura oparta na mikrousługach zapewnia skalowalność do 10000 jednoczesnych użytkowników. System oceniania automatycznie generuje certyfikaty PDF po ukończeniu kursu.",
        "year": 2024, "role": "Fullstack Developer",
        "repo_url": "https://github.com/demo/edu-platform",
        "techs": [("React", "Frontend", 80.0), ("TypeScript", "Language", 75.0), ("Node.js", "Backend", 70.0), ("PostgreSQL", "Database", 65.0), ("AWS", "Cloud", 55.0), ("Docker", "DevOps", 60.0), ("Kubernetes", "DevOps", 40.0)],
        "difficulty": 88.0, "level": "Ekspert", "has_cicd": True,
    },
    {
        "title": "Kalkulator budżetu domowego",
        "description": "Prosta aplikacja webowa do śledzenia wydatków i przychodów domowych. Użytkownik może kategoryzować transakcje i generować raporty miesięczne. Projekt zrealizowany jako SPA bez backendu z localStorage.",
        "year": 2022, "role": "Frontend Developer",
        "repo_url": "https://github.com/demo/budget-app",
        "techs": [("JavaScript", "Language", 90.0), ("HTML/CSS", "Frontend", 85.0), ("Vue.js", "Frontend", 70.0)],
        "difficulty": 22.0, "level": "Początkujący", "has_cicd": False,
    },
    {
        "title": "System monitorowania IoT dla smart home",
        "description": "Platforma do zbierania i wizualizacji danych z czujników IoT w inteligentnym domu. MQTT broker obsługuje komunikację z urządzeniami w czasie rzeczywistym. Dashboard w Grafanie wyświetla metryki temperatury, wilgotności i zużycia energii.",
        "year": 2024, "role": "IoT Developer",
        "repo_url": "https://github.com/demo/iot-smarthome",
        "techs": [("Python", "Language", 75.0), ("Docker", "DevOps", 65.0), ("PostgreSQL", "Database", 60.0), ("Redis", "Database", 55.0), ("Kubernetes", "DevOps", 35.0)],
        "difficulty": 82.0, "level": "Ekspert", "has_cicd": True,
    },
    {
        "title": "Generator raportów PDF",
        "description": "Microservice do automatycznego generowania raportów finansowych w formacie PDF. Szablon Jinja2 pozwala na dynamiczne wypełnianie danych. REST API umożliwia integrację z innymi systemami firmy.",
        "year": 2023, "role": "Backend Developer",
        "repo_url": "https://github.com/demo/pdf-generator",
        "techs": [("Python", "Language", 85.0), ("FastAPI", "Backend", 70.0), ("Docker", "DevOps", 50.0)],
        "difficulty": 38.0, "level": "Średni", "has_cicd": False,
    },
    {
        "title": "Aplikacja do nauki języków obcych",
        "description": "Gamifikowana aplikacja mobilna do nauki słownictwa w 12 językach. System powtórzeń rozłożonych w czasie (SRS) optymalizuje zapamiętywanie. Algorytm adaptacyjny dostosowuje trudność do postępów użytkownika.",
        "year": 2023, "role": "Mobile Developer",
        "repo_url": "https://github.com/demo/language-app",
        "techs": [("React Native", "Mobile", 85.0), ("TypeScript", "Language", 75.0), ("MongoDB", "Database", 55.0), ("Node.js", "Backend", 60.0)],
        "difficulty": 62.0, "level": "Zaawansowany", "has_cicd": True,
    },
    {
        "title": "Wizualizacja danych giełdowych",
        "description": "Interaktywny dashboard do analizy i wizualizacji danych ze światowych giełd papierów wartościowych. Dane pobierane są w czasie rzeczywistym z Yahoo Finance API. Wskaźniki techniczne jak RSI, MACD obliczane są po stronie serwera.",
        "year": 2023, "role": "Data Engineer",
        "repo_url": "https://github.com/demo/stock-dashboard",
        "techs": [("Python", "Language", 80.0), ("React", "Frontend", 70.0), ("TypeScript", "Language", 65.0), ("FastAPI", "Backend", 60.0), ("Redis", "Database", 50.0)],
        "difficulty": 65.0, "level": "Zaawansowany", "has_cicd": False,
    },
    {
        "title": "Chatbot obsługi klienta",
        "description": "Inteligentny chatbot do automatycznej obsługi zapytań klientów sklepu internetowego. Model fine-tuned GPT-3.5 odpowiada na pytania dotyczące zamówień, zwrotów i produktów. Integracja z systemem CRM pozwala na personalizację odpowiedzi.",
        "year": 2024, "role": "AI Developer",
        "repo_url": "https://github.com/demo/customer-chatbot",
        "techs": [("Python", "Language", 85.0), ("FastAPI", "Backend", 70.0), ("React", "Frontend", 55.0), ("PostgreSQL", "Database", 50.0), ("Docker", "DevOps", 45.0)],
        "difficulty": 74.0, "level": "Zaawansowany", "has_cicd": True,
    },
    {
        "title": "System rezerwacji sal konferencyjnych",
        "description": "Aplikacja webowa do zarządzania rezerwacjami sal w budynku korporacyjnym. Kalendarz Google Calendar API synchronizuje się z systemem firmowym. Powiadomienia email wysyłane są automatycznie przy zbliżającej się rezerwacji.",
        "year": 2022, "role": "Fullstack Developer",
        "repo_url": "https://github.com/demo/room-booking",
        "techs": [("Angular", "Frontend", 75.0), ("TypeScript", "Language", 70.0), ("Spring Boot", "Backend", 65.0), ("Java", "Language", 80.0), ("PostgreSQL", "Database", 55.0)],
        "difficulty": 56.0, "level": "Zaawansowany", "has_cicd": False,
    },
    {
        "title": "Klasyfikator obrazów medycznych",
        "description": "System AI do wstępnej klasyfikacji zdjęć rentgenowskich pod kątem obecności pneumonii. Sieć neuronowa CNN trenowana na zbiorze 5000 obrazów osiąga AUC 0.94. Projekt realizowany we współpracy z kliniką radiologiczną.",
        "year": 2024, "role": "Machine Learning Engineer",
        "repo_url": "https://github.com/demo/medical-classifier",
        "techs": [("Python", "Language", 90.0), ("PyTorch", "AI/ML", 80.0), ("scikit-learn", "AI/ML", 65.0), ("FastAPI", "Backend", 50.0), ("Docker", "DevOps", 55.0)],
        "difficulty": 90.0, "level": "Ekspert", "has_cicd": True,
    },
    {
        "title": "Gra przeglądarkowa RPG",
        "description": "Wieloosobowa gra RPG działająca w przeglądarce z silnikiem Phaser.js. System walki turowej obsługuje do 4 graczy jednocześnie przez WebSocket. Postaci i ekwipunek przechowywane są w bazie MongoDB.",
        "year": 2023, "role": "Game Developer",
        "repo_url": "https://github.com/demo/browser-rpg",
        "techs": [("JavaScript", "Language", 85.0), ("Node.js", "Backend", 70.0), ("MongoDB", "Database", 65.0), ("Docker", "DevOps", 40.0)],
        "difficulty": 60.0, "level": "Zaawansowany", "has_cicd": False,
    },
    {
        "title": "API agregator wiadomości",
        "description": "Mikroserwis zbierający i kategoryzujący artykuły z 50 źródeł newsowych. Algorytm NLP automatycznie taguje artykuły według kategorii tematycznych. Cache Redis redukuje liczbę zapytań do zewnętrznych API o 80%.",
        "year": 2023, "role": "Backend Developer",
        "repo_url": "https://github.com/demo/news-aggregator",
        "techs": [("Python", "Language", 80.0), ("FastAPI", "Backend", 70.0), ("Redis", "Database", 65.0), ("PostgreSQL", "Database", 55.0), ("Docker", "DevOps", 60.0)],
        "difficulty": 64.0, "level": "Zaawansowany", "has_cicd": True,
    },
    {
        "title": "Klon Trello - zarządzanie zadaniami",
        "description": "Aplikacja do zarządzania projektami w stylu Kanban z obsługą tablic, list i kart. Drag and drop implementowany przy użyciu biblioteki react-beautiful-dnd. Real-time synchronizacja między użytkownikami przez WebSocket.",
        "year": 2023, "role": "Fullstack Developer",
        "repo_url": "https://github.com/demo/kanban-clone",
        "techs": [("React", "Frontend", 85.0), ("TypeScript", "Language", 75.0), ("Node.js", "Backend", 70.0), ("PostgreSQL", "Database", 60.0), ("Redis", "Database", 45.0)],
        "difficulty": 68.0, "level": "Zaawansowany", "has_cicd": True,
    },
    {
        "title": "Automatyzacja testów E2E",
        "description": "Framework do automatycznych testów end-to-end aplikacji webowych oparty na Playwright. Testy uruchamiane są automatycznie w pipeline CI/CD przy każdym pull requeście. Raporty HTML generowane są po każdym przebiegu testów.",
        "year": 2024, "role": "QA Engineer",
        "repo_url": "https://github.com/demo/e2e-framework",
        "techs": [("TypeScript", "Language", 80.0), ("Node.js", "Backend", 65.0), ("Docker", "DevOps", 60.0), ("CI/CD", "DevOps", 70.0)],
        "difficulty": 55.0, "level": "Zaawansowany", "has_cicd": True,
    },
    {
        "title": "Strona portfolio fotografa",
        "description": "Statyczna strona portfolio dla fotografa z galerią zdjęć w wysokiej rozdzielczości. Optymalizacja obrazów i lazy loading zapewniają szybkie ładowanie. Formularz kontaktowy wysyła wiadomości przez Netlify Forms.",
        "year": 2022, "role": "Frontend Developer",
        "repo_url": "https://github.com/demo/photo-portfolio",
        "techs": [("HTML/CSS", "Frontend", 90.0), ("JavaScript", "Language", 75.0), ("TailwindCSS", "Frontend", 65.0)],
        "difficulty": 18.0, "level": "Początkujący", "has_cicd": False,
    },
    {
        "title": "Mikroserwisowa platforma logistyczna",
        "description": "System zarządzania dostawami oparty na architekturze mikroserwisów z orkiestracją Kubernetes. Event sourcing z Apache Kafka zapewnia niezawodność komunikacji między serwisami. System obsługuje 50 000 przesyłek dziennie.",
        "year": 2024, "role": "Backend Architect",
        "repo_url": "https://github.com/demo/logistics-platform",
        "techs": [("Java", "Language", 80.0), ("Spring Boot", "Backend", 75.0), ("Kubernetes", "DevOps", 70.0), ("Docker", "DevOps", 65.0), ("PostgreSQL", "Database", 60.0), ("Redis", "Database", 55.0), ("Elasticsearch", "Database", 45.0)],
        "difficulty": 95.0, "level": "Ekspert", "has_cicd": True,
    },
    {
        "title": "Aplikacja do zamawiania jedzenia",
        "description": "Klon UberEats z pełną funkcjonalnością zamawiania jedzenia online. Geolokalizacja restauracji i tracking dostawy w czasie rzeczywistym przez GPS. Płatności obsługiwane przez integrację ze Stripe API.",
        "year": 2024, "role": "Fullstack Developer",
        "repo_url": "https://github.com/demo/food-delivery",
        "techs": [("React Native", "Mobile", 80.0), ("Node.js", "Backend", 75.0), ("TypeScript", "Language", 70.0), ("MongoDB", "Database", 60.0), ("Redis", "Database", 50.0), ("Docker", "DevOps", 55.0)],
        "difficulty": 76.0, "level": "Zaawansowany", "has_cicd": True,
    },
    {
        "title": "Blockchain dla certyfikatów akademickich",
        "description": "System wydawania i weryfikacji certyfikatów akademickich oparty na blockchain Ethereum. Smart contract Solidity przechowuje hash certyfikatu zapewniając niezmienność danych. Web3.js umożliwia weryfikację certyfikatów przez pracodawców.",
        "year": 2024, "role": "Blockchain Developer",
        "repo_url": "https://github.com/demo/cert-blockchain",
        "techs": [("JavaScript", "Language", 70.0), ("TypeScript", "Language", 65.0), ("Node.js", "Backend", 60.0), ("React", "Frontend", 55.0), ("PostgreSQL", "Database", 45.0)],
        "difficulty": 85.0, "level": "Ekspert", "has_cicd": False,
    },
    {
        "title": "Dashboard analityki e-commerce",
        "description": "Platforma BI do analizy danych sprzedażowych sklepu internetowego. Hurtownia danych w PostgreSQL przetwarza miliony rekordów transakcji. Interaktywne wykresy w Chart.js umożliwiają drill-down do poziomu produktu.",
        "year": 2023, "role": "Data Analyst",
        "repo_url": "https://github.com/demo/ecom-analytics",
        "techs": [("Python", "Language", 85.0), ("React", "Frontend", 70.0), ("TypeScript", "Language", 65.0), ("PostgreSQL", "Database", 75.0), ("FastAPI", "Backend", 60.0)],
        "difficulty": 66.0, "level": "Zaawansowany", "has_cicd": True,
    },
    {
        "title": "System powiadomień push",
        "description": "Serwis do wysyłania spersonalizowanych powiadomień push na urządzenia mobilne i desktopowe. Architektura kolejkowa z RabbitMQ obsługuje 100 000 wiadomości na godzinę. Panel administracyjny umożliwia segmentację odbiorców.",
        "year": 2023, "role": "Backend Developer",
        "repo_url": "https://github.com/demo/push-service",
        "techs": [("Go", "Language", 85.0), ("Docker", "DevOps", 70.0), ("Redis", "Database", 65.0), ("PostgreSQL", "Database", 55.0)],
        "difficulty": 72.0, "level": "Zaawansowany", "has_cicd": True,
    },
    {
        "title": "Wizualizacja sieci społecznościowej",
        "description": "Narzędzie do analizy i wizualizacji grafów sieci społecznościowych przy użyciu biblioteki D3.js. Algorytmy wykrywania społeczności (Louvain) identyfikują klastry użytkowników. Backend Python obsługuje grafy do 100 000 węzłów.",
        "year": 2023, "role": "Data Scientist",
        "repo_url": "https://github.com/demo/social-graph",
        "techs": [("JavaScript", "Language", 80.0), ("Python", "Language", 75.0), ("FastAPI", "Backend", 60.0), ("PostgreSQL", "Database", 55.0), ("scikit-learn", "AI/ML", 45.0)],
        "difficulty": 70.0, "level": "Zaawansowany", "has_cicd": False,
    },
    {
        "title": "Prosty blog osobisty",
        "description": "Minimalistyczny blog zbudowany przy użyciu generatora stron statycznych Jekyll. Artykuły pisane są w formacie Markdown i automatycznie konwertowane do HTML. Hosting na GitHub Pages zapewnia darmowe wdrożenie.",
        "year": 2022, "role": "Frontend Developer",
        "repo_url": "https://github.com/demo/personal-blog",
        "techs": [("HTML/CSS", "Frontend", 85.0), ("JavaScript", "Language", 60.0)],
        "difficulty": 15.0, "level": "Początkujący", "has_cicd": False,
    },
]


def seed():
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(User).count() > 0:
            print("Baza danych już zawiera dane. Pomijam seedowanie.")
            return

        print("Tworzenie użytkowników demonstracyjnych...")
        users = []
        for ud in DEMO_USERS:
            user = User(
                email=ud["email"],
                name=ud["name"],
                password_hash=get_password_hash(ud["password"]),
                role=UserRole.ADMIN if ud["role"] == "ADMIN" else UserRole.STUDENT,
            )
            db.add(user)
            users.append(user)
        db.flush()

        students = [u for u in users if u.role == UserRole.STUDENT]
        print(f"Tworzenie {len(DEMO_PROJECTS)} projektów demonstracyjnych...")

        for i, pd in enumerate(DEMO_PROJECTS):
            student = students[i % len(students)]
            project = Project(
                user_id=student.id,
                title=pd["title"],
                description=pd["description"],
                year=pd["year"],
                role=pd["role"],
                repo_url=pd["repo_url"],
                difficulty_score=pd["difficulty"],
                difficulty_level=pd["level"],
                has_cicd=pd.get("has_cicd", False),
                doc_file_path=f"uploads/demo_doc_{i+1}.pdf" if i < 10 else None,
            )
            db.add(project)
            db.flush()

            for tech_name, category, confidence in pd["techs"]:
                tech = db.query(Technology).filter(Technology.name == tech_name).first()
                if not tech:
                    tech = Technology(name=tech_name, category=category)
                    db.add(tech)
                    db.flush()
                pt = ProjectTechnology(
                    project_id=project.id,
                    tech_id=tech.id,
                    confidence_level=confidence,
                    bytes_count=int(confidence * 1000),
                )
                db.add(pt)

        db.flush()

        # Create 3 demo portfolios
        print("Tworzenie portfolio demonstracyjnych...")
        all_projects = db.query(Project).all()

        for s_idx, student in enumerate(students[:3]):
            student_projects = [p for p in all_projects if p.user_id == student.id][:3]
            if not student_projects:
                continue
            portfolio = Portfolio(
                user_id=student.id,
                public_slug=f"portfolio-demo-{s_idx + 1}",
                title=f"Portfolio {student.name}",
                description=f"Wybrane projekty {student.name} prezentujące umiejętności.",
            )
            db.add(portfolio)
            db.flush()
            for idx, proj in enumerate(student_projects):
                pp = PortfolioProject(portfolio_id=portfolio.id, project_id=proj.id, order_index=idx)
                db.add(pp)

        db.commit()
        print("✅ Seedowanie zakończone sukcesem!")
        print(f"   Użytkownicy: student1=anna.kowalska@student.pl / demo123")
        print(f"   Admin: admin@archiwum.pl / admin123")

    except Exception as e:
        db.rollback()
        print(f"❌ Błąd seedowania: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
