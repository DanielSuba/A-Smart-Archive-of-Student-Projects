from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean, Enum as SAEnum, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import enum
import os

# Absolute path — always resolves to backend/ dir regardless of CWD
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
_DEFAULT_DB = f"sqlite:///{os.path.join(_BASE_DIR, 'archiwum.db')}"
DATABASE_URL = os.getenv("DATABASE_URL", _DEFAULT_DB)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class UserRole(str, enum.Enum):
    STUDENT = "STUDENT"
    ADMIN = "ADMIN"
    GUEST = "GUEST"


class DifficultyLevel(str, enum.Enum):
    BEGINNER = "Początkujący"
    INTERMEDIATE = "Średni"
    ADVANCED = "Zaawansowany"
    EXPERT = "Ekspert"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.STUDENT)
    created_at = Column(DateTime, default=datetime.utcnow)
    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")
    portfolios = relationship("Portfolio", back_populates="owner", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    year = Column(Integer, nullable=False)
    role = Column(String, nullable=False)
    repo_url = Column(String, nullable=True)
    doc_file_path = Column(String, nullable=True)
    difficulty_score = Column(Float, default=0.0)
    difficulty_level = Column(String, default=DifficultyLevel.BEGINNER)
    has_cicd = Column(Boolean, default=False)
    github_repo_created_at = Column(DateTime, nullable=True)
    github_last_commit_at = Column(DateTime, nullable=True)
    github_stars = Column(Integer, nullable=True)
    github_file_count = Column(Integer, nullable=True)
    ai_doc_status = Column(String, nullable=True)
    ai_doc_evaluation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    owner = relationship("User", back_populates="projects")
    technologies = relationship("ProjectTechnology", back_populates="project", cascade="all, delete-orphan")
    portfolio_items = relationship("PortfolioProject", back_populates="project")


class Technology(Base):
    __tablename__ = "technologies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=True)
    projects = relationship("ProjectTechnology", back_populates="technology")


class ProjectTechnology(Base):
    __tablename__ = "project_technologies"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    tech_id = Column(Integer, ForeignKey("technologies.id"), nullable=False)
    confidence_level = Column(Float, default=1.0)
    bytes_count = Column(Integer, default=0)
    project = relationship("Project", back_populates="technologies")
    technology = relationship("Technology", back_populates="projects")


class Portfolio(Base):
    __tablename__ = "portfolios"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    public_slug = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    owner = relationship("User", back_populates="portfolios")
    projects = relationship("PortfolioProject", back_populates="portfolio", cascade="all, delete-orphan")


class PortfolioProject(Base):
    __tablename__ = "portfolio_projects"
    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    order_index = Column(Integer, default=0)
    portfolio = relationship("Portfolio", back_populates="projects")
    project = relationship("Project", back_populates="portfolio_items")


# Funkcja służy do udostępniania sesji bazy danych dla requestów FastAPI.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Funkcja służy do inicjalizacji tabel i brakujących kolumn w bazie danych.
def init_db():
    Base.metadata.create_all(bind=engine)
    _ensure_project_columns()


# Funkcja służy do dodawania brakujących kolumn projektu w istniejącej bazie.
def _ensure_project_columns():
    inspector = inspect(engine)
    if "projects" not in inspector.get_table_names():
        return
    existing = {col["name"] for col in inspector.get_columns("projects")}
    columns = {
        "github_repo_created_at": "DATETIME",
        "github_last_commit_at": "DATETIME",
        "github_stars": "INTEGER",
        "github_file_count": "INTEGER",
        "ai_doc_status": "VARCHAR",
        "ai_doc_evaluation": "TEXT",
    }
    with engine.begin() as conn:
        for name, sql_type in columns.items():
            if name not in existing:
                conn.execute(text(f"ALTER TABLE projects ADD COLUMN {name} {sql_type}"))
